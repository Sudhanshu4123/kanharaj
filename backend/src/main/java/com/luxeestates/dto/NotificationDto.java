package com.luxeestates.dto;

import com.luxeestates.model.Notification;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDto {
    private Long id;
    private Long userId;
    private String title;
    private String message;
    private String type;
    private Boolean isRead;
    private String redirectUrl;
    private LocalDateTime createdAt;

    public static NotificationDto fromEntity(Notification entity) {
        return NotificationDto.builder()
                .id(entity.getId())
                .userId(entity.getUser() != null ? entity.getUser().getId() : null)
                .title(entity.getTitle())
                .message(entity.getMessage())
                .type(entity.getType())
                .isRead(entity.getIsRead())
                .redirectUrl(entity.getRedirectUrl())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
