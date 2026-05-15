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
    private Integer views;
    private Long userId;
    private String userName;
    private LocalDateTime createdAt;
    
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
                .views(property.getViews())
                .userId(property.getUser().getId())
                .userName(property.getUser().getName())
                .createdAt(property.getCreatedAt())
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