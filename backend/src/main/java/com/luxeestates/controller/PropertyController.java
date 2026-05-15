package com.luxeestates.controller;

import com.luxeestates.dto.PropertyDto;
import com.luxeestates.model.Property;
import com.luxeestates.security.CustomUserDetails;
import com.luxeestates.service.PropertyService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
public class PropertyController {
    
    private final PropertyService propertyService;
    
    @GetMapping
    public ResponseEntity<Page<PropertyDto>> getAllProperties(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc") 
                ? Sort.by(sortBy).ascending() 
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(propertyService.getAllProperties(pageable));
    }
    
    @GetMapping("/featured")
    public ResponseEntity<List<PropertyDto>> getFeaturedProperties() {
        return ResponseEntity.ok(propertyService.getFeaturedProperties());
    }

    @GetMapping("/my")
    public ResponseEntity<List<PropertyDto>> getMyProperties(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(propertyService.getPropertiesByUserId(userDetails.getId()));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<PropertyDto> getPropertyById(@PathVariable Long id) {
        return ResponseEntity.ok(propertyService.getPropertyById(id));
    }

    @PostMapping("/{id}/view")
    public ResponseEntity<Void> incrementViews(@PathVariable Long id) {
        propertyService.incrementViews(id);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/search")
    public ResponseEntity<Page<PropertyDto>> searchProperties(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Property.PropertyType propertyType,
            @RequestParam(required = false) Property.ListingType listingType,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(propertyService.searchProperties(
                city, propertyType, listingType, minPrice, maxPrice, pageable
        ));
    }
    
    @PostMapping
    public ResponseEntity<PropertyDto> createProperty(
            @RequestBody PropertyDto dto,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        
        // Restrict to SELLER or ADMIN only
        boolean isAuthorized = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_SELLER") || a.getAuthority().equals("ROLE_ADMIN"));
        
        if (!isAuthorized) {
            return ResponseEntity.status(403).build();
        }
        
        return ResponseEntity.ok(propertyService.createProperty(dto, userDetails.getId()));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<PropertyDto> updateProperty(
            @PathVariable Long id,
            @RequestBody PropertyDto dto,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        if (userDetails == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(propertyService.updateProperty(id, dto, userDetails.getId()));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProperty(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        if (userDetails == null) return ResponseEntity.status(401).build();
        propertyService.deleteProperty(id, userDetails.getId());
        return ResponseEntity.noContent().build();
    }
}