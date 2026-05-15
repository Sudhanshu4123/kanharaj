package com.luxeestates.controller;

import com.luxeestates.model.Seller;
import com.luxeestates.model.Transaction;
import com.luxeestates.model.User;
import com.luxeestates.repository.SellerRepository;
import com.luxeestates.repository.TransactionRepository;
import com.luxeestates.repository.UserRepository;
import com.luxeestates.security.CustomUserDetails;
import com.luxeestates.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private SellerRepository sellerRepository;

    @Autowired
    private EmailService emailService;

    @Value("${seller.url:http://localhost:3001}")
    private String sellerUrl;

    @Value("${razorpay.key.id:rzp_test_SpDgwQDb3VVlJ9}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret:bL01i7L47qVC7afUkPj9AUPy}")
    private String razorpayKeySecret;

    // STEP 1: Create Order for Razorpay
    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> data) {
        try {
            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            Double amount = Double.valueOf(data.get("amount").toString());
            
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", (int)(amount * 100)); // amount in paise
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "txn_" + System.currentTimeMillis());

            Order order = razorpay.orders.create(orderRequest);

            return ResponseEntity.ok(Map.of(
                "orderId", order.get("id"),
                "amount", order.get("amount"),
                "currency", order.get("currency")
            ));
        } catch (RazorpayException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Razorpay Error: " + e.getMessage()));
        }
    }

    // STEP 2: Verify Payment & Create/Update Seller
    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, Object> payload) {

        if (userDetails == null) return ResponseEntity.status(401).body("Unauthorized");

        String orderId = (String) payload.get("razorpay_order_id");
        String paymentId = (String) payload.get("razorpay_payment_id");
        String signature = (String) payload.get("razorpay_signature");
        String plan = (String) payload.get("plan");
        Integer months = (Integer) payload.get("months");
        Double amount = Double.valueOf(payload.get("amount").toString());

        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", orderId);
            options.put("razorpay_payment_id", paymentId);
            options.put("razorpay_signature", signature);

            boolean isValid = Utils.verifyPaymentSignature(options, razorpayKeySecret);
            if (!isValid) {
                return ResponseEntity.status(400).body(Map.of("message", "Invalid Payment Signature"));
            }
        } catch (RazorpayException e) {
            return ResponseEntity.status(500).body(Map.of("message", "Signature verification failed"));
        }

        User user = userRepository.findById(userDetails.getId()).orElseThrow();

        // 1. Save Transaction
        Transaction transaction = Transaction.builder()
                .user(user)
                .razorpayOrderId(orderId)
                .razorpayPaymentId(paymentId)
                .amount(amount)
                .planName(plan)
                .status("SUCCESS")
                .build();
        transactionRepository.save(transaction);

        // 2. Create or Update Seller Profile
        Seller seller = sellerRepository.findByUserId(user.getId())
                .orElse(Seller.builder().user(user).companyName(user.getName() + " Estates").build());
        
        seller.setSubscriptionPlan(plan.toUpperCase());
        
        LocalDateTime currentExpiry = seller.getSubscriptionExpiry();
        if (currentExpiry == null || currentExpiry.isBefore(LocalDateTime.now())) {
            currentExpiry = LocalDateTime.now();
        }
        seller.setSubscriptionExpiry(currentExpiry.plusMonths(months));
        seller.setStatus("ACTIVE");
        
        sellerRepository.save(seller);

        // 3. Ensure user has SELLER role
        user.setRole(User.Role.SELLER);
        userRepository.save(user);

        // 4. Send Email Notification
        String subject = "Welcome to Kanharaj - Seller Account Activated!";
        String emailContent = "Hello " + user.getName() + ",\n\n"
                + "Congratulations! Your payment for the " + plan + " plan was successful.\n"
                + "Your Kanharaj Seller Account has been officially activated.\n\n"
                + "You can now login to your seller dashboard and start posting your properties:\n"
                + sellerUrl + "/login\n\n"
                + "Best Regards,\nKanharaj Team";
        
        emailService.sendSimpleMessage(user.getEmail(), subject, emailContent);

        return ResponseEntity.ok(Map.of(
            "message", "Payment Verified & Seller Account Activated"
        ));
    }

    @GetMapping("/status")
    public ResponseEntity<?> getPaymentStatus(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(401).body("Unauthorized");
        
        User user = userRepository.findById(userDetails.getId()).orElseThrow();
        
        return ResponseEntity.ok(Map.of(
            "plan", user.getSubscriptionPlan(),
            "status", user.getPaymentStatus(),
            "expiry", user.getSubscriptionExpiry() != null ? user.getSubscriptionExpiry() : "NONE"
        ));
    }
}
