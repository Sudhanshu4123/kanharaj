package com.luxeestates.controller;

import com.luxeestates.dto.NotificationDto;
import com.luxeestates.security.CustomUserDetails;
import com.luxeestates.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationDto>> getNotifications(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(notificationService.getNotifications(userDetails.getId()));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationDto> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(notificationService.markAsRead(id, userDetails.getId()));
    }

    @PostMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        notificationService.markAllAsRead(userDetails.getId());
        return ResponseEntity.noContent().build();
    }
}
