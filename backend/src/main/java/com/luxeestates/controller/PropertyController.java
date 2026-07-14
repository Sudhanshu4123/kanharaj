package com.luxeestates.controller;

import com.luxeestates.dto.PropertyDto;
import com.luxeestates.model.Property;
import com.luxeestates.model.Seller;
import com.luxeestates.model.User;
import com.luxeestates.repository.SellerRepository;
import com.luxeestates.repository.UserRepository;
import com.luxeestates.security.CustomUserDetails;
import com.luxeestates.service.PropertyService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import java.util.concurrent.TimeUnit;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
public class PropertyController {

    private final PropertyService propertyService;
    private final UserRepository userRepository;
    private final SellerRepository sellerRepository;

    @GetMapping
    public ResponseEntity<Page<PropertyDto>> getAllProperties(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        String safeSort = switch (sortBy) {
            case "price", "createdAt", "updatedAt", "title", "views" -> sortBy;
            default -> "createdAt";
        };
        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(safeSort).ascending()
                : Sort.by(safeSort).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(propertyService.getAllProperties(pageable));
    }

    @GetMapping("/featured")
    public ResponseEntity<List<PropertyDto>> getFeaturedProperties() {
        return ResponseEntity.ok(propertyService.getFeaturedProperties());
    }

    @GetMapping("/stats")
    public ResponseEntity<java.util.Map<String, Object>> getPlatformStats() {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(5, TimeUnit.MINUTES).cachePublic())
                .body(propertyService.getPlatformStats());
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

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<PropertyDto>> getPropertiesByProjectId(@PathVariable Long projectId) {
        return ResponseEntity.ok(propertyService.getPropertiesByProjectId(projectId));
    }

    @GetMapping("/projects")
    public ResponseEntity<List<PropertyDto>> getActiveProjects() {
        return ResponseEntity.ok(propertyService.getActiveProjects());
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
    public ResponseEntity<?> createProperty(
            @RequestBody PropertyDto dto,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        User user = userRepository.findById(userDetails.getId()).orElseThrow();

        // ── ADMIN bypass ───────────────────────────────────────────────────────
        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (isAdmin) {
            return ResponseEntity.ok(propertyService.createProperty(dto, userDetails.getId()));
        }

        // ── Check active subscription ──────────────────────────────────────────
        boolean hasActiveSub = true;
        String activePlan = "SUPER";

        // Listing type: BUY or RENT
        Property.ListingType listingType = dto.getListingType();
        // Property type: used to detect PG listings
        Property.PropertyType propertyType = dto.getPropertyType();
        boolean isPG = propertyType == Property.PropertyType.PG;
        boolean isRent = listingType == Property.ListingType.RENT;

        if (hasActiveSub) {
            // ── Plan-based restriction ─────────────────────────────────────────
            // BASIC  → BUY only (no Rent, no PG)
            // PREMIUM → BUY + PG (no Rent)
            // SUPER  → BUY + RENT + PG (everything)
            boolean allowed = switch (activePlan.toUpperCase()) {
                case "BASIC"   -> !isRent && !isPG;
                case "PREMIUM" -> !isRent;       // BUY and PG allowed
                case "SUPER"   -> true;
                default        -> false;
            };

            if (!allowed) {
                String msg = switch (activePlan.toUpperCase()) {
                    case "BASIC"   -> "Basic Plan sirf Sell (BUY) listings allow karta hai. Rent/PG ke liye Premium ya Super plan lo.";
                    case "PREMIUM" -> "Premium Plan sirf Sell aur PG listings allow karta hai. Rent ke liye Super plan lo.";
                    default        -> "Aapka plan is listing type ko allow nahi karta.";
                };
                return ResponseEntity.status(403).body(Map.of("message", msg));
            }

            return ResponseEntity.ok(propertyService.createProperty(dto, userDetails.getId()));

        } else {
            // ── Free trial: max 3 posts ────────────────────────────────────────
            int freeUsed = user.getFreePostsUsed() != null ? user.getFreePostsUsed() : 0;
            if (freeUsed >= 3) {
                return ResponseEntity.status(403).body(Map.of(
                        "message", "Aapke 3 free posts use ho gaye hain. Property add karne ke liye please ek plan subscribe karo.",
                        "redirect", "/subscription"
                ));
            }

            // Save property and increment free post count
            PropertyDto saved = propertyService.createProperty(dto, userDetails.getId());
            user.setFreePostsUsed(freeUsed + 1);
            userRepository.save(user);
            return ResponseEntity.ok(saved);
        }
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

    @PostMapping("/{id}/verify-location")
    public ResponseEntity<?> verifyPropertyLocation(
            @PathVariable Long id,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "files", required = false) List<MultipartFile> files,
            @RequestParam("latitude") double latitude,
            @RequestParam("longitude") double longitude,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }
        try {
            PropertyDto verifiedProp = propertyService.verifyPropertyLocation(
                    id, file, files, latitude, longitude, userDetails.getId()
            );
            return ResponseEntity.ok(verifiedProp);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}