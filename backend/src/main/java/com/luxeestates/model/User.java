package com.luxeestates.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Builder.Default
    @Column(nullable = false)
    private Boolean enabled = true;

    @Builder.Default
    @Column(nullable = false)
    private Boolean emailVerified = false;

    private String verificationToken;

    private String mobileOtp;

    private LocalDateTime otpExpiry;

    // Profile Additions
    @Column(length = 255)
    private String profileImage;

    @Column(length = 1000)
    private String description;

    @Column(length = 50)
    private String experienceYears;

    // Subscription & Payment Fields
    @Builder.Default
    @Column(length = 20)
    private String subscriptionPlan = "NONE";

    private LocalDateTime subscriptionExpiry;

    @Builder.Default
    private Double lastPaymentAmount = 0.0;

    @Builder.Default
    @Column(length = 20)
    private String paymentStatus = "PENDING";

    @Builder.Default
    @Column(nullable = false)
    private Integer freePostsUsed = 0;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum Role {
        USER,
        ADMIN,
        SELLER
    }
}