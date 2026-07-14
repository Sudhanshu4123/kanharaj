package com.luxeestates.dto;

import com.luxeestates.model.Property;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyDto {
    
    private Long id;
    private String title;
    private String description;
    private BigDecimal price;
    private Property.PropertyType propertyType;
    private Property.ListingType listingType;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private Integer bedrooms;
    private Integer bathrooms;
    private Integer area;
    private Integer yearBuilt;
    private java.util.List<String> amenities;
    private java.util.List<String> images;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Property.Status status;
    private Boolean featured;
    private Boolean verified;
    private LocalDateTime verifiedAt;
    private BigDecimal verificationLatitude;
    private BigDecimal verificationLongitude;
    private String verificationPhotoUrl;
    private Integer views;
    private Long userId;
    private String userName;
    private String userPhone;
    private String userProfileImage;
    private String userDescription;
    private String userExperienceYears;
    private String developer;
    private String reraId;
    private String constructionStatus;
    private String possessionDate;

    private Integer projectUnits;
    private String areaUnit;
    private String projectArea;
    private String sizes;
    private String configurations;
    private String projectSize;
    private String launchDate;
    private String avgPrice;
    private String brochureUrl;

    private Long projectId;
    private String projectName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static PropertyDto fromEntity(Property property) {
        return PropertyDto.builder()
                .id(property.getId())
                .title(property.getTitle())
                .description(property.getDescription())
                .price(property.getPrice())
                .propertyType(property.getPropertyType())
                .listingType(property.getListingType())
                .address(property.getAddress())
                .city(property.getCity())
                .state(property.getState())
                .pincode(property.getPincode())
                .bedrooms(property.getBedrooms())
                .bathrooms(property.getBathrooms())
                .area(property.getArea())
                .yearBuilt(property.getYearBuilt())
                .amenities(tryParse(property.getAmenities()))
                .images(tryParse(property.getImages()))
                .latitude(property.getLatitude())
                .longitude(property.getLongitude())
                .status(property.getStatus())
                .featured(property.getFeatured())
                .verified(property.getVerified())
                .verifiedAt(property.getVerifiedAt())
                .verificationLatitude(property.getVerificationLatitude())
                .verificationLongitude(property.getVerificationLongitude())
                .verificationPhotoUrl(property.getVerificationPhotoUrl())
                .views(property.getViews())
                .userId(property.getUser().getId())
                .userName(property.getUser().getName())
                .userPhone(property.getUser().getPhone())
                .userProfileImage(property.getUser().getProfileImage())
                .userDescription(property.getUser().getDescription())
                .userExperienceYears(property.getUser().getExperienceYears())
                .developer(property.getDeveloper())
                .reraId(property.getReraId())
                .constructionStatus(property.getConstructionStatus())
                .possessionDate(property.getPossessionDate())
                .projectUnits(property.getProjectUnits())
                .areaUnit(property.getAreaUnit())
                .projectArea(property.getProjectArea())
                .sizes(property.getSizes())
                .configurations(property.getConfigurations())
                .projectSize(property.getProjectSize())
                .launchDate(property.getLaunchDate())
                .avgPrice(property.getAvgPrice())
                .brochureUrl(property.getBrochureUrl())
                .projectId(property.getProjectId())
                .projectName(property.getProject() != null ? property.getProject().getTitle() : null)
                .createdAt(property.getCreatedAt())
                .updatedAt(property.getUpdatedAt())
                .build();
    }

    private static java.util.List<String> tryParse(String json) {
        if (json == null || json.isEmpty()) return new java.util.ArrayList<>();
        try {
            return new com.fasterxml.jackson.databind.ObjectMapper().readValue(json, new com.fasterxml.jackson.core.type.TypeReference<java.util.List<String>>() {});
        } catch (Exception e) {
            return new java.util.ArrayList<>();
        }
    }
}