package com.luxeestates.service;

import com.luxeestates.dto.InquiryDto;
import com.luxeestates.model.Inquiry;
import com.luxeestates.model.Property;
import com.luxeestates.model.User;
import com.luxeestates.repository.InquiryRepository;
import com.luxeestates.repository.PropertyRepository;
import com.luxeestates.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InquiryService {

    private final InquiryRepository inquiryRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public InquiryDto createInquiry(InquiryDto dto) {
        Property property = null;
        if (dto.getPropertyId() != null) {
            property = propertyRepository.findById(dto.getPropertyId()).orElse(null);
        }

        User user = null;
        if (dto.getUserId() != null) {
            user = userRepository.findById(dto.getUserId()).orElse(null);
        }

        Inquiry inquiry = Inquiry.builder()
                .property(property)
                .user(user)
                .name(dto.getName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .message(dto.getMessage())
                .status(Inquiry.InquiryStatus.PENDING)
                .build();

        Inquiry saved = inquiryRepository.save(inquiry);

        // Send real-time notification to the property seller
        if (property != null && property.getUser() != null) {
            notificationService.sendNotification(
                    property.getUser().getId(),
                    "New Lead Received",
                    "You received a new inquiry from " + dto.getName() + " on your property '" + property.getTitle() + "'",
                    "LEAD_RECEIVED",
                    "/leads"
            );
        }

        return InquiryDto.fromEntity(saved);
    }

    public List<InquiryDto> getAllInquiries() {
        return inquiryRepository.findAll().stream()
                .map(InquiryDto::fromEntity)
                .collect(Collectors.toList());
    }

    public Page<InquiryDto> getInquiriesByProperty(Long propertyId, Pageable pageable) {
        return inquiryRepository.findByPropertyId(propertyId, pageable)
                .map(InquiryDto::fromEntity);
    }

    @Transactional
    public InquiryDto updateStatus(Long id, Inquiry.InquiryStatus status, Long actorUserId, boolean isAdmin) {
        Inquiry inquiry = inquiryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inquiry not found"));

        if (!isAdmin) {
            Long sellerId = inquiry.getProperty() != null && inquiry.getProperty().getUser() != null
                    ? inquiry.getProperty().getUser().getId()
                    : null;
            if (sellerId == null || !sellerId.equals(actorUserId)) {
                throw new org.springframework.security.access.AccessDeniedException("Not allowed to update this inquiry");
            }
        }

        inquiry.setStatus(status);
        return InquiryDto.fromEntity(inquiryRepository.save(inquiry));
    }

    @Transactional
    public void deleteInquiry(Long id) {
        inquiryRepository.deleteById(id);
    }

    public Long getTotalInquiries() {
        return inquiryRepository.count();
    }

    public Long getPendingInquiries() {
        return inquiryRepository.countByStatus(Inquiry.InquiryStatus.PENDING);
    }
    public List<InquiryDto> getInquiriesBySeller(Long userId) {
        return inquiryRepository.findBySellerId(userId).stream()
                .map(InquiryDto::fromEntity)
                .collect(Collectors.toList());
    }
}
