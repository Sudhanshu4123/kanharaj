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

    @Value("${admin.email:kanharaj1389@gmail.com}")
    private String adminEmail;
    
    @Value("${admin.password:admin@123}")
    private String adminPassword;
    
    @Value("${admin.name:Admin}")
    private String adminName;
    
    @Value("${admin.phone:0000000000}")
    private String adminPhone;

    @PostConstruct
    public void init() {
        try {
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
                            .createdAt(LocalDateTime.now())
                            .build();
                    userRepository.save(admin);
                }
            );
        } catch (Exception e) {
            System.err.println("Admin init error: " + e.getMessage());
        }
    }
    
    @Transactional
    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        System.out.println("Registering user: " + request.getEmail());
        
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("This email is already registered");
        }
        
        try {
            User user = User.builder()
                    .name(request.getName())
                    .email(request.getEmail())
                    .phone(request.getPhone() != null ? request.getPhone() : "")
                    .password(passwordEncoder.encode(request.getPassword()))
                    .role(User.Role.USER)
                    .enabled(true)
                    .createdAt(LocalDateTime.now())
                    .build();
            
            user = userRepository.save(user);
            System.out.println("User saved successfully with ID: " + user.getId());
            
            CustomUserDetails userDetails = new CustomUserDetails(user);
            String token = jwtTokenProvider.generateToken(userDetails);
            String refreshToken = jwtTokenProvider.generateRefreshToken(userDetails);
            
            return AuthDto.AuthResponse.builder()
                    .token(token)
                    .refreshToken(refreshToken)
                    .user(UserDto.fromEntity(user))
                    .build();
        } catch (Exception e) {
            System.err.println("Database Registration Error: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Database error: " + e.getMessage());
        }
    }
    
    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
            
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String token = jwtTokenProvider.generateToken(userDetails);
            String refreshToken = jwtTokenProvider.generateRefreshToken(userDetails);
            
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("User data not found"));
            
            return AuthDto.AuthResponse.builder()
                    .token(token)
                    .refreshToken(refreshToken)
                    .user(UserDto.fromEntity(user))
                    .build();
        } catch (Exception e) {
            throw new RuntimeException("Invalid email or password");
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
                            .password(passwordEncoder.encode("SOCIAL_LOGIN_" + Math.random()))
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