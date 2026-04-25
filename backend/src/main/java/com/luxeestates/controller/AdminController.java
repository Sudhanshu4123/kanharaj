package com.luxeestates.controller;

import com.luxeestates.service.AuthService;
import com.luxeestates.service.InquiryService;
import com.luxeestates.service.PropertyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    
    private final PropertyService propertyService;
    private final AuthService authService;
    private final InquiryService inquiryService;
    
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
}