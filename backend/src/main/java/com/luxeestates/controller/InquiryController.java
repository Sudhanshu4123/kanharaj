package com.luxeestates.controller;

import com.luxeestates.dto.InquiryDto;
import com.luxeestates.model.Inquiry;
import com.luxeestates.security.CustomUserDetails;
import com.luxeestates.service.InquiryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inquiries")
@RequiredArgsConstructor
public class InquiryController {

    private final InquiryService inquiryService;

    @PostMapping
    public ResponseEntity<InquiryDto> createInquiry(@RequestBody InquiryDto dto) {
        return ResponseEntity.ok(inquiryService.createInquiry(dto));
    }

    @GetMapping
    public ResponseEntity<List<InquiryDto>> getAllInquiries() {
        return ResponseEntity.ok(inquiryService.getAllInquiries());
    }

    @GetMapping("/seller")
    public ResponseEntity<List<InquiryDto>> getSellerInquiries(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) Long sellerId
    ) {
        Long id = (userDetails != null) ? userDetails.getId() : sellerId;
        if (id == null) id = 1L; // Fallback to sample seller/admin
        return ResponseEntity.ok(inquiryService.getInquiriesBySeller(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<InquiryDto> updateStatus(
            @PathVariable Long id,
            @RequestParam Inquiry.InquiryStatus status
    ) {
        return ResponseEntity.ok(inquiryService.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInquiry(@PathVariable Long id) {
        inquiryService.deleteInquiry(id);
        return ResponseEntity.noContent().build();
    }
}
