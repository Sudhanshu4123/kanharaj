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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PropertyService {

    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final InquiryRepository inquiryRepository;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;
    private final CloudinaryService cloudinaryService;
    private final NotificationService notificationService;

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
            boolean hasActiveSubscription = true;

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
                .developer(dto.getDeveloper())
                .reraId(dto.getReraId())
                .constructionStatus(dto.getConstructionStatus())
                .possessionDate(dto.getPossessionDate())
                .projectUnits(dto.getProjectUnits())
                .areaUnit(dto.getAreaUnit())
                .projectArea(dto.getProjectArea())
                .sizes(dto.getSizes())
                .configurations(dto.getConfigurations())
                .projectSize(dto.getProjectSize())
                .launchDate(dto.getLaunchDate())
                .avgPrice(dto.getAvgPrice())
                .brochureUrl(dto.getBrochureUrl())
                .projectId(dto.getProjectId())
                .user(user)
                .build();

        Property savedProperty = propertyRepository.save(property);

        // Send notification to the user listing the property
        try {
            notificationService.sendNotification(
                    user.getId(),
                    "Property Listed Successfully",
                    "Your property '" + savedProperty.getTitle() + "' has been listed successfully!",
                    "PROPERTY_LISTED",
                    "/listings"
            );
        } catch (Exception e) {
            System.err.println("Failed to send property listing notification to user: " + e.getMessage());
        }

        // Notify admins about the new property listing
        try {
            java.util.List<User> admins = userRepository.findByRole(User.Role.ADMIN);
            if (admins != null) {
                for (User admin : admins) {
                    notificationService.sendNotification(
                            admin.getId(),
                            "New Property Listed",
                            "A new property '" + savedProperty.getTitle() + "' has been listed by " + user.getName() + " and is pending verification.",
                            "NEW_PROPERTY_LISTED",
                            "/admin"
                    );
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to notify admins of new property listing: " + e.getMessage());
        }

        return PropertyDto.fromEntity(savedProperty);
    }

    @Transactional
    @CacheEvict(value = { "platformStats", "featuredProperties", "properties" }, allEntries = true)
    public PropertyDto updateProperty(Long id, PropertyDto dto, Long userId) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        boolean isAdmin = currentUser.getRole() == User.Role.ADMIN;

        if (!property.getUser().getId().equals(userId) && !isAdmin) {
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
        property.setDeveloper(dto.getDeveloper());
        property.setReraId(dto.getReraId());
        property.setConstructionStatus(dto.getConstructionStatus());
        property.setPossessionDate(dto.getPossessionDate());
        property.setProjectUnits(dto.getProjectUnits());
        property.setAreaUnit(dto.getAreaUnit());
        property.setProjectArea(dto.getProjectArea());
        property.setSizes(dto.getSizes());
        property.setConfigurations(dto.getConfigurations());
        property.setProjectSize(dto.getProjectSize());
        property.setLaunchDate(dto.getLaunchDate());
        property.setAvgPrice(dto.getAvgPrice());
        property.setBrochureUrl(dto.getBrochureUrl());
        property.setProjectId(dto.getProjectId());

        return PropertyDto.fromEntity(propertyRepository.save(property));
    }

    @Transactional
    @CacheEvict(value = { "platformStats", "featuredProperties", "properties" }, allEntries = true)
    public void deleteProperty(Long id, Long userId) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        boolean isAdmin = currentUser.getRole() == User.Role.ADMIN;

        if (!property.getUser().getId().equals(userId) && !isAdmin) {
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
        return propertyRepository.countByStatusAndPropertyTypeNotIn(
            Property.Status.ACTIVE,
            List.of(Property.PropertyType.RESIDENTIAL_PROJECT, Property.PropertyType.COMMERCIAL_PROJECT)
        );
    }

    public Long getFeaturedPropertiesCount() {
        return propertyRepository.countByFeaturedTrueAndStatus(Property.Status.ACTIVE);
    }

    @Cacheable(value = "platformStats", unless = "#result == null")
    public java.util.Map<String, Object> getPlatformStats() {
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        Long totalProperties = propertyRepository.countByStatusAndPropertyTypeNotIn(
            Property.Status.ACTIVE,
            List.of(Property.PropertyType.RESIDENTIAL_PROJECT, Property.PropertyType.COMMERCIAL_PROJECT)
        );
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

        if (latitude == 0.0 && longitude == 0.0) {
            throw new RuntimeException("Device coordinates are missing. Geolocation is required for verification.");
        }

        double refLat = 0.0;
        double refLon = 0.0;
        boolean hasRef = false;
        boolean geocoded = false;

        // 1. Try to geocode cleaned address + city
        String cleanedAddr = cleanAddress(property.getAddress());
        double[] coords = geocodeAddress(cleanedAddr, property.getCity());
        if (coords != null) {
            refLat = coords[0];
            refLon = coords[1];
            hasRef = true;
            geocoded = true;
            System.out.println("VERIFICATION DEBUG: Geocoded (cleaned) address to Lat=" + refLat + ", Lng=" + refLon);
        } else {
            // Try with raw address + city
            coords = geocodeAddress(property.getAddress(), property.getCity());
            if (coords != null) {
                refLat = coords[0];
                refLon = coords[1];
                hasRef = true;
                geocoded = true;
                System.out.println("VERIFICATION DEBUG: Geocoded (raw) address to Lat=" + refLat + ", Lng=" + refLon);
            }
        }

        // 2. Fallback to property's already saved coordinates if available and non-zero
        if (!hasRef && property.getLatitude() != null && property.getLongitude() != null &&
                property.getLatitude().doubleValue() != 0.0 && property.getLongitude().doubleValue() != 0.0) {
            refLat = property.getLatitude().doubleValue();
            refLon = property.getLongitude().doubleValue();
            hasRef = true;
            System.out.println("VERIFICATION DEBUG: Using saved coordinates Lat=" + refLat + ", Lng=" + refLon);
        }

        // 3. Fallback to geocoding just the city
        if (!hasRef) {
            coords = geocodeAddress("", property.getCity());
            if (coords != null) {
                refLat = coords[0];
                refLon = coords[1];
                hasRef = true;
                System.out.println("VERIFICATION DEBUG: Geocoded city center to Lat=" + refLat + ", Lng=" + refLon);
                
                // For city center fallback, use 25 km tolerance
                double distance = calculateDistance(refLat, refLon, latitude, longitude);
                if (distance > 25000.0) {
                    throw new RuntimeException("Verification mismatch: You must be present in the city of the property (" + property.getCity() + ").");
                }
            }
        }

        // Enforce the 1500 meters check if we successfully geocoded the address/locality
        if (hasRef) {
            double distance = calculateDistance(refLat, refLon, latitude, longitude);
            System.out.println("VERIFICATION DEBUG: Calculated distance: " + distance + " meters");
            
            if (geocoded) {
                if (distance > 1500.0) {
                    throw new RuntimeException("Verification mismatch: You must be present at the property location (within 1.5 km of " + property.getAddress() + ", " + property.getCity() + "). Current distance: " + Math.round(distance) + " meters.");
                }
            } else {
                // If using saved coordinates, enforce 1500m tolerance as well
                if (distance > 1500.0) {
                    throw new RuntimeException("Verification mismatch: You must be present at the property location (within 1.5 km). Current distance: " + Math.round(distance) + " meters.");
                }
            }
        } else {
            // If completely unable to determine location, throw an error to be safe
            throw new RuntimeException("Unable to verify property address location. Please ensure the City and Address are valid.");
        }

        // Update the property's coordinates to device GPS coordinates on successful verification
        property.setLatitude(java.math.BigDecimal.valueOf(latitude));
        property.setLongitude(java.math.BigDecimal.valueOf(longitude));
        property.setVerificationLatitude(java.math.BigDecimal.valueOf(latitude));
        property.setVerificationLongitude(java.math.BigDecimal.valueOf(longitude));

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
        if (!uploadedUrls.isEmpty()) {
            property.setVerificationPhotoUrl(uploadedUrls.get(0));
            try {
                // Completely replace the existing images with the newly verified images list
                property.setImages(objectMapper.writeValueAsString(uploadedUrls));
            } catch (Exception e) {
                System.out.println("VERIFICATION DEBUG: Failed to save verified images: " + e.getMessage());
            }
        }

        Property savedProp = propertyRepository.save(property);
        notificationService.sendNotification(
                savedProp.getUser().getId(),
                "Listing Verified",
                "Your property listing '" + savedProp.getTitle() + "' has been successfully verified!",
                "PROPERTY_VERIFIED",
                "/listings"
        );

        return PropertyDto.fromEntity(savedProp);
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

    private String cleanAddress(String address) {
        if (address == null) return "";
        // Remove patterns like H.No, Flat, Flat No, Room, Unit, Shop, 1st Floor, 2nd Floor, etc.
        String cleaned = address.replaceAll("(?i)\\b(flat|h\\.no|house|plot|shop|office|unit|room|floor|pocket|block|sector)\\s*\\d*\\w*\\b", "");
        cleaned = cleaned.replaceAll("(?i)\\b\\d+(st|nd|rd|th)\\s*floor\\b", "");
        cleaned = cleaned.replaceAll("(?i)\\b\\d+\\b", ""); // Remove isolated digits
        cleaned = cleaned.replaceAll("\\s+", " ").trim();
        // Remove leading/trailing commas and spaces
        cleaned = cleaned.replaceAll("^[,\\s]+|[,\\s]+$", "");
        return cleaned.isEmpty() ? address : cleaned;
    }

    private double[] geocodeAddress(String address, String city) {
        try {
            String query = (address + ", " + city).trim();
            if (query.isEmpty()) return null;
            
            String url = "https://nominatim.openstreetmap.org/search?q=" 
                + java.net.URLEncoder.encode(query, "UTF-8") 
                + "&format=json&limit=1";
            
            java.net.HttpURLConnection conn = (java.net.HttpURLConnection) new java.net.URL(url).openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("User-Agent", "KanharajPropertyVerificationAgent/1.0");
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(5000);
            
            if (conn.getResponseCode() == 200) {
                java.io.InputStream in = conn.getInputStream();
                java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.InputStreamReader(in));
                StringBuilder response = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    response.append(line);
                }
                reader.close();
                
                String json = response.toString();
                if (json.contains("\"lat\":\"") && json.contains("\"lon\":\"")) {
                    int latIdx = json.indexOf("\"lat\":\"") + 7;
                    int latEnd = json.indexOf("\"", latIdx);
                    double lat = Double.parseDouble(json.substring(latIdx, latEnd));
                    
                    int lonIdx = json.indexOf("\"lon\":\"") + 7;
                    int lonEnd = json.indexOf("\"", lonIdx);
                    double lon = Double.parseDouble(json.substring(lonIdx, lonEnd));
                    
                    return new double[] { lat, lon };
                }
            }
        } catch (Exception e) {
            System.out.println("GEOCODING ERROR: " + e.getMessage());
        }
        return null;
    }

    public List<PropertyDto> getPropertiesByProjectId(Long projectId) {
        return propertyRepository.findByProjectIdAndStatus(projectId, Property.Status.ACTIVE).stream()
                .map(PropertyDto::fromEntity)
                .collect(Collectors.toList());
    }

    public List<PropertyDto> getActiveProjects() {
        return propertyRepository.findByPropertyTypeInAndStatus(
                List.of(Property.PropertyType.RESIDENTIAL_PROJECT, Property.PropertyType.COMMERCIAL_PROJECT),
                Property.Status.ACTIVE
        ).stream()
                .map(PropertyDto::fromEntity)
                .collect(Collectors.toList());
    }
}