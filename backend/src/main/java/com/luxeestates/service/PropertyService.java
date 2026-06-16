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
    private final CloudinaryService cloudinaryService;

    public Page<PropertyDto> getAllProperties(Pageable pageable) {
        org.springframework.data.domain.Sort sort = org.springframework.data.domain.Sort
                .by(org.springframework.data.domain.Sort.Order.desc("verified"))
                .and(org.springframework.data.domain.Sort
                        .by(org.springframework.data.domain.Sort.Order.desc("featured")));
        if (pageable.getSort().isSorted()) {
            sort = sort.and(pageable.getSort());
        } else {
            sort = sort.and(org.springframework.data.domain.Sort
                    .by(org.springframework.data.domain.Sort.Order.desc("createdAt")));
        }
        Pageable customPageable = org.springframework.data.domain.PageRequest.of(pageable.getPageNumber(),
                pageable.getPageSize(), sort);
        return propertyRepository.findByStatus(Property.Status.ACTIVE, customPageable)
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

        // Strict Backend Validation: Active Subscription Required for Sellers, or Free
        // Posts limit (3 posts)
        if (user.getRole() != User.Role.ADMIN) {
            String plan = user.getSubscriptionPlan();
            java.time.LocalDateTime expiry = user.getSubscriptionExpiry();

            boolean hasActiveSubscription = false;
            if (plan != null && !"NONE".equalsIgnoreCase(plan)) {
                if (expiry == null || expiry.isAfter(java.time.LocalDateTime.now())) {
                    hasActiveSubscription = true;
                }
            }

            if (!hasActiveSubscription) {
                // Check free posts count
                int used = user.getFreePostsUsed() != null ? user.getFreePostsUsed() : 0;
                if (used >= 3) {
                    throw new RuntimeException(
                            "You have used all 3 free posts. Please purchase a subscription plan to continue posting.");
                }

                // Allow posting and increment free posts count
                user.setFreePostsUsed(used + 1);
                userRepository.save(user);
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
            Pageable pageable) {
        org.springframework.data.domain.Sort sort = org.springframework.data.domain.Sort
                .by(org.springframework.data.domain.Sort.Order.desc("verified"))
                .and(org.springframework.data.domain.Sort
                        .by(org.springframework.data.domain.Sort.Order.desc("featured")));
        if (pageable.getSort().isSorted()) {
            sort = sort.and(pageable.getSort());
        } else {
            sort = sort.and(org.springframework.data.domain.Sort
                    .by(org.springframework.data.domain.Sort.Order.desc("createdAt")));
        }
        Pageable customPageable = org.springframework.data.domain.PageRequest.of(pageable.getPageNumber(),
                pageable.getPageSize(), sort);
        return propertyRepository.searchProperties(
                Property.Status.ACTIVE,
                city,
                propertyType,
                listingType,
                minPrice,
                maxPrice,
                customPageable).map(PropertyDto::fromEntity);
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
        if (list == null)
            return "[]";
        try {
            return objectMapper.writeValueAsString(list);
        } catch (Exception e) {
            return "[]";
        }
    }

    @Transactional
    @CacheEvict(value = { "platformStats", "featuredProperties", "properties" }, allEntries = true)
    public PropertyDto verifyPropertyLocation(Long id, org.springframework.web.multipart.MultipartFile file,
            List<org.springframework.web.multipart.MultipartFile> files,
            double latitude, double longitude, Long userId) {
        System.out
                .println("VERIFICATION DEBUG: Starting verification for Property ID = " + id + ", User ID = " + userId);

        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        boolean isAdmin = currentUser.getRole() == User.Role.ADMIN;

        System.out.println("VERIFICATION DEBUG: Property Owner ID = " + property.getUser().getId()
                + ", Current User IsAdmin = " + isAdmin);

        if (!property.getUser().getId().equals(userId) && !isAdmin) {
            throw new RuntimeException("Unauthorized: You do not own this property.");
        }

        System.out.println("VERIFICATION DEBUG: Declared coordinates: Lat = " + property.getLatitude() + ", Lng = "
                + property.getLongitude());
        System.out
                .println("VERIFICATION DEBUG: Incoming Device coordinates: Lat = " + latitude + ", Lng = " + longitude);

        if (latitude != 0 || longitude != 0) {
            System.out.println("VERIFICATION DEBUG: Setting property and verification coordinates to Lat=" + latitude
                    + ", Lng=" + longitude);
            property.setLatitude(java.math.BigDecimal.valueOf(latitude));
            property.setLongitude(java.math.BigDecimal.valueOf(longitude));
            property.setVerificationLatitude(java.math.BigDecimal.valueOf(latitude));
            property.setVerificationLongitude(java.math.BigDecimal.valueOf(longitude));
        }

        List<String> uploadedUrls = new java.util.ArrayList<>();

        if (file != null && !file.isEmpty()) {
            try {
                String photoUrl = cloudinaryService.uploadImage(file);
                uploadedUrls.add(photoUrl);
            } catch (java.io.IOException e) {
                throw new RuntimeException("Photo upload failed: " + e.getMessage());
            }
        }

        if (files != null && !files.isEmpty()) {
            for (org.springframework.web.multipart.MultipartFile f : files) {
                if (f != null && !f.isEmpty()) {
                    try {
                        String photoUrl = cloudinaryService.uploadImage(f);
                        uploadedUrls.add(photoUrl);
                    } catch (java.io.IOException e) {
                        System.out.println("VERIFICATION DEBUG: Photo upload failed for one of the files: " + e.getMessage());
                    }
                }
            }
        }

        if (uploadedUrls.isEmpty() && !isAdmin) {
            throw new RuntimeException("At least one photo is required for verification.");
        }

        property.setVerified(true);
        property.setVerifiedAt(java.time.LocalDateTime.now());
        if (latitude != 0 || longitude != 0) {
            property.setVerificationLatitude(java.math.BigDecimal.valueOf(latitude));
            property.setVerificationLongitude(java.math.BigDecimal.valueOf(longitude));
        }

        if (!uploadedUrls.isEmpty()) {
            property.setVerificationPhotoUrl(uploadedUrls.get(0));
            try {
                java.util.List<String> imgList = objectMapper.readValue(property.getImages(), new com.fasterxml.jackson.core.type.TypeReference<java.util.List<String>>() {});
                if (imgList == null) {
                    imgList = new java.util.ArrayList<>();
                }
                for (String url : uploadedUrls) {
                    if (!imgList.contains(url)) {
                        imgList.add(0, url);
                    }
                }
                property.setImages(objectMapper.writeValueAsString(imgList));
            } catch (Exception e) {
                try {
                    property.setImages(objectMapper.writeValueAsString(uploadedUrls));
                } catch (Exception ex) {
                    System.out.println("VERIFICATION DEBUG: Failed to save images: " + ex.getMessage());
                }
            }
        }

        return PropertyDto.fromEntity(propertyRepository.save(property));
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return 6371000 * c;
    }
}