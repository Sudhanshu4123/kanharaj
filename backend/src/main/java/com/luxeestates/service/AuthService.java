package com.luxeestates.service;

import com.luxeestates.dto.AuthDto;
import com.luxeestates.dto.UserDto;
import com.luxeestates.model.User;
import com.luxeestates.repository.UserRepository;
import com.luxeestates.security.CustomUserDetails;
import com.luxeestates.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtTokenProvider jwtTokenProvider;
        private final AuthenticationManager authenticationManager;

        @Value("${admin.email:admin@example.com}")
        private String adminEmail;
        @Value("${admin.password:admin123}")
        private String adminPassword;
        @Value("${admin.name:Admin}")
        private String adminName;
        @Value("${admin.phone:0000000000}")
        private String adminPhone;

        @PostConstruct
        public void init() {
                userRepository.findByEmail(adminEmail).ifPresentOrElse(
                                admin -> {
                                        admin.setPassword(passwordEncoder.encode(adminPassword));
                                        userRepository.save(admin);
                                },
                                () -> {
                                        User admin = User.builder()
                                                        .name(adminName)
                                                        .email(adminEmail)
                                                        .phone(adminPhone)
                                                        .password(passwordEncoder.encode(adminPassword))
                                                        .role(User.Role.ADMIN)
                                                        .enabled(true)
                                                        .build();
                                        userRepository.save(admin);
                                });
        }

        @Transactional
        public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
                if (userRepository.existsByEmail(request.getEmail())) {
                        throw new RuntimeException("Email already exists");
                }

                User user = User.builder()
                                .name(request.getName())
                                .email(request.getEmail())
                                .phone(request.getPhone())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .role(User.Role.USER)
                                .enabled(true)
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
        }

        public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
                System.out.println("Login attempt for email: " + request.getEmail());
                Authentication authentication = authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getEmail(),
                                                request.getPassword()));
                System.out.println("Authentication successful for: " + request.getEmail());

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
                                        // Create new user if not exists
                                        User newUser = User.builder()
                                                        .name(request.getName())
                                                        .email(request.getEmail())
                                                        .password(passwordEncoder
                                                                        .encode("SOCIAL_LOGIN_" + Math.random()))
                                                        .role(User.Role.USER)
                                                        .enabled(true)
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