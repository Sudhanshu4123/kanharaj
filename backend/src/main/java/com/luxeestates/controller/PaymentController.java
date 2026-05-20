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

    @Value("${razorpay.key.id:rzp_live_SrVXmToc9GKOXJ}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret:yT0gYlf3i10jc3x41PHtIIi4}")
    private String razorpayKeySecret;

    // STEP 1: Create Order for Razorpay
    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> data) {
        System.out.println("Creating Razorpay order with data: " + data);
        try {
            if (razorpayKeyId == null || razorpayKeyId.isEmpty() || razorpayKeyId.contains("${")) {
                System.err.println("Razorpay Key ID is not configured correctly!");
                return ResponseEntity.status(500).body(Map.of("message", "Razorpay Key ID missing"));
            }

            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            Double amount = Double.valueOf(data.get("amount").toString());
            
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", (int)(amount * 100)); // amount in paise
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "txn_" + System.currentTimeMillis());

            System.out.println("Sending order request to Razorpay...");
            Order order = razorpay.orders.create(orderRequest);
            System.out.println("Order created successfully: " + order.get("id"));

            Object amtObj = order.get("amount");
            Integer amountInPaise;
            if (amtObj instanceof Number) {
                amountInPaise = ((Number) amtObj).intValue();
            } else {
                amountInPaise = Integer.parseInt(amtObj.toString());
            }

            return ResponseEntity.ok(Map.of(
                "orderId", order.get("id"),
                "amount", amountInPaise,
                "currency", order.get("currency"),
                "keyId", razorpayKeyId
            ));
        } catch (RazorpayException e) {
            System.err.println("Razorpay Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Razorpay SDK Error: " + e.getMessage()));
        } catch (Exception e) {
            System.err.println("General Error in createOrder: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Internal Server Error: " + e.getMessage()));
        }
    }

    // STEP 2: Verify Payment & Create/Update Seller
    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, Object> payload) {

        if (userDetails == null) return ResponseEntity.status(401).body("Unauthorized");

        System.out.println("Processing payment verification for user: " + userDetails.getUsername());
        System.out.println("Payload: " + payload);

        String orderId = (String) payload.get("razorpay_order_id");
        String paymentId = (String) payload.get("razorpay_payment_id");
        String signature = (String) payload.get("razorpay_signature");
        String plan = (String) payload.get("plan");
        
        Integer months;
        try {
            months = Integer.valueOf(payload.get("months").toString());
        } catch (Exception e) {
            System.err.println("Error parsing months: " + e.getMessage());
            months = 1; // Default fallback
        }

        Double amount;
        try {
            amount = Double.valueOf(payload.get("amount").toString());
        } catch (Exception e) {
            System.err.println("Error parsing amount: " + e.getMessage());
            amount = 0.0;
        }

        try {
            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", orderId);
            options.put("razorpay_payment_id", paymentId);
            options.put("razorpay_signature", signature);

            boolean isValid = Utils.verifyPaymentSignature(options, razorpayKeySecret);
            if (!isValid) {
                System.err.println("Invalid Payment Signature for order: " + orderId);
                return ResponseEntity.status(400).body(Map.of("message", "Invalid Payment Signature"));
            }

            // Fetch order from Razorpay to verify the actual amount paid
            Order order = razorpay.orders.fetch(orderId);
            Object amountObj = order.get("amount");
            Double actualPaidAmount;
            if (amountObj instanceof Number) {
                actualPaidAmount = ((Number) amountObj).doubleValue() / 100.0;
            } else {
                actualPaidAmount = Double.parseDouble(amountObj.toString()) / 100.0;
            }

            // Calculate expected price
            Double planPrice = 0.0;
            if ("basic".equalsIgnoreCase(plan)) {
                planPrice = 6099.0;
            } else if ("premium".equalsIgnoreCase(plan)) {
                planPrice = 6599.0;
            } else if ("super".equalsIgnoreCase(plan)) {
                planPrice = 7299.0;
            } else {
                return ResponseEntity.status(400).body(Map.of("message", "Invalid Plan Name"));
            }

            Double expectedAmount = planPrice * months;

            // Compare amounts
            if (Math.abs(actualPaidAmount - expectedAmount) > 0.01) {
                System.err.println("Payment Amount Mismatch! Expected: " + expectedAmount + ", Paid: " + actualPaidAmount);
                return ResponseEntity.status(400).body(Map.of("message", "Payment Amount Mismatch! Expected " + expectedAmount + " but paid " + actualPaidAmount));
            }

            amount = actualPaidAmount;
        } catch (RazorpayException e) {
            System.err.println("Signature or amount verification failed: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("message", "Verification failed: " + e.getMessage()));
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

        // Synchronize subscription details on the User model as well
        user.setSubscriptionPlan(plan.toUpperCase());
        user.setSubscriptionExpiry(seller.getSubscriptionExpiry());
        user.setPaymentStatus("ACTIVE");

        // 3. Ensure user has SELLER role
        user.setRole(User.Role.SELLER);
        userRepository.save(user);

        // 4. Send Email Notification
        try {
            String subject = "Welcome to Kanharaj - Seller Account Activated!";
            String emailContent = "Hello " + user.getName() + ",\n\n"
                    + "Congratulations! Your payment for the " + plan + " plan was successful.\n"
                    + "Your Kanharaj Seller Account has been officially activated.\n\n"
                    + "You can now login to your seller dashboard and start posting your properties:\n"
                    + sellerUrl + "/login\n\n"
                    + "Best Regards,\nKanharaj Team";
            
            emailService.sendSimpleMessage(user.getEmail(), subject, emailContent);
        } catch (Exception e) {
            System.err.println("Failed to send activation email: " + e.getMessage());
        }

        return ResponseEntity.ok(Map.of(
            "message", "Payment Verified & Seller Account Activated"
        ));
    }

    @GetMapping("/status")
    public ResponseEntity<?> getPaymentStatus(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(401).body("Unauthorized");
        
        User user = userRepository.findById(userDetails.getId()).orElseThrow();
        
        String plan = "NONE";
        String status = "PENDING";
        LocalDateTime expiry = null;

        Seller seller = sellerRepository.findByUserId(user.getId()).orElse(null);
        if (seller != null) {
            plan = seller.getSubscriptionPlan();
            status = seller.getStatus();
            expiry = seller.getSubscriptionExpiry();
        } else {
            plan = user.getSubscriptionPlan();
            status = user.getPaymentStatus();
            expiry = user.getSubscriptionExpiry();
        }
        
        return ResponseEntity.ok(Map.of(
            "plan", plan,
            "status", status,
            "expiry", expiry != null ? expiry : "NONE"
        ));
    }

    @GetMapping("/history")
    public ResponseEntity<?> getPaymentHistory(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(401).body("Unauthorized");
        
        java.util.List<java.util.Map<String, Object>> history = transactionRepository.findByUserId(userDetails.getId())
                .stream()
                .map(t -> {
                    java.util.Map<String, Object> map = new java.util.HashMap<>();
                    map.put("id", t.getId());
                    map.put("orderId", t.getRazorpayOrderId());
                    map.put("paymentId", t.getRazorpayPaymentId());
                    map.put("amount", t.getAmount());
                    map.put("planName", t.getPlanName());
                    map.put("status", t.getStatus());
                    map.put("createdAt", t.getCreatedAt() != null ? t.getCreatedAt().toString() : "");
                    return map;
                })
                .collect(java.util.stream.Collectors.toList());
                
        return ResponseEntity.ok(history);
    }
}
