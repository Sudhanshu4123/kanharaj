package com.luxeestates.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "sellers")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Seller {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private String companyName;
    
    private String gstNumber;
    
    @Column(nullable = false)
    private String subscriptionPlan; // BASIC, PREMIUM, SUPER
    
    @Column(nullable = false)
    private LocalDateTime subscriptionExpiry;
    
    @Column(nullable = false)
    private String status; // ACTIVE, EXPIRED, PENDING
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
