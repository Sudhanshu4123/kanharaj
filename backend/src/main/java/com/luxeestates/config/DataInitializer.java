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
    private final com.luxeestates.repository.PropertyRepository propertyRepository;
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

        // Add a sample property if the database is empty
        if (propertyRepository.count() == 0) {
            com.luxeestates.model.Property sample = com.luxeestates.model.Property.builder()
                    .title("3 BHK Luxury Apartment")
                    .description("Spacious 3 BHK apartment with modern amenities in a prime location.")
                    .price(new java.math.BigDecimal("8500000"))
                    .propertyType(com.luxeestates.model.Property.PropertyType.APARTMENT)
                    .listingType(com.luxeestates.model.Property.ListingType.BUY)
                    .address("Sector 7, Dwarka")
                    .city("New Delhi")
                    .state("Delhi")
                    .pincode("110075")
                    .bedrooms(3)
                    .bathrooms(3)
                    .area(1800)
                    .status(com.luxeestates.model.Property.Status.ACTIVE)
                    .featured(true)
                    .user(admin)
                    .images("[\"https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800\"]")
                    .build();
            propertyRepository.save(sample);
            System.out.println("Sample property created.");

            com.luxeestates.model.Property sample2 = com.luxeestates.model.Property.builder()
                    .title("Luxury Villa with Private Pool")
                    .description("Ultra-modern villa with private pool, garden, and high-end finishes.")
                    .price(new java.math.BigDecimal("45000000"))
                    .propertyType(com.luxeestates.model.Property.PropertyType.VILLA)
                    .listingType(com.luxeestates.model.Property.ListingType.BUY)
                    .address("MGF Mulberry, Gurgaon")
                    .city("Gurgaon")
                    .state("Haryana")
                    .pincode("122002")
                    .bedrooms(5)
                    .bathrooms(6)
                    .area(5500)
                    .status(com.luxeestates.model.Property.Status.ACTIVE)
                    .featured(true)
                    .user(admin)
                    .images("[\"https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800\"]")
                    .build();
            propertyRepository.save(sample2);
            System.out.println("Second sample property created.");
        }
    }
}
