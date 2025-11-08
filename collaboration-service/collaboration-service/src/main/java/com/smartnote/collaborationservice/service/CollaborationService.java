package com.example.collabservice.service;

import com.example.collabservice.model.Session;
import com.example.collabservice.model.DocumentChange;
import com.example.collabservice.repository.CollaborationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CollaborationService {
    private final CollaborationRepository collaborationRepository;
    private final DocumentService documentService;
    private final PermissionService permissionService;

    public Session createOrUpdateSession(String documentId, String userId, String clientId,
                                         Integer cursorPosition, String userAgent, String ipAddress) {

        // Kiểm tra quyền read document
        if (!permissionService.canReadDocument(documentId, userId)) {
            throw new RuntimeException("No permission to access this document");
        }

        Optional<Session> existingSession = collaborationRepository
                .findByDocumentIdAndUserIdAndClientId(documentId, userId, clientId);

        Session session;
        if (existingSession.isPresent()) {
            session = existingSession.get();
            session.setLastActivity(LocalDateTime.now());
            session.setCursorPosition(cursorPosition);
        } else {
            session = new Session();
            session.setDocumentId(documentId);
            session.setUserId(userId);
            session.setClientId(clientId);
            session.setCursorPosition(cursorPosition);
            session.setLastActivity(LocalDateTime.now());
            session.setStatus("active");
            session.setConnectedAt(LocalDateTime.now());
            session.setUserAgent(userAgent);
            session.setIpAddress(ipAddress);
        }

        return collaborationRepository.save(session);
    }

    public void disconnectSession(String documentId, String userId, String clientId) {
        Optional<Session> sessionOpt = collaborationRepository
                .findByDocumentIdAndUserIdAndClientId(documentId, userId, clientId);

        if (sessionOpt.isPresent()) {
            Session session = sessionOpt.get();
            session.setStatus("disconnected");
            session.setDisconnectedAt(LocalDateTime.now());
            collaborationRepository.save(session);
        }
    }

    public List<Session> getActiveSessions(String documentId) {
        return collaborationRepository.findActiveSessionsByDocumentId(documentId);
    }

    public void cleanupInactiveSessions() {
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(30);
        List<Session> inactiveSessions = collaborationRepository.findInactiveSessions(threshold);

        for (Session session : inactiveSessions) {
            session.setStatus("inactive");
            session.setDisconnectedAt(LocalDateTime.now());
            collaborationRepository.save(session);
        }

        log.info("Cleaned up {} inactive sessions", inactiveSessions.size());
    }

    public DocumentChange processRealTimeChange(String documentId, String userId, String clientId,
                                                List<DocumentChange.Change> changes, Long parentVersion) {

        // Lưu changes
        DocumentChange savedChange = documentService.saveDocumentChange(
                documentId, userId, changes, clientId, parentVersion);

        // Cập nhật session activity
        createOrUpdateSession(documentId, userId, clientId, null, "websocket", "websocket");

        return savedChange;
    }
}