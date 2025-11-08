package com.example.collabservice.controller;

import com.example.collabservice.model.Document;
import com.example.collabservice.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping
    public ResponseEntity<Document> createDocument(
            @RequestBody Document document,
            @RequestHeader("X-User-Id") String userId) {
        Document created = documentService.createDocument(document, userId);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/{documentId}")
    public ResponseEntity<Document> getDocument(
            @PathVariable String documentId,
            @RequestHeader("X-User-Id") String userId) {
        return documentService.getDocument(documentId, userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/workspace/{workspaceId}")
    public ResponseEntity<List<Document>> getWorkspaceDocuments(
            @PathVariable String workspaceId,
            @RequestHeader("X-User-Id") String userId) {
        List<Document> documents = documentService.getDocumentsByWorkspace(workspaceId, userId);
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/teamspace/{teamspaceId}")
    public ResponseEntity<List<Document>> getTeamspaceDocuments(
            @PathVariable String teamspaceId,
            @RequestHeader("X-User-Id") String userId) {
        List<Document> documents = documentService.getDocumentsByTeamspace(teamspaceId, userId);
        return ResponseEntity.ok(documents);
    }

    @PutMapping("/{documentId}/content")
    public ResponseEntity<Document> updateDocumentContent(
            @PathVariable String documentId,
            @RequestBody Object content,
            @RequestHeader("X-User-Id") String userId) {
        Document updated = documentService.updateDocumentContent(documentId, content, userId);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{documentId}/archive")
    public ResponseEntity<Void> archiveDocument(
            @PathVariable String documentId,
            @RequestHeader("X-User-Id") String userId) {
        boolean success = documentService.archiveDocument(documentId, userId);
        return success ? ResponseEntity.ok().build() : ResponseEntity.badRequest().build();
    }
}