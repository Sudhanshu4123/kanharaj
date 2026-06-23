package com.luxeestates.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.luxeestates.dto.NotificationDto;
import com.luxeestates.model.User;
import com.luxeestates.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
@RequiredArgsConstructor
public class NotificationWebSocketHandler extends TextWebSocketHandler {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    // Map: userId -> List of active WebSocket sessions
    private static final Map<Long, List<WebSocketSession>> userSessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String query = session.getUri().getQuery();
        String token = null;

        if (query != null && query.contains("token=")) {
            String[] params = query.split("&");
            for (String param : params) {
                if (param.startsWith("token=")) {
                    token = param.substring(6);
                    break;
                }
            }
        }

        if (token != null && jwtTokenProvider.validateToken(token)) {
            String email = jwtTokenProvider.extractUsername(token);
            User user = userRepository.findByEmail(email).orElse(null);

            if (user != null) {
                Long userId = user.getId();
                session.getAttributes().put("userId", userId);
                userSessions.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>()).add(session);
                System.out.println("WebSocket Connection Established for User ID: " + userId + ", Session ID: " + session.getId());
                return;
            }
        }

        // Close connection if token is invalid or user not found
        System.out.println("Invalid WebSocket Handshake, closing connection");
        session.close(CloseStatus.BAD_DATA);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        Long userId = (Long) session.getAttributes().get("userId");
        if (userId != null) {
            List<WebSocketSession> sessions = userSessions.get(userId);
            if (sessions != null) {
                sessions.remove(session);
                if (sessions.isEmpty()) {
                    userSessions.remove(userId);
                }
            }
            System.out.println("WebSocket Connection Closed for User ID: " + userId + ", Session ID: " + session.getId());
        }
    }

    public void sendToUser(Long userId, NotificationDto dto) {
        List<WebSocketSession> sessions = userSessions.get(userId);
        if (sessions != null && !sessions.isEmpty()) {
            try {
                String payload = objectMapper.writeValueAsString(dto);
                TextMessage message = new TextMessage(payload);
                for (WebSocketSession session : sessions) {
                    if (session.isOpen()) {
                        session.sendMessage(message);
                    }
                }
            } catch (IOException e) {
                System.err.println("Error sending WebSocket notification to user " + userId + ": " + e.getMessage());
            }
        }
    }
}
