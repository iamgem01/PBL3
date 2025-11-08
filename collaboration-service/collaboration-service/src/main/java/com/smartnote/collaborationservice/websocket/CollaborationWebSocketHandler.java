package com.example.collabservice.websocket;

import com.example.collabservice.dto.websocket.CollaborationMessage;
import com.example.collabservice.model.DocumentChange;
import com.example.collabservice.service.CollaborationService;
import com.example.collabservice.service.PermissionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class CollaborationWebSocketHandler extends TextWebSocketHandler {

    private final CollaborationService collaborationService;
    private final PermissionService permissionService;
    private final SessionManager sessionManager;
    private final ObjectMapper objectMapper;

    private final Map<String, String> sessionDocumentMap = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String sessionId = session.getId();

        Map<String, String> queryParams = getQueryParams(session);
        String documentId = queryParams.get("documentId");
        String userId = queryParams.get("userId");
        String clientId = queryParams.get("clientId");

        if (documentId != null && userId != null && clientId != null) {
            // Kiểm tra quyền truy cập document
            if (!permissionService.canReadDocument(documentId, userId)) {
                session.close(CloseStatus.POLICY_VIOLATION);
                return;
            }

            sessionDocumentMap.put(sessionId, documentId);
            sessionManager.registerSession(userId, sessionId, session);
            sessionManager.associateUserWithDocument(userId, documentId);

            // Tạo/update session
            collaborationService.createOrUpdateSession(
                    documentId, userId, clientId, 0,
                    session.getHandshakeHeaders().getFirst("User-Agent"),
                    session.getRemoteAddress().getAddress().getHostAddress()
            );

            // Thông báo user joined
            broadcastUserJoined(documentId, userId, sessionId);

            log.info("WebSocket connection established for document: {}, user: {}, session: {}",
                    documentId, userId, sessionId);
        } else {
            session.close(CloseStatus.BAD_DATA);
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String sessionId = session.getId();
        String documentId = sessionDocumentMap.get(sessionId);
        String userId = sessionManager.getUserId(sessionId);

        if (documentId == null || userId == null) {
            session.close(CloseStatus.BAD_DATA);
            return;
        }

        try {
            CollaborationMessage collaborationMessage = objectMapper
                    .readValue(message.getPayload(), CollaborationMessage.class);

            // Cập nhật session activity
            collaborationService.createOrUpdateSession(
                    documentId, userId, collaborationMessage.getClientId(),
                    collaborationMessage.getCursorPosition(), "websocket", "websocket"
            );

            switch (collaborationMessage.getType()) {
                case "CHANGE":
                    handleDocumentChange(session, documentId, userId, collaborationMessage);
                    break;
                case "CURSOR_UPDATE":
                    handleCursorUpdate(session, documentId, userId, collaborationMessage);
                    break;
                case "SYNC_REQUEST":
                    handleSyncRequest(session, documentId, userId, collaborationMessage);
                    break;
                case "TYPING_START":
                case "TYPING_END":
                    handleTypingEvent(session, documentId, userId, collaborationMessage);
                    break;
                default:
                    log.warn("Unknown message type: {}", collaborationMessage.getType());
                    sendError(session, "Unknown message type: " + collaborationMessage.getType());
            }

        } catch (Exception e) {
            log.error("Error handling WebSocket message from user: {}, session: {}", userId, sessionId, e);
            sendError(session, "Error processing message: " + e.getMessage());
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String sessionId = session.getId();
        String documentId = sessionDocumentMap.get(sessionId);
        String userId = sessionManager.getUserId(sessionId);

        if (documentId != null && userId != null) {
            String clientId = getQueryParams(session).get("clientId");
            collaborationService.disconnectSession(documentId, userId, clientId);

            // Thông báo user left
            broadcastUserLeft(documentId, userId, sessionId);
        }

        sessionDocumentMap.remove(sessionId);
        sessionManager.unregisterSession(sessionId);

        log.info("WebSocket connection closed for session: {}, status: {}", sessionId, status);
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        log.error("WebSocket transport error for session: {}", session.getId(), exception);
    }

    private void handleDocumentChange(WebSocketSession session, String documentId,
                                      String userId, CollaborationMessage message) throws IOException {
        String clientId = message.getClientId();

        DocumentChange savedChange = collaborationService.processRealTimeChange(
                documentId, userId, clientId,
                message.getChanges(), message.getParentVersion()
        );

        // Broadcast change to other sessions in the same document
        broadcastToDocument(documentId, sessionId -> !sessionId.equals(session.getId()),
                new CollaborationMessage("CHANGE", savedChange));
    }

    private void handleCursorUpdate(WebSocketSession session, String documentId,
                                    String userId, CollaborationMessage message) throws IOException {
        // Broadcast cursor update to other sessions
        broadcastToDocument(documentId, sessionId -> !sessionId.equals(session.getId()),
                new CollaborationMessage("CURSOR_UPDATE", Map.of(
                        "userId", userId,
                        "cursorPosition", message.getCursorPosition(),
                        "clientId", message.getClientId()
                )));
    }

    private void handleSyncRequest(WebSocketSession session, String documentId,
                                   String userId, CollaborationMessage message) throws IOException {
        List<DocumentChange> changes = collaborationService.getChangesSinceVersion(
                documentId, message.getSinceVersion());

        CollaborationMessage response = new CollaborationMessage("SYNC_RESPONSE", changes);
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(response)));
    }

    private void handleTypingEvent(WebSocketSession session, String documentId,
                                   String userId, CollaborationMessage message) throws IOException {
        // Broadcast typing event to other sessions
        broadcastToDocument(documentId, sessionId -> !sessionId.equals(session.getId()),
                new CollaborationMessage(message.getType(), Map.of(
                        "userId", userId,
                        "userName", "User", // Would get from user service
                        "timestamp", System.currentTimeMillis()
                )));
    }

    private void broadcastUserJoined(String documentId, String userId, String excludedSessionId) {
        broadcastToDocument(documentId, sessionId -> !sessionId.equals(excludedSessionId),
                new CollaborationMessage("USER_JOINED", Map.of(
                        "userId", userId,
                        "userName", "User", // Would get from user service
                        "onlineCount", sessionManager.getOnlineUserCount(documentId),
                        "timestamp", System.currentTimeMillis()
                )));
    }

    private void broadcastUserLeft(String documentId, String userId, String excludedSessionId) {
        broadcastToDocument(documentId, sessionId -> !sessionId.equals(excludedSessionId),
                new CollaborationMessage("USER_LEFT", Map.of(
                        "userId", userId,
                        "onlineCount", sessionManager.getOnlineUserCount(documentId),
                        "timestamp", System.currentTimeMillis()
                )));
    }

    private void broadcastToDocument(String documentId, java.util.function.Predicate<String> sessionFilter,
                                     CollaborationMessage message) {
        try {
            String messageJson = objectMapper.writeValueAsString(message);

            Map<String, WebSocketSession> sessions = sessionManager.getSessionsByDocument(documentId);
            sessions.entrySet().stream()
                    .filter(entry -> sessionFilter.test(entry.getKey()))
                    .forEach(entry -> {
                        WebSocketSession targetSession = entry.getValue();
                        if (targetSession != null && targetSession.isOpen()) {
                            try {
                                targetSession.sendMessage(new TextMessage(messageJson));
                            } catch (IOException e) {
                                log.error("Error sending message to session: {}", entry.getKey(), e);
                            }
                        }
                    });
        } catch (IOException e) {
            log.error("Error broadcasting message", e);
        }
    }

    private void sendError(WebSocketSession session, String error) {
        try {
            CollaborationMessage errorMessage = new CollaborationMessage("ERROR", Map.of("message", error));
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(errorMessage)));
        } catch (IOException e) {
            log.error("Error sending error message", e);
        }
    }

    private Map<String, String> getQueryParams(WebSocketSession session) {
        String query = session.getUri().getQuery();
        if (query == null) {
            return Map.of();
        }

        return java.util.Arrays.stream(query.split("&"))
                .map(param -> param.split("="))
                .collect(java.util.stream.Collectors.toMap(
                        arr -> arr[0],
                        arr -> arr.length > 1 ? arr[1] : ""
                ));
    }
}