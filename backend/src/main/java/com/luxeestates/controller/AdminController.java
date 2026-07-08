package com.luxeestates.controller;

import com.luxeestates.dto.UserDto;
import com.luxeestates.dto.PropertyDto;
import com.luxeestates.model.User;
import com.luxeestates.model.Property;
import com.luxeestates.repository.UserRepository;
import com.luxeestates.repository.PropertyRepository;
import com.luxeestates.service.AuthService;
import com.luxeestates.service.InquiryService;
import com.luxeestates.service.PropertyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*")
public class AdminController {
    
    private final PropertyService propertyService;
    private final AuthService authService;
    private final InquiryService inquiryService;
    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        Map<String, Object> dashboard = new LinkedHashMap<>();
        
        dashboard.put("totalProperties", propertyService.getTotalProperties());
        dashboard.put("activeProperties", propertyService.getActiveProperties());
        dashboard.put("featuredProperties", propertyService.getFeaturedPropertiesCount());
        dashboard.put("totalUsers", authService.getTotalUsers());
        dashboard.put("totalAdmins", authService.getTotalAdmins());
        dashboard.put("totalInquiries", inquiryService.getTotalInquiries());
        dashboard.put("pendingInquiries", inquiryService.getPendingInquiries());
        
        return ResponseEntity.ok(dashboard);
    }
    
    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        Map<String, Object> analytics = new LinkedHashMap<>();
        
        analytics.put("propertiesByType", propertyService.getActiveProperties());
        analytics.put("usersByRole", authService.getTotalUsers());
        
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(authService.getAllUsers());
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<UserDto> updateUserRole(
            @PathVariable Long id,
            @RequestParam User.Role role
    ) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(role);
        userRepository.save(user);
        return ResponseEntity.ok(UserDto.fromEntity(user));
    }

    @PutMapping("/properties/{id}/verify")
    public ResponseEntity<PropertyDto> verifyProperty(
            @PathVariable Long id,
            @RequestParam boolean verified
    ) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));
        property.setVerified(verified);
        if (verified) {
            property.setVerifiedAt(LocalDateTime.now());
        } else {
            property.setVerifiedAt(null);
        }
        propertyRepository.save(property);
        return ResponseEntity.ok(PropertyDto.fromEntity(property));
    }

    @PutMapping("/properties/{id}/featured")
    public ResponseEntity<PropertyDto> togglePropertyFeatured(
            @PathVariable Long id,
            @RequestParam boolean featured
    ) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));
        property.setFeatured(featured);
        propertyRepository.save(property);
        return ResponseEntity.ok(PropertyDto.fromEntity(property));
    }
}