package com.example.collabservice.service;

import com.example.collabservice.model.Document;
import com.example.collabservice.model.DocumentChange;
import com.example.collabservice.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentService {
    private final DocumentRepository documentRepository;
    private final PermissionService permissionService;
    private final NotificationService notificationService;
    private final UserService userService;
  //  private  final AppcationEventPublisher eventPublisher;

    public Document createDocument(Document document, String creatorId) {
        // Kiểm tra quyền trong workspace
        if (!permissionService.canWriteInWorkspace(document.getWorkspaceId(), creatorId)) {
            throw new RuntimeException("No permission to create document in this workspace");
        }

        document.setCreatedBy(creatorId);
        document.setCreatedAt(LocalDateTime.now());
        document.setLastModifiedBy(creatorId);
        document.setLastModifiedAt(LocalDateTime.now());
        document.setVersion(1L);
        document.setArchived(false);

        return documentRepository.save(document);
    }

    public Optional<Document> getDocument(String documentId, String userId) {
        Optional<Document> documentOpt = documentRepository.findById(documentId);
        if (documentOpt.isPresent()) {
            Document document = documentOpt.get();
            // Kiểm tra quyền read
            if (permissionService.canReadDocument(documentId, userId)) {
                return documentOpt;
            }
        }
        return Optional.empty();
    }

    public List<Document> getDocumentsByWorkspace(String workspaceId, String userId) {
        if (!permissionService.canReadInWorkspace(workspaceId, userId)) {
            throw new RuntimeException("No permission to read documents in this workspace");
        }
        return documentRepository.findByWorkspaceIdAndIsArchivedFalse(workspaceId);
    }

    public List<Document> getDocumentsByTeamspace(String teamspaceId, String userId) {
        // Lấy document đầu tiên để lấy workspaceId
        Optional<Document> sampleDoc = documentRepository.findByTeamspaceId(teamspaceId).stream().findFirst();
        if (sampleDoc.isPresent() && permissionService.canReadInWorkspace(sampleDoc.get().getWorkspaceId(), userId)) {
            return documentRepository.findByWorkspaceIdAndTeamspaceId(sampleDoc.get().getWorkspaceId(), teamspaceId);
        }
        throw new RuntimeException("No permission to read documents in this teamspace");
    }

    public Document updateDocumentContent(String documentId, Object newContent, String modifierId) {
        Optional<Document> documentOpt = documentRepository.findById(documentId);
        if (documentOpt.isPresent()) {
            Document document = documentOpt.get();

            // Kiểm tra quyền write
            if (!permissionService.canWriteDocument(documentId, modifierId)) {
                throw new RuntimeException("No permission to update this document");
            }

            document.setContent(newContent);
            document.setLastModifiedBy(modifierId);
            document.setLastModifiedAt(LocalDateTime.now());
            document.setVersion(document.getVersion() + 1);

            Document updatedDocument = documentRepository.save(document);

            // Gửi thông báo cho các thành viên có quyền xem document
            try {
                Document document = documentOpt.get();
                String modifierName = userService.getUser(modifierId).map(com.example.collabservice.model.User::getName).orElse("Someone");

                // Lấy danh sách user cần thông báo (trừ người sửa)
                List<String> usersToNotify = permissionService.getUsersWithDocumentAccess(documentId);
                usersToNotify.remove(modifierId);

                for (String userId : usersToNotify) {
                    notificationService.notifyDocumentChange(
                            userId, documentId, document.getTitle(), modifierName, "updated"
                    );
                }
            } catch (Exception e) {
                log.warn("Failed to send document change notifications: {}", e.getMessage());
            }

            return updatedDocument;
        }
        throw new RuntimeException("Document not found");
    }

    public boolean archiveDocument(String documentId, String userId) {
        Optional<Document> documentOpt = documentRepository.findById(documentId);
        if (documentOpt.isPresent()) {
            Document document = documentOpt.get();

            // Kiểm tra quyền delete
            if (!permissionService.canDeleteDocument(documentId, userId)) {
                throw new RuntimeException("No permission to archive this document");
            }

            document.setArchived(true);
            document.setArchivedAt(LocalDateTime.now());
            documentRepository.save(document);
            return true;
        }
        return false;
    }

    public DocumentChange saveDocumentChange(String documentId, String userId,
                                             List<DocumentChange.Change> changes,
                                             String clientId, Long parentVersion) {

        // Kiểm tra quyền write
        if (!permissionService.canWriteDocument(documentId, userId)) {
            throw new RuntimeException("No write permission for document");
        }

        // Lấy version hiện tại
        Optional<DocumentChange> lastChangeOpt = documentRepository
                .findLatestChangeByDocumentId(documentId);
        Long currentVersion = lastChangeOpt.map(DocumentChange::getVersion).orElse(0L);

        // Tạo change mới
        DocumentChange documentChange = new DocumentChange();
        documentChange.setDocumentId(documentId);
        documentChange.setUserId(userId);
        documentChange.setVersion(currentVersion + 1);
        documentChange.setChanges(changes);
        documentChange.setTimestamp(LocalDateTime.now());
        documentChange.setClientId(clientId);
        documentChange.setParentVersion(parentVersion);
        documentChange.setOperationId(UUID.randomUUID().toString());
        documentChange.setSyncType("remote");

        DocumentChange savedChange = documentRepository.save(documentChange);

        // Cập nhật document version và last modified
        documentRepository.updateDocumentContentAndVersion(
                documentId,
                null, // Không thay đổi content ở đây
                userId,
                LocalDateTime.now(),
                savedChange.getVersion()
        );

        return savedChange;
    }

    public List<DocumentChange> getChangesSinceVersion(String documentId, Long sinceVersion) {
        return documentRepository.findChangesByDocumentIdAndVersionGreaterThan(documentId, sinceVersion);
    }
}