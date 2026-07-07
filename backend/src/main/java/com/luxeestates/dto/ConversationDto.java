package com.luxeestates.dto;

import com.luxeestates.model.Conversation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationDto {

    private Long id;
    private UserDto buyer;
    private UserDto seller;
    private PropertyDto property;
    private String lastMessage;
    private LocalDateTime lastMessageAt;
    private Long unreadCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ConversationDto fromEntity(Conversation conversation) {
        return ConversationDto.builder()
                .id(conversation.getId())
                .buyer(conversation.getBuyer() != null ? UserDto.fromEntity(conversation.getBuyer()) : null)
                .seller(conversation.getSeller() != null ? UserDto.fromEntity(conversation.getSeller()) : null)
                .property(conversation.getProperty() != null ? PropertyDto.fromEntity(conversation.getProperty()) : null)
                .lastMessage(conversation.getLastMessage())
                .lastMessageAt(conversation.getLastMessageAt())
                .createdAt(conversation.getCreatedAt())
                .updatedAt(conversation.getUpdatedAt())
                .build();
    }
}
