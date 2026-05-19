package com.luxeestates.controller;

import com.luxeestates.model.User;
import com.luxeestates.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/api/otp")
@RequiredArgsConstructor
public class OTPController {

    private final UserRepository userRepository;

    @PostMapping("/send")
    public ResponseEntity<?> sendOTP(@RequestBody Map<String, String> request) {
        String phone = request.get("phone");
        if (phone == null || phone.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Phone number is required"));
        }

        // Generate 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(1000000));
        
        // Log it (Mock SMS)
        System.out.println("----------------------------------------");
        System.out.println("SMS SENT TO: " + phone);
        System.out.println("OTP CODE: " + otp);
        System.out.println("----------------------------------------");

        // Save OTP to some user record if found by phone (Optional, or just for verification)
        // Usually, OTP is sent to the phone and verified by the same service.
        // For now, we'll just acknowledge that it was "sent".
        
        return ResponseEntity.ok(Map.of("message", "OTP sent to " + phone + " (Check console logs in this demo)"));
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyOTP(@RequestBody Map<String, String> request) {
        String otp = request.get("otp");
        
        // Demo logic: Accept any 6-digit code for now, or a specific one if we saved it.
        if (otp != null && otp.length() == 6) {
            return ResponseEntity.ok(Map.of("message", "Mobile verified successfully"));
        }
        
        return ResponseEntity.badRequest().body(Map.of("message", "Invalid OTP"));
    }
}
