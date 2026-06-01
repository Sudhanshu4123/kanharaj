package com.luxeestates.dto;

import com.luxeestates.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {
    
    private Long id;
    private String name;
    private String email;
    private String phone;
    private User.Role role;
    private Boolean enabled;
    private LocalDateTime createdAt;
    
    // Profile Fields
    private String profileImage;
    private String description;
    private String experienceYears;
    
    // Subscription Info (Source of truth: Seller table)
    private String subscriptionPlan;
    private LocalDateTime subscriptionExpiry;
    private Integer freePostsUsed;
    
    public static UserDto fromEntity(User user) {
        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .enabled(user.getEnabled())
                .createdAt(user.getCreatedAt())
                .profileImage(user.getProfileImage())
                .description(user.getDescription())
                .experienceYears(user.getExperienceYears())
                .subscriptionPlan(user.getSubscriptionPlan() != null ? user.getSubscriptionPlan() : "NONE")
                .subscriptionExpiry(user.getSubscriptionExpiry())
                .freePostsUsed(user.getFreePostsUsed() != null ? user.getFreePostsUsed() : 0)
                .build();
    }
}