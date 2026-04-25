package com.luxeestates.dto;

import com.luxeestates.model.Inquiry;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InquiryDto {
    private Long id;
    private Long propertyId;
    private String propertyTitle;
    private Long userId;
    private String name;
    private String email;
    private String phone;
    private String message;
    private Inquiry.InquiryStatus status;
    private LocalDateTime createdAt;

    public static InquiryDto fromEntity(Inquiry inquiry) {
        return InquiryDto.builder()
                .id(inquiry.getId())
                .propertyId(inquiry.getProperty() != null ? inquiry.getProperty().getId() : null)
                .propertyTitle(inquiry.getProperty() != null ? inquiry.getProperty().getTitle() : "General Inquiry")
                .userId(inquiry.getUser() != null ? inquiry.getUser().getId() : null)
                .name(inquiry.getName())
                .email(inquiry.getEmail())
                .phone(inquiry.getPhone())
                .message(inquiry.getMessage())
                .status(inquiry.getStatus())
                .createdAt(inquiry.getCreatedAt())
                .build();
    }
}
