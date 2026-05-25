package com.luxeestates.service;

import com.luxeestates.dto.PropertyDto;
import com.luxeestates.model.Property;
import com.luxeestates.model.User;
import com.luxeestates.repository.PropertyRepository;
import com.luxeestates.repository.UserRepository;
import com.luxeestates.repository.InquiryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PropertyService {
    
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final InquiryRepository inquiryRepository;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;
    
    public Page<PropertyDto> getAllProperties(Pageable pageable) {
        return propertyRepository.findByStatus(Property.Status.ACTIVE, pageable)
                .map(PropertyDto::fromEntity);
    }
    
    @Cacheable(value = "featuredProperties", unless = "#result == null || #result.isEmpty()")
    public List<PropertyDto> getFeaturedProperties() {
        return propertyRepository.findByFeaturedTrueAndStatus(Property.Status.ACTIVE, Pageable.ofSize(6))
                .map(PropertyDto::fromEntity)
                .getContent();
    }
    
    public PropertyDto getPropertyById(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));
        return PropertyDto.fromEntity(property);
    }
    
    @Transactional
    @CacheEvict(value = { "platformStats", "featuredProperties", "properties" }, allEntries = true)
    public PropertyDto createProperty(PropertyDto dto, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Strict Backend Validation: Active Subscription Required for Sellers
        if (user.getRole() != User.Role.ADMIN) {
            String plan = user.getSubscriptionPlan();
            java.time.LocalDateTime expiry = user.getSubscriptionExpiry();
            
            if (plan == null || "NONE".equalsIgnoreCase(plan)) {
                throw new RuntimeException("An active subscription plan is required to post properties.");
            }
            
            if (expiry != null && expiry.isBefore(java.time.LocalDateTime.now())) {
                throw new RuntimeException("Your subscription has expired. Please renew your subscription to post properties.");
            }
        }
        
        Property property = Property.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .price(dto.getPrice())
                .propertyType(dto.getPropertyType())
                .listingType(dto.getListingType())
                .address(dto.getAddress())
                .city(dto.getCity())
                .state(dto.getState())
                .pincode(dto.getPincode())
                .bedrooms(dto.getBedrooms())
                .bathrooms(dto.getBathrooms())
                .area(dto.getArea())
                .yearBuilt(dto.getYearBuilt())
                .amenities(toJson(dto.getAmenities()))
                .images(toJson(dto.getImages()))
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .status(Property.Status.ACTIVE)
                .featured(dto.getFeatured() != null ? dto.getFeatured() : false)
                .views(0)
                .user(user)
                .build();
        
        return PropertyDto.fromEntity(propertyRepository.save(property));
    }
    
    @Transactional
    @CacheEvict(value = { "platformStats", "featuredProperties", "properties" }, allEntries = true)
    public PropertyDto updateProperty(Long id, PropertyDto dto, Long userId) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));
        
        if (!property.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to update this property");
        }
        
        property.setTitle(dto.getTitle());
        property.setDescription(dto.getDescription());
        property.setPrice(dto.getPrice());
        property.setPropertyType(dto.getPropertyType());
        property.setListingType(dto.getListingType());
        property.setAddress(dto.getAddress());
        property.setCity(dto.getCity());
        property.setState(dto.getState());
        property.setPincode(dto.getPincode());
        property.setBedrooms(dto.getBedrooms());
        property.setBathrooms(dto.getBathrooms());
        property.setArea(dto.getArea());
        property.setYearBuilt(dto.getYearBuilt());
        property.setAmenities(toJson(dto.getAmenities()));
        property.setImages(toJson(dto.getImages()));
        
        return PropertyDto.fromEntity(propertyRepository.save(property));
    }
    
    @Transactional
    @CacheEvict(value = { "platformStats", "featuredProperties", "properties" }, allEntries = true)
    public void deleteProperty(Long id, Long userId) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));
        
        if (!property.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to delete this property");
        }

        inquiryRepository.deleteByPropertyId(id);
        propertyRepository.deleteById(id);
    }
    
    public Page<PropertyDto> searchProperties(
            String city,
            Property.PropertyType propertyType,
            Property.ListingType listingType,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Pageable pageable
    ) {
        return propertyRepository.searchProperties(
                Property.Status.ACTIVE,
                city,
                propertyType,
                listingType,
                minPrice,
                maxPrice,
                pageable
        ).map(PropertyDto::fromEntity);
    }
    
    public Long getTotalProperties() {
        return propertyRepository.count();
    }
    
    public Long getActiveProperties() {
        return propertyRepository.countByStatus(Property.Status.ACTIVE);
    }
    
    public Long getFeaturedPropertiesCount() {
        return propertyRepository.countByFeaturedTrueAndStatus(Property.Status.ACTIVE);
    }
    
    @Cacheable(value = "platformStats", unless = "#result == null")
    public java.util.Map<String, Object> getPlatformStats() {
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        Long totalProperties = propertyRepository.countByStatus(Property.Status.ACTIVE);
        Long totalBuyers = userRepository.countByRole(User.Role.USER);
        Long totalSellers = userRepository.countByRole(User.Role.SELLER);
        Long totalCities = propertyRepository.countDistinctCityByStatus(Property.Status.ACTIVE);
        
        stats.put("properties", totalProperties != null ? totalProperties : 0L);
        stats.put("buyers", totalBuyers != null ? totalBuyers : 0L);
        stats.put("sellers", totalSellers != null ? totalSellers : 0L);
        stats.put("cities", totalCities != null ? totalCities : 0L);
        stats.put("verifiedPercent", 100);
        
        return stats;
    }

    @Transactional
    public void incrementViews(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));
        property.setViews(property.getViews() != null ? property.getViews() + 1 : 1);
        propertyRepository.save(property);
    }

    public List<PropertyDto> getPropertiesByUserId(Long userId) {
        return propertyRepository.findByUserIdAndStatus(userId, Property.Status.ACTIVE)
                .stream()
                .map(PropertyDto::fromEntity)
                .toList();
    }

    private String toJson(java.util.List<String> list) {
        if (list == null) return "[]";
        try {
            return objectMapper.writeValueAsString(list);
        } catch (Exception e) {
            return "[]";
        }
    }
}