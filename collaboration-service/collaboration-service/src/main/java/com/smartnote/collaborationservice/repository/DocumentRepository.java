package com.example.collabservice.repository;

import com.example.collabservice.model.Document;
import com.example.collabservice.model.DocumentChange;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.Update;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface DocumentRepository extends MongoRepository<Document, String> {

    // Document queries
    List<Document> findByWorkspaceId(String workspaceId);
    List<Document> findByWorkspaceIdAndTeamspaceId(String workspaceId, String teamspaceId);
    List<Document> findByWorkspaceIdAndIsArchivedFalse(String workspaceId);
    List<Document> findByParentId(String parentId);
    Optional<Document> findByIdAndIsArchivedFalse(String id);

    @Query("{ 'workspace_id': ?0, 'tags': ?1, 'is_archived': false }")
    List<Document> findByWorkspaceIdAndTag(String workspaceId, String tag);

    @Query("{ 'workspace_id': ?0, 'last_modified_at': { $gte: ?1 } }")
    List<Document> findRecentDocuments(String workspaceId, LocalDateTime since);

    @Query("{ 'workspace_id': ?0, 'created_by': ?1 }")
    List<Document> findByWorkspaceIdAndCreatedBy(String workspaceId, String userId);

    long countByWorkspaceId(String workspaceId);
    long countByWorkspaceIdAndTeamspaceId(String workspaceId, String teamspaceId);

    @Query(value = "{ 'workspace_id': ?0, 'is_archived': false }", count = true)
    long countActiveDocumentsByWorkspace(String workspaceId);

    // DocumentChange queries
    @Query("{ 'document_id': ?0, 'version': { $gt: ?1 } }")
    List<DocumentChange> findChangesByDocumentIdAndVersionGreaterThan(String documentId, Long version);

    @Query(value = "{ 'document_id': ?0 }", sort = "{ 'version': -1 }")
    Optional<DocumentChange> findLatestChangeByDocumentId(String documentId);

    @Query("{ 'document_id': ?0, 'version': { $gte: ?1, $lte: ?2 } }")
    List<DocumentChange> findChangesByDocumentIdAndVersionBetween(String documentId, Long startVersion, Long endVersion);

    @Query("{ 'operation_id': ?0 }")
    Optional<DocumentChange> findChangeByOperationId(String operationId);

    @Query("{ 'document_id': ?0, 'user_id': ?1 }")
    List<DocumentChange> findChangesByDocumentIdAndUserId(String documentId, String userId);

    @Query(value = "{ 'timestamp': { $lt: ?0 } }", delete = true)
    void deleteOldChanges(LocalDateTime cutoffDate);

    // Complex operations
    @Query("{ '_id': ?0 }")
    @Update("{ '$set': { 'content': ?1, 'last_modified_by': ?2, 'last_modified_at': ?3, 'version': ?4 } }")
    void updateDocumentContentAndVersion(String documentId, Object content, String modifiedBy,
                                         LocalDateTime modifiedAt, Long version);

    @Query("{ '_id': ?0 }")
    @Update("{ '$set': { 'is_archived': ?1, 'archived_at': ?2 } }")
    void updateDocumentArchiveStatus(String documentId, boolean isArchived, LocalDateTime archivedAt);
}