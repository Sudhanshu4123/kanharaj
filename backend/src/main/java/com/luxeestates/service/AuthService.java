package com.luxeestates.service;

import com.luxeestates.dto.AuthDto;
import com.luxeestates.dto.UserDto;
import com.luxeestates.model.User;
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
        private final PasswordEncoder passwordEncoder;
        private final JwtTokenProvider jwtTokenProvider;
        private final AuthenticationManager authenticationManager;

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
                if (adminEmail != null) adminEmail = adminEmail.trim();
                if (adminPassword != null) adminPassword = adminPassword.trim();
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
                                        .user(UserDto.fromEntity(user))
                                        .build();
                } catch (Exception e) {
                        throw new RuntimeException("Registration failed: " + e.getMessage());
                }
        }

        public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
                try {
                        String email = request.getEmail().trim();
                        Authentication authentication = authenticationManager.authenticate(
                                        new UsernamePasswordAuthenticationToken(
                                                        email,
                                                        request.getPassword().trim()));

                        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
                        String token = jwtTokenProvider.generateToken(userDetails);
                        String refreshToken = jwtTokenProvider.generateRefreshToken(userDetails);

                        User user = userRepository.findByEmail(request.getEmail())
                                        .orElseThrow(() -> new RuntimeException("User not found"));

                        return AuthDto.AuthResponse.builder()
                                        .token(token)
                                        .refreshToken(refreshToken)
                                        .user(UserDto.fromEntity(user))
                                        .build();
                } catch (Exception e) {
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
                                .user(UserDto.fromEntity(user))
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
                                .user(UserDto.fromEntity(user))
                                .build();
        }

        public UserDto getCurrentUser(String email) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                return UserDto.fromEntity(user);
        }

        public Long getTotalUsers() {
                return userRepository.count();
        }

        public Long getTotalAdmins() {
                return userRepository.countByRole(User.Role.ADMIN);
        }
}