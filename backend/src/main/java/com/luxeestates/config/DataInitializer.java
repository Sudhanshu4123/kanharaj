package com.luxeestates.config;

import com.luxeestates.model.User;
import com.luxeestates.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @org.springframework.beans.factory.annotation.Value("${admin.email}")
    private String adminEmail;

    @org.springframework.beans.factory.annotation.Value("${admin.password}")
    private String adminPassword;

    @org.springframework.beans.factory.annotation.Value("${admin.name}")
    private String adminName;

    @org.springframework.beans.factory.annotation.Value("${admin.phone}")
    private String adminPhone;

    @Override
    public void run(String... args) {
        User admin = userRepository.findByEmail(adminEmail.trim()).orElse(null);
        
        if (admin == null) {
            // Create new admin
            admin = User.builder()
                    .name(adminName)
                    .email(adminEmail)
                    .phone(adminPhone)
                    .password(passwordEncoder.encode(adminPassword))
                    .role(User.Role.ADMIN)
                    .enabled(true)
                    .build();
            userRepository.save(admin);
            System.out.println("New admin user created: " + adminEmail);
        } else {
            // Force update existing user to be Admin with correct password
            admin.setRole(User.Role.ADMIN);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setEnabled(true);
            userRepository.save(admin);
            System.out.println("Existing admin user credentials reset: " + adminEmail);
        }
    }
}
