package com.luxeestates.service;

import com.luxeestates.dto.AuthDto;
import com.luxeestates.dto.UserDto;
import com.luxeestates.model.PasswordResetToken;
import com.luxeestates.model.User;
import com.luxeestates.repository.PasswordResetTokenRepository;
import com.luxeestates.repository.SellerRepository;
import com.luxeestates.repository.UserRepository;
import com.luxeestates.security.CustomUserDetails;
import com.luxeestates.security.JwtTokenProvider;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

        private final UserRepository userRepository;
        private final SellerRepository sellerRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtTokenProvider jwtTokenProvider;
        private final AuthenticationManager authenticationManager;
        private final PasswordResetTokenRepository passwordResetTokenRepository;
        private final EmailService emailService;

        @Value("${admin.email}")
        private String adminEmail;

        @Value("${admin.password}")
        private String adminPassword;

        @Value("${admin.name}")
        private String adminName;

        @Value("${admin.phone}")
        private String adminPhone;

        @Value("${app.frontend-url:https://kanharaj.com}")
        private String frontendUrl;

        @PostConstruct
        public void postConstruct() {
                if (adminEmail != null)
                        adminEmail = adminEmail.trim();
                if (adminPassword != null)
                        adminPassword = adminPassword.trim();

                // One-time fix for existing users (Migration)
                try {
                        userRepository.findAll().forEach(user -> {
                                if (user.getEnabled() == null || !user.getEnabled()) {
                                        user.setEnabled(true);
                                        userRepository.save(user);
                                }
                        });
                        System.out.println("Data Migration: All users have been enabled successfully.");
                } catch (Exception e) {
                        System.err.println("Migration failed: " + e.getMessage());
                }
        }

        @Transactional
        public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
                if (userRepository.existsByEmail(request.getEmail())) {
                        throw new RuntimeException("Email already exists");
                }

                try {
                        User user = User.builder()
                                        .name(request.getName())
                                        .email(request.getEmail())
                                        .phone(request.getPhone())
                                        .password(passwordEncoder.encode(request.getPassword()))
                                        .role(User.Role.USER)
                                        .enabled(true) // Enabled for authentication, but emailVerified handles access
                                        .emailVerified(false)
                                        .verificationToken(
                                                        String.valueOf(100000 + new java.util.Random().nextInt(900000))) // 6-digit
                                                                                                                         // OTP
                                        .otpExpiry(LocalDateTime.now().plusMinutes(15))
                                        .createdAt(LocalDateTime.now())
                                        .build();

                        user = userRepository.save(user);

                        // Send Verification Email
                        sendVerificationEmail(user);

                        return AuthDto.AuthResponse.builder()
                                        .message("Registration successful! Please check your email to verify your account.")
                                        .user(UserDto.fromEntity(user))
                                        .build();
                } catch (Exception e) {
                        throw new RuntimeException("Registration failed: " + e.getMessage());
                }
        }

        public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
                String email = request.getEmail() != null ? request.getEmail().trim() : "";
                String password = request.getPassword() != null ? request.getPassword().trim() : "";

                if (!userRepository.existsByEmail(email)) {
                        throw new RuntimeException("Email not found. Please register first.");
                }

                try {
                        Authentication authentication = authenticationManager.authenticate(
                                        new UsernamePasswordAuthenticationToken(email, password));

                        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
                        User user = userRepository.findByEmail(email)
                                        .orElseThrow(() -> new RuntimeException("User not found"));

                        if (!user.getEnabled()) {
                                throw new RuntimeException("Account is disabled. Please contact support.");
                        }

                        // Auto-verify email upon successful password entry
                        if (!user.getEmailVerified()) {
                                user.setEmailVerified(true);
                                user.setVerificationToken(null);
                                user.setOtpExpiry(null);
                                userRepository.save(user);
                        }

                        // Generate Tokens for direct login
                        String token = jwtTokenProvider.generateToken(userDetails);
                        String refreshToken = jwtTokenProvider.generateRefreshToken(userDetails);

                        return AuthDto.AuthResponse.builder()
                                        .token(token)
                                        .refreshToken(refreshToken)
                                        .user(getCurrentUser(user.getEmail()))
                                        .message("LOGIN_SUCCESS")
                                        .build();
                } catch (org.springframework.security.core.AuthenticationException e) {
                        throw new RuntimeException("Invalid credentials");
                } catch (RuntimeException e) {
                        throw e;
                } catch (Exception e) {
                        System.err.println("Login failed for [" + email + "]: " + e.getMessage());
                        throw new RuntimeException("Login failed. Please try again.");
                }
        }

        @Transactional
        public AuthDto.AuthResponse verifyLoginOtp(String email, String otp) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                if (user.getVerificationToken() == null || !user.getVerificationToken().equals(otp)) {
                        throw new RuntimeException("Invalid OTP code");
                }

                if (user.getOtpExpiry() != null && user.getOtpExpiry().isBefore(LocalDateTime.now())) {
                        throw new RuntimeException("OTP has expired. Please login again.");
                }

                // Clear OTP
                user.setVerificationToken(null);
                user.setOtpExpiry(null);
                userRepository.save(user);

                // Generate Tokens
                CustomUserDetails userDetails = new CustomUserDetails(user);
                String token = jwtTokenProvider.generateToken(userDetails);
                String refreshToken = jwtTokenProvider.generateRefreshToken(userDetails);

                return AuthDto.AuthResponse.builder()
                                .token(token)
                                .refreshToken(refreshToken)
                                .user(getCurrentUser(user.getEmail()))
                                .build();
        }

        private void sendLoginOtpEmail(User user) {
                String otp = user.getVerificationToken();
                String emailContent = "Hello " + user.getName() + ",\n\n" +
                                "Your login verification code for Kanharaj is:\n\n" +
                                "------------------------\n" +
                                "      " + otp + "      \n" +
                                "------------------------\n\n" +
                                "This code will expire in 10 minutes.\n\n" +
                                "If you didn't try to login, please secure your account.\n\n" +
                                "Best Regards,\nKanharaj Team";

                emailService.sendSimpleMessage(user.getEmail(), "Login Verification Code - Kanharaj", emailContent);
        }

        public AuthDto.AuthResponse refreshToken(AuthDto.RefreshTokenRequest request) {
                if (!jwtTokenProvider.validateToken(request.getRefreshToken())) {
                        throw new RuntimeException("Invalid refresh token");
                }

                String email = jwtTokenProvider.extractUsername(request.getRefreshToken());
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                CustomUserDetails userDetails = new CustomUserDetails(user);
                String token = jwtTokenProvider.generateToken(userDetails);
                String refreshToken = jwtTokenProvider.generateRefreshToken(userDetails);

                return AuthDto.AuthResponse.builder()
                                .token(token)
                                .refreshToken(refreshToken)
                                .user(getCurrentUser(user.getEmail()))
                                .build();
        }

        @Transactional
        public AuthDto.AuthResponse socialLogin(AuthDto.SocialLoginRequest request) {
                User user = userRepository.findByEmail(request.getEmail())
                                .orElseGet(() -> {
                                        User newUser = User.builder()
                                                        .name(request.getName())
                                                        .email(request.getEmail())
                                                        .password(passwordEncoder
                                                                        .encode("SOCIAL_LOGIN_" + Math.random()))
                                                        .role(User.Role.USER)
                                                        .enabled(true)
                                                        .createdAt(LocalDateTime.now())
                                                        .build();
                                        return userRepository.save(newUser);
                                });

                CustomUserDetails userDetails = new CustomUserDetails(user);
                String token = jwtTokenProvider.generateToken(userDetails);
                String refreshToken = jwtTokenProvider.generateRefreshToken(userDetails);

                return AuthDto.AuthResponse.builder()
                                .token(token)
                                .refreshToken(refreshToken)
                                .user(getCurrentUser(user.getEmail()))
                                .build();
        }

        public UserDto getCurrentUser(String email) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                UserDto dto = UserDto.fromEntity(user);

                // Fetch professional seller data if it exists (but override with dynamic free SUPER plan details)
                sellerRepository.findByUserId(user.getId()).ifPresent(seller -> {
                        dto.setSubscriptionPlan(seller.getSubscriptionPlan());
                        dto.setSubscriptionExpiry(seller.getSubscriptionExpiry());
                });

                dto.setSubscriptionPlan("SUPER");
                dto.setSubscriptionExpiry(LocalDateTime.now().plusYears(100));

                return dto;
        }

        public Long getTotalUsers() {
                return userRepository.count();
        }

        public Long getTotalAdmins() {
                return userRepository.countByRole(User.Role.ADMIN);
        }

        public java.util.List<UserDto> getAllUsers() {
                return userRepository.findAll().stream()
                                .map(UserDto::fromEntity)
                                .collect(java.util.stream.Collectors.toList());
        }

        @Transactional
        public void forgotPassword(AuthDto.ForgotPasswordRequest request) {
                String email = request.getEmail() != null ? request.getEmail().trim() : "";
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

                // Delete any existing tokens for this user
                try {
                        passwordResetTokenRepository.deleteByUser(user);
                        passwordResetTokenRepository.flush();
                } catch (Exception e) {
                        System.err.println("Error deleting existing reset tokens: " + e.getMessage());
                }

                // Create new token
                String token = java.util.UUID.randomUUID().toString();
                PasswordResetToken resetToken = PasswordResetToken.builder()
                                .token(token)
                                .user(user)
                                .expiryDate(LocalDateTime.now().plusHours(1))
                                .build();

                passwordResetTokenRepository.save(resetToken);

                String baseUrl = frontendUrl != null ? frontendUrl.replaceAll("/$", "") : "https://kanharaj.com";
                String resetLink = baseUrl + "/reset-password?token=" + token;
                String emailContent = "Hello " + user.getName() + ",\n\n" +
                                "You requested to reset your password. Click the link below to set a new password:\n" +
                                resetLink + "\n\n" +
                                "This link will expire in 1 hour.\n\n" +
                                "If you didn't request this, please ignore this email.";

                System.out.println("=================================================");
                System.out.println("GENERATED PASSWORD RESET LINK FOR: " + email);
                System.out.println("Reset Link: " + resetLink);
                System.out.println("=================================================");

                try {
                        emailService.sendSimpleMessage(user.getEmail(), "Password Reset Request - Kanharaj",
                                        emailContent);
                } catch (Exception e) {
                        System.err.println("Failed to send reset email via SMTP, but generated link successfully: "
                                        + e.getMessage());
                        // Catching email sending failure for local/development robustness so the
                        // request still succeeds
                        // and developer can copy the link from the console.
                }
        }

        @Transactional
        public void resetPassword(AuthDto.ResetPasswordRequest request) {
                PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
                                .orElseThrow(() -> new RuntimeException("Invalid or expired password reset token"));

                if (resetToken.isExpired()) {
                        passwordResetTokenRepository.delete(resetToken);
                        throw new RuntimeException("Password reset token has expired");
                }

                User user = resetToken.getUser();
                user.setPassword(passwordEncoder.encode(request.getNewPassword()));
                userRepository.save(user);

                // Delete the token after successful use
                passwordResetTokenRepository.delete(resetToken);
        }

        @Transactional
        public void verifyEmail(String otp) {
                User user = userRepository.findByVerificationToken(otp)
                                .orElseThrow(() -> new RuntimeException("Invalid OTP code"));

                if (user.getOtpExpiry() != null && user.getOtpExpiry().isBefore(LocalDateTime.now())) {
                        throw new RuntimeException("OTP has expired. Please request a new one.");
                }

                user.setEmailVerified(true);
                user.setEnabled(true);
                user.setVerificationToken(null);
                user.setOtpExpiry(null);
                userRepository.save(user);
        }

        @Transactional
        public void resendOtp(String email) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                if (user.getEmailVerified()) {
                        throw new RuntimeException("Email is already verified");
                }

                String otp = String.valueOf(100000 + new java.util.Random().nextInt(900000));
                user.setVerificationToken(otp);
                user.setOtpExpiry(LocalDateTime.now().plusMinutes(15));
                userRepository.save(user);

                sendVerificationEmail(user);
        }

        private void sendVerificationEmail(User user) {
                String otp = user.getVerificationToken();
                String emailContent = "Hello " + user.getName() + ",\n\n" +
                                "Thank you for joining Kanharaj! Your email verification code is:\n\n" +
                                "------------------------\n" +
                                "      " + otp + "      \n" +
                                "------------------------\n\n" +
                                "This code will expire in 15 minutes.\n\n" +
                                "Enter this code on the website to activate your account.\n\n" +
                                "Best Regards,\nKanharaj Team";

                System.out.println("=================================================");
                System.out.println("REGISTRATION OTP GENERATED FOR: " + user.getEmail());
                System.out.println("OTP Verification Code: " + otp);
                System.out.println("=================================================");

                try {
                        emailService.sendSimpleMessage(user.getEmail(), "Verification Code - Kanharaj", emailContent);
                } catch (Exception e) {
                        System.err.println("Failed to send verification email via SMTP: " + e.getMessage());
                }
        }
}