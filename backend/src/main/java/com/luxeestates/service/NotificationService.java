package com.luxeestates.service;

import com.luxeestates.dto.NotificationDto;
import com.luxeestates.model.Notification;
import com.luxeestates.model.User;
import com.luxeestates.repository.NotificationRepository;
import com.luxeestates.repository.UserRepository;
import com.luxeestates.security.NotificationWebSocketHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationWebSocketHandler webSocketHandler;

    @Transactional
    public void sendNotification(Long userId, String title, String message, String type, String redirectUrl) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            System.err.println("Cannot send notification: User ID " + userId + " not found.");
            return;
        }

        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .redirectUrl(redirectUrl)
                .createdAt(LocalDateTime.now())
                .build();

        notification = notificationRepository.save(notification);

        // Convert to DTO and push via WebSocket
        NotificationDto dto = NotificationDto.fromEntity(notification);
        webSocketHandler.sendToUser(userId, dto);
    }

    public List<NotificationDto> getNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public NotificationDto markAsRead(Long id, Long userId) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUser().getId().equals(userId)) {
            throw new org.springframework.security.access.AccessDeniedException("Not allowed to update this notification");
        }

        notification.setIsRead(true);
        return NotificationDto.fromEntity(notificationRepository.save(notification));
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        for (Notification notification : notifications) {
            if (!notification.getIsRead()) {
                notification.setIsRead(true);
                notificationRepository.save(notification);
            }
        }
    }
}
