package com.luxeestates.controller;

import com.luxeestates.dto.ChatMessageDto;
import com.luxeestates.dto.ConversationDto;
import com.luxeestates.security.CustomUserDetails;
import com.luxeestates.service.ChatService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChatController {

    private final ChatService chatService;

    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationDto>> getConversations(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(chatService.getConversationsForUser(userDetails.getId()));
    }

    @GetMapping("/conversations/{id}/messages")
    public ResponseEntity<List<ChatMessageDto>> getMessages(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        try {
            return ResponseEntity.ok(chatService.getMessagesForConversation(id, userDetails.getId()));
        } catch (org.springframework.security.access.AccessDeniedException e) {
            return ResponseEntity.status(403).build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/conversations")
    public ResponseEntity<ConversationDto> getOrCreateConversation(
            @RequestBody CreateConversationRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        if (request.getSellerId() == null) {
            return ResponseEntity.badRequest().build();
        }
        try {
            ConversationDto conversation = chatService.getOrCreateConversation(
                    userDetails.getId(),
                    request.getSellerId(),
                    request.getPropertyId()
            );
            return ResponseEntity.ok(conversation);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PostMapping("/messages")
    public ResponseEntity<ChatMessageDto> sendMessage(
            @RequestBody SendMessageRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        if (request.getConversationId() == null || request.getContent() == null || request.getContent().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        try {
            ChatMessageDto message = chatService.sendMessage(
                    userDetails.getId(),
                    request.getConversationId(),
                    request.getContent()
            );
            return ResponseEntity.ok(message);
        } catch (org.springframework.security.access.AccessDeniedException e) {
            return ResponseEntity.status(403).build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateConversationRequest {
        private Long sellerId;
        private Long propertyId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SendMessageRequest {
        private Long conversationId;
        private String content;
    }
}
