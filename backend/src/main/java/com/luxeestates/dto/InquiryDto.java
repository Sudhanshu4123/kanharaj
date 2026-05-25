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
    private String propertyLocation;
    private Long userId;
    private String name;
    private String email;
    private String phone;
    private String message;
    private Inquiry.InquiryStatus status;
    private LocalDateTime createdAt;
    private String propertyType;
    private String listingType;
    private java.math.BigDecimal price;
    private Integer area;
    private Integer bedrooms;

    public static InquiryDto fromEntity(Inquiry inquiry) {
        String location = null;
        if (inquiry.getProperty() != null) {
            String addr = inquiry.getProperty().getAddress();
            String city = inquiry.getProperty().getCity();
            if (addr != null && city != null) location = addr + ", " + city;
            else if (city != null) location = city;
            else if (addr != null) location = addr;
        }
        return InquiryDto.builder()
                .id(inquiry.getId())
                .propertyId(inquiry.getProperty() != null ? inquiry.getProperty().getId() : null)
                .propertyTitle(inquiry.getProperty() != null ? inquiry.getProperty().getTitle() : "General Inquiry")
                .propertyLocation(location)
                .userId(inquiry.getUser() != null ? inquiry.getUser().getId() : null)
                .name(inquiry.getName())
                .email(inquiry.getEmail())
                .phone(inquiry.getPhone())
                .message(inquiry.getMessage())
                .status(inquiry.getStatus())
                .createdAt(inquiry.getCreatedAt())
                .propertyType(inquiry.getProperty() != null && inquiry.getProperty().getPropertyType() != null
                        ? inquiry.getProperty().getPropertyType().name() : null)
                .listingType(inquiry.getProperty() != null && inquiry.getProperty().getListingType() != null
                        ? inquiry.getProperty().getListingType().name() : null)
                .price(inquiry.getProperty() != null ? inquiry.getProperty().getPrice() : null)
                .area(inquiry.getProperty() != null ? inquiry.getProperty().getArea() : null)
                .bedrooms(inquiry.getProperty() != null ? inquiry.getProperty().getBedrooms() : null)
                .build();
    }
}
