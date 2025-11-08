package com.example.collabservice.websocket;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketSession;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
public class SessionManager {

    private final Map<String, WebSocketSession> userSessions = new ConcurrentHashMap<>();
    private final Map<String, String> sessionUserMap = new ConcurrentHashMap<>();
    private final Map<String, String> userDocumentMap = new ConcurrentHashMap<>();

    public void registerSession(String userId, String sessionId, WebSocketSession session) {
        userSessions.put(sessionId, session);
        sessionUserMap.put(sessionId, userId);
        log.info("Session registered for user: {}, sessionId: {}", userId, sessionId);
    }

    public void unregisterSession(String sessionId) {
        String userId = sessionUserMap.remove(sessionId);
        userSessions.remove(sessionId);
        userDocumentMap.remove(userId);

        if (userId != null) {
            log.info("Session unregistered for user: {}, sessionId: {}", userId, sessionId);
        }
    }

    public void associateUserWithDocument(String userId, String documentId) {
        userDocumentMap.put(userId, documentId);
        log.debug("User {} associated with document {}", userId, documentId);
    }

    public WebSocketSession getSession(String sessionId) {
        return userSessions.get(sessionId);
    }

    public String getUserId(String sessionId) {
        return sessionUserMap.get(sessionId);
    }

    public String getDocumentId(String userId) {
        return userDocumentMap.get(userId);
    }

    public Map<String, WebSocketSession> getSessionsByDocument(String documentId) {
        Map<String, WebSocketSession> result = new ConcurrentHashMap<>();

        userDocumentMap.entrySet().stream()
                .filter(entry -> documentId.equals(entry.getValue()))
                .forEach(entry -> {
                    String userId = entry.getKey();
                    sessionUserMap.entrySet().stream()
                            .filter(sessionEntry -> userId.equals(sessionEntry.getValue()))
                            .forEach(sessionEntry -> {
                                WebSocketSession session = userSessions.get(sessionEntry.getKey());
                                if (session != null && session.isOpen()) {
                                    result.put(sessionEntry.getKey(), session);
                                }
                            });
                });

        return result;
    }

    public boolean isUserOnline(String userId) {
        return sessionUserMap.containsValue(userId) &&
                userSessions.values().stream()
                        .anyMatch(session -> userId.equals(sessionUserMap.get(session.getId())) &&
                                session.isOpen());
    }

    public int getOnlineUserCount(String documentId) {
        return (int) userDocumentMap.entrySet().stream()
                .filter(entry -> documentId.equals(entry.getValue()))
                .filter(entry -> isUserOnline(entry.getKey()))
                .count();
    }

    public void cleanupInactiveSessions() {
        userSessions.entrySet().removeIf(entry -> {
            if (!entry.getValue().isOpen()) {
                String sessionId = entry.getKey();
                String userId = sessionUserMap.get(sessionId);
                sessionUserMap.remove(sessionId);
                userDocumentMap.remove(userId);
                log.debug("Cleaned up inactive session: {}", sessionId);
                return true;
            }
            return false;
        });
    }
}