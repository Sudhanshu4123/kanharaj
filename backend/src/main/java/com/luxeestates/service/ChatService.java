package com.luxeestates.service;

import com.luxeestates.dto.ChatMessageDto;
import com.luxeestates.dto.ConversationDto;
import com.luxeestates.model.ChatMessage;
import com.luxeestates.model.Conversation;
import com.luxeestates.model.Property;
import com.luxeestates.model.User;
import com.luxeestates.repository.ChatMessageRepository;
import com.luxeestates.repository.ConversationRepository;
import com.luxeestates.repository.PropertyRepository;
import com.luxeestates.repository.UserRepository;
import com.luxeestates.security.ChatWebSocketHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ConversationRepository conversationRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final ChatWebSocketHandler chatWebSocketHandler;

    public List<ConversationDto> getConversationsForUser(Long userId) {
        return conversationRepository.findActiveConversationsForUser(userId).stream()
                .map(conversation -> {
                    ConversationDto dto = ConversationDto.fromEntity(conversation);
                    dto.setUnreadCount(chatMessageRepository.countUnreadMessages(conversation.getId(), userId));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public List<ChatMessageDto> getMessagesForConversation(Long conversationId, Long userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        if (!conversation.getBuyer().getId().equals(userId) && !conversation.getSeller().getId().equals(userId)) {
            throw new org.springframework.security.access.AccessDeniedException("Not authorized to view these messages");
        }

        // Mark messages as read for receiver
        chatMessageRepository.markAsRead(conversationId, userId);

        return chatMessageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId).stream()
                .map(ChatMessageDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public ConversationDto getOrCreateConversation(Long buyerId, Long sellerId, Long propertyId) {
        if (buyerId.equals(sellerId)) {
            throw new RuntimeException("You cannot start a chat with yourself");
        }

        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new RuntimeException("Buyer not found"));
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));

        Property property = null;
        if (propertyId != null) {
            property = propertyRepository.findById(propertyId).orElse(null);
        }

        // Check if there is already a conversation between these two users
        Conversation conversation = conversationRepository.findBetweenUsers(buyerId, sellerId).orElse(null);

        if (conversation == null) {
            conversation = Conversation.builder()
                    .buyer(buyer)
                    .seller(seller)
                    .property(property)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            conversation = conversationRepository.save(conversation);
        } else {
            // Update conversation to reference the latest property discussed, if a new propertyId is passed
            if (property != null && (conversation.getProperty() == null || !conversation.getProperty().getId().equals(propertyId))) {
                conversation.setProperty(property);
                conversation.setUpdatedAt(LocalDateTime.now());
                conversation = conversationRepository.save(conversation);
            }
        }

        ConversationDto dto = ConversationDto.fromEntity(conversation);
        dto.setUnreadCount(chatMessageRepository.countUnreadMessages(conversation.getId(), buyerId));
        return dto;
    }

    @Transactional
    public ChatMessageDto sendMessage(Long senderId, Long conversationId, String content) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        if (!conversation.getBuyer().getId().equals(senderId) && !conversation.getSeller().getId().equals(senderId)) {
            throw new org.springframework.security.access.AccessDeniedException("Not authorized to send messages in this conversation");
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        ChatMessage message = ChatMessage.builder()
                .conversation(conversation)
                .sender(sender)
                .content(content)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        message = chatMessageRepository.save(message);

        // Update conversation summary
        conversation.setLastMessage(content);
        conversation.setLastMessageAt(LocalDateTime.now());
        conversation.setUpdatedAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        ChatMessageDto messageDto = ChatMessageDto.fromEntity(message);

        // Determine recipient
        Long recipientId = conversation.getBuyer().getId().equals(senderId)
                ? conversation.getSeller().getId()
                : conversation.getBuyer().getId();

        // Broadcast to recipient
        chatWebSocketHandler.sendToUser(recipientId, messageDto);
        // Broadcast to sender (to sync multiple tabs)
        chatWebSocketHandler.sendToUser(senderId, messageDto);

        return messageDto;
    }
}
