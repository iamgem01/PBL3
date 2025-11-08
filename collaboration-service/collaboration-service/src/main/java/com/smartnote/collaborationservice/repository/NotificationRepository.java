package com.example.collabservice.repository;

import com.example.collabservice.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.Update;

import java.time.LocalDateTime;
import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification, String> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);

    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(String userId);

    @Query("{ 'user_id': ?0, 'type': ?1 }")
    List<Notification> findByUserIdAndType(String userId, String type);

    @Query("{ 'created_at': { $lt: ?0 } }")
    List<Notification> findOldNotifications(LocalDateTime cutoffDate);

    @Query(value = "{ 'user_id': ?0, 'is_read': false }", count = true)
    long countUnreadByUserId(String userId);

    @Query("{ 'user_id': ?0, 'id': { $in: ?1 } }")
    List<Notification> findByUserIdAndIdIn(String userId, List<String> notificationIds);

    @Query("{ 'related_entities.workspace_id': ?0 }")
    List<Notification> findByWorkspaceId(String workspaceId);

    @Query("{ 'related_entities.document_id': ?0 }")
    List<Notification> findByDocumentId(String documentId);

    // Custom update operations
    @Query("{ 'user_id': ?0, 'id': { $in: ?1 } }")
    @Update("{ '$set': { 'is_read': true } }")
    void markNotificationsAsRead(String userId, List<String> notificationIds);

    @Query("{ 'user_id': ?0 }")
    @Update("{ '$set': { 'is_read': true } }")
    void markAllAsReadByUserId(String userId);

    @Query(value = "{ 'created_at': { $lt: ?0 } }", delete = true)
    void deleteOldNotifications(LocalDateTime cutoffDate);
}