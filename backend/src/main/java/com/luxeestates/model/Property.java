package com.luxeestates.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "properties")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Property {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 200)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal price;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PropertyType propertyType;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ListingType listingType;
    
    @Column(nullable = false, length = 300)
    private String address;
    
    @Column(nullable = false, length = 100)
    private String city;
    
    @Column(length = 100)
    private String state;
    
    @Column(length = 10)
    private String pincode;
    
    @Column(nullable = false)
    private Integer bedrooms;
    
    @Column(nullable = false)
    private Integer bathrooms;
    
    @Column(nullable = false)
    private Integer area;
    
    private Integer yearBuilt;
    
    @Column(columnDefinition = "JSON")
    private String amenities;
    
    @Column(columnDefinition = "JSON")
    private String images;
    
    private BigDecimal latitude;
    
    private BigDecimal longitude;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;
    
    @Column(nullable = false)
    private Boolean featured = false;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    public enum PropertyType {
        HOUSE, APARTMENT, VILLA, FLAT, PLOT
    }
    
    public enum ListingType {
        BUY, RENT
    }
    
    public enum Status {
        ACTIVE, INACTIVE, SOLD
    }
}