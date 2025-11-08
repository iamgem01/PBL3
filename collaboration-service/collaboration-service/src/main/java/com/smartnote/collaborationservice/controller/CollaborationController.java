package com.example.collabservice.controller;

import com.example.collabservice.model.DocumentChange;
import com.example.collabservice.service.CollaborationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/collaboration")
@RequiredArgsConstructor
public class CollaborationController {

    private final CollaborationService collaborationService;

    @GetMapping("/{documentId}/changes")
    public ResponseEntity<List<DocumentChange>> getChangesSinceVersion(
            @PathVariable String documentId,
            @RequestParam Long sinceVersion) {
        List<DocumentChange> changes = collaborationService.getChangesSinceVersion(documentId, sinceVersion);
        return ResponseEntity.ok(changes);
    }

    @GetMapping("/{documentId}/sessions")
    public ResponseEntity<List<Object>> getActiveSessions(
            @PathVariable String documentId) {
        List<Object> sessions = collaborationService.getActiveSessions(documentId)
                .stream()
                .map(session -> {
                    // Return simplified session info for security
                    return new Object() {
                        public String userId = session.getUserId();
                        public Integer cursorPosition = session.getCursorPosition();
                        public String lastActivity = session.getLastActivity().toString();
                    };
                })
                .toList();
        return ResponseEntity.ok(sessions);
    }
}