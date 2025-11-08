package com.example.collabservice.repository;

import com.example.collabservice.model.Session;
import com.example.collabservice.model.Invitation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface CollaborationRepository extends MongoRepository<Session, String> {

    // Session queries
    List<Session> findByDocumentId(String documentId);
    Optional<Session> findByDocumentIdAndUserIdAndClientId(String documentId, String userId, String clientId);
    List<Session> findByUserId(String userId);

    @Query("{ 'last_activity': { $lt: ?0 } }")
    List<Session> findInactiveSessions(LocalDateTime threshold);

    @Query("{ 'document_id': ?0, 'status': 'active' }")
    List<Session> findActiveSessionsByDocumentId(String documentId);

    void deleteByDocumentIdAndUserIdAndClientId(String documentId, String userId, String clientId);
    void deleteByLastActivityBefore(LocalDateTime threshold);

    @Query(value = "{ 'document_id': ?0, 'status': 'active' }", count = true)
    long countActiveSessionsByDocumentId(String documentId);

    // Invitation queries (using different collection)
    @Query(value = "{ 'token': ?0 }", collection = "invitations")
    Optional<Invitation> findInvitationByToken(String token);

    @Query(value = "{ 'email': ?0, 'status': ?1 }", collection = "invitations")
    List<Invitation> findInvitationsByEmailAndStatus(String email, String status);

    @Query(value = "{ 'target_id': ?0, 'type': ?1 }", collection = "invitations")
    List<Invitation> findInvitationsByTargetIdAndType(String targetId, String type);

    @Query(value = "{ 'invited_by': ?0 }", collection = "invitations")
    List<Invitation> findInvitationsByInvitedBy(String invitedBy);

    @Query(value = "{ 'expires_at': { $lt: ?0 }, 'status': 'pending' }", collection = "invitations")
    List<Invitation> findExpiredInvitations(LocalDateTime now);

    @Query(value = "{ 'target_id': ?0, 'type': ?1, 'email': ?2, 'status': 'pending' }", collection = "invitations")
    Optional<Invitation> findPendingInvitation(String targetId, String type, String email);

    @Query(value = "{ 'status': 'pending', 'invited_at': { $lt: ?0 } }", collection = "invitations")
    List<Invitation> findOldPendingInvitations(LocalDateTime threshold);

    // Custom update for invitations
    @Query(value = "{ '_id': ?0 }", collection = "invitations")
    @org.springframework.data.mongodb.repository.Update("{ '$set': { 'status': ?1, 'response_at': ?2 } }")
    void updateInvitationStatus(String invitationId, String status, LocalDateTime responseAt);
}