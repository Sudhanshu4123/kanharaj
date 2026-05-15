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

        @PostConstruct
        public void postConstruct() {
                if (adminEmail != null)
                        adminEmail = adminEmail.trim();
                if (adminPassword != null)
                        adminPassword = adminPassword.trim();
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
                                        .enabled(true)
                                        .createdAt(LocalDateTime.now())
                                        .build();

                        user = userRepository.save(user);

                        CustomUserDetails userDetails = new CustomUserDetails(user);
                        String token = jwtTokenProvider.generateToken(userDetails);
                        String refreshToken = jwtTokenProvider.generateRefreshToken(userDetails);

                        return AuthDto.AuthResponse.builder()
                                        .token(token)
                                        .refreshToken(refreshToken)
                                        .user(getCurrentUser(user.getEmail()))
                                        .build();
                } catch (Exception e) {
                        throw new RuntimeException("Registration failed: " + e.getMessage());
                }
        }

        public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
                String email = request.getEmail() != null ? request.getEmail().trim() : "";
                String password = request.getPassword() != null ? request.getPassword().trim() : "";

                System.out.println("Login attempt for: [" + email + "]");

                try {
                        Authentication authentication = authenticationManager.authenticate(
                                        new UsernamePasswordAuthenticationToken(email, password));

                        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
                        System.out.println("Authentication successful for: " + email + " with role: "
                                        + userDetails.getAuthorities());

                        String token = jwtTokenProvider.generateToken(userDetails);
                        String refreshToken = jwtTokenProvider.generateRefreshToken(userDetails);

                        User user = userRepository.findByEmail(email)
                                        .orElseThrow(() -> new RuntimeException("User not found"));

                        return AuthDto.AuthResponse.builder()
                                        .token(token)
                                        .refreshToken(refreshToken)
                                        .user(getCurrentUser(user.getEmail()))
                                        .build();
                } catch (Exception e) {
                        System.err.println("Login failed for [" + email + "]: " + e.getMessage());
                        throw new RuntimeException("Invalid credentials");
                }
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

                // Fetch professional seller data if it exists
                sellerRepository.findByUserId(user.getId()).ifPresent(seller -> {
                        dto.setSubscriptionPlan(seller.getSubscriptionPlan());
                        dto.setSubscriptionExpiry(seller.getSubscriptionExpiry());
                });

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
                User user = userRepository.findByEmail(request.getEmail())
                                .orElseThrow(() -> new RuntimeException("User not found with email"));

                // Delete any existing tokens for this user
                passwordResetTokenRepository.deleteByUser(user);

                // Create new token
                String token = java.util.UUID.randomUUID().toString();
                PasswordResetToken resetToken = PasswordResetToken.builder()
                                .token(token)
                                .user(user)
                                .expiryDate(LocalDateTime.now().plusHours(1))
                                .build();

                passwordResetTokenRepository.save(resetToken);

                // Send email
                String resetLink = "http://localhost:3000/reset-password?token=" + token;
                String emailContent = "Hello " + user.getName() + ",\n\n" +
                                "You requested to reset your password. Click the link below to set a new password:\n" +
                                resetLink + "\n\n" +
                                "This link will expire in 1 hour.\n\n" +
                                "If you didn't request this, please ignore this email.";

                emailService.sendSimpleMessage(user.getEmail(), "Password Reset Request - Kanharaj", emailContent);
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
}