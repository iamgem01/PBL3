package com.java.smartnote.collabservice.websocket;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.BinaryWebSocketHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class YjsWebSocketHandler extends BinaryWebSocketHandler {

    private static final Logger log = LoggerFactory.getLogger(YjsWebSocketHandler.class);

    // Lưu trữ các session theo room (documentId)
    private final Map<String, Map<String, WebSocketSession>> rooms = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String documentId = extractDocumentId(session);
        
        if (documentId != null) {
            rooms.computeIfAbsent(documentId, k -> new ConcurrentHashMap<>())
                 .put(session.getId(), session);
            
            log.info("🔗 Yjs WebSocket connected - Document: {}, Session: {}, Total sessions: {}", 
                    documentId, session.getId(), rooms.get(documentId).size());
        } else {
            log.warn("⚠️ Yjs WebSocket connected without document ID - Session: {}", session.getId());
            session.close(CloseStatus.BAD_DATA.withReason("Missing documentId parameter"));
        }
    }

    @Override
    protected void handleBinaryMessage(WebSocketSession session, BinaryMessage message) throws Exception {
        String documentId = extractDocumentId(session);
        
        if (documentId != null && rooms.containsKey(documentId)) {
            // Broadcast binary message to all other sessions in the same room
            broadcastToRoom(documentId, message, session.getId());
            log.debug("📤 Yjs binary message broadcast - Document: {}, From: {}, Payload size: {}", 
                     documentId, session.getId(), message.getPayload().remaining());
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        // Yjs chủ yếu dùng binary messages, nhưng vẫn hỗ trợ text nếu cần
        String documentId = extractDocumentId(session);
        
        if (documentId != null && rooms.containsKey(documentId)) {
            try {
                broadcastTextToRoom(documentId, message, session.getId());
                log.debug("📤 Yjs text message broadcast - Document: {}, From: {}, Payload: {}", 
                         documentId, session.getId(), message.getPayload());
            } catch (IOException e) {
                log.error("❌ Failed to broadcast text message for document: {}", documentId, e);
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String documentId = extractDocumentId(session);
        
        if (documentId != null && rooms.containsKey(documentId)) {
            rooms.get(documentId).remove(session.getId());
            
            // Remove empty rooms
            if (rooms.get(documentId).isEmpty()) {
                rooms.remove(documentId);
            }
            
            log.info("🔌 Yjs WebSocket disconnected - Document: {}, Session: {}, Reason: {}, Remaining sessions: {}", 
                    documentId, session.getId(), status.getReason(), 
                    rooms.getOrDefault(documentId, Map.of()).size());
        }
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        log.error("❌ Yjs WebSocket transport error - Session: {}, Error: {}", 
                 session.getId(), exception.getMessage(), exception);
    }

    /**
     * Broadcast binary message to all sessions in a room except the sender
     */
    private void broadcastToRoom(String documentId, BinaryMessage message, String excludeSessionId) {
        Map<String, WebSocketSession> roomSessions = rooms.get(documentId);
        if (roomSessions != null) {
            roomSessions.entrySet().stream()
                .filter(entry -> !entry.getKey().equals(excludeSessionId))
                .forEach(entry -> {
                    try {
                        WebSocketSession targetSession = entry.getValue();
                        if (targetSession.isOpen()) {
                            // Create a new BinaryMessage với cùng payload
                            ByteBuffer payload = message.getPayload();
                            ByteBuffer copy = ByteBuffer.allocate(payload.remaining());
                            copy.put(payload);
                            copy.flip();
                            targetSession.sendMessage(new BinaryMessage(copy));
                        }
                    } catch (IOException e) {
                        log.error("❌ Failed to send Yjs binary message to session: {}", entry.getKey(), e);
                    }
                });
        }
    }

    /**
     * Broadcast text message to all sessions in a room except the sender
     */
    private void broadcastTextToRoom(String documentId, TextMessage message, String excludeSessionId) throws IOException {
        Map<String, WebSocketSession> roomSessions = rooms.get(documentId);
        if (roomSessions != null) {
            for (Map.Entry<String, WebSocketSession> entry : roomSessions.entrySet()) {
                if (!entry.getKey().equals(excludeSessionId)) {
                    WebSocketSession targetSession = entry.getValue();
                    if (targetSession.isOpen()) {
                        try {
                            targetSession.sendMessage(message);
                        } catch (IOException e) {
                            log.error("❌ Failed to send Yjs text message to session: {}", entry.getKey(), e);
                            throw e;
                        }
                    }
                }
            }
        }
    }

    /**
     * Extract document ID from WebSocket session URI
     * Expected URI format: /yjs-ws?documentId=xxx
     */
    private String extractDocumentId(WebSocketSession session) {
        if (session.getUri() == null) return null;
        
        String query = session.getUri().getQuery();
        if (query != null && query.contains("documentId=")) {
            String[] params = query.split("&");
            for (String param : params) {
                if (param.startsWith("documentId=")) {
                    return param.substring("documentId=".length());
                }
            }
        }
        return null;
    }

    /**
     * Get active session count for a document
     */
    public int getActiveSessionCount(String documentId) {
        return rooms.getOrDefault(documentId, Map.of()).size();
    }

    /**
     * Get all active document rooms
     */
    public Map<String, Integer> getActiveRooms() {
        Map<String, Integer> activeRooms = new ConcurrentHashMap<>();
        rooms.forEach((docId, sessions) -> activeRooms.put(docId, sessions.size()));
        return activeRooms;
    }
}