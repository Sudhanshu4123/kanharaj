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

        return InquiryDto.fromEntity(inquiryRepository.save(inquiry));
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
    public InquiryDto updateStatus(Long id, Inquiry.InquiryStatus status) {
        Inquiry inquiry = inquiryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inquiry not found"));
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
}
