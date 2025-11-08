package com.example.collabservice.service;

import com.example.collabservice.model.Notification;
import com.example.collabservice.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserService userService;

    public Notification createNotification(String userId, String type, String title,
                                           String message, Map<String, Object> data,
                                           Notification.RelatedEntities relatedEntities,
                                           String actionUrl) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setData(data);
        notification.setRelatedEntities(relatedEntities);
        notification.setActionUrl(actionUrl);
        notification.setCreatedAt(LocalDateTime.now());

        return notificationRepository.save(notification);
    }

    // Tạo thông báo khi có lời mời vào workspace
    public void notifyWorkspaceInvitation(String userId, String workspaceId,
                                          String workspaceName, String inviterName,
                                          String invitationId) {
        String title = "Lời mời tham gia workspace";
        String message = String.format("Bạn được %s mời tham gia workspace %s", inviterName, workspaceName);

        Map<String, Object> data = Map.of(
                "workspace_name", workspaceName,
                "inviter_name", inviterName
        );

        Notification.RelatedEntities relatedEntities = new Notification.RelatedEntities();
        relatedEntities.setWorkspaceId(workspaceId);
        relatedEntities.setInvitationId(invitationId);
        relatedEntities.setTriggeredBy(inviterName);

        String actionUrl = String.format("/workspaces/%s/invitations/%s", workspaceId, invitationId);

        createNotification(userId, "workspace_invitation", title, message, data, relatedEntities, actionUrl);

        log.info("Created workspace invitation notification for user: {}", userId);
    }

    // Tạo thông báo khi có thay đổi trong document
    public void notifyDocumentChange(String userId, String documentId, String documentTitle,
                                     String modifierName, String changeType) {
        String title = "Tài liệu đã được cập nhật";
        String message = String.format("Tài liệu %s đã được %s %s", documentTitle, modifierName, changeType);

        Map<String, Object> data = Map.of(
                "document_title", documentTitle,
                "modifier_name", modifierName,
                "change_type", changeType
        );

        Notification.RelatedEntities relatedEntities = new Notification.RelatedEntities();
        relatedEntities.setDocumentId(documentId);
        relatedEntities.setTriggeredBy(modifierName);

        String actionUrl = String.format("/documents/%s", documentId);

        createNotification(userId, "document_change", title, message, data, relatedEntities, actionUrl);
    }

    // Tạo thông báo khi có thành viên mới tham gia workspace
    public void notifyNewMember(String userId, String workspaceId, String workspaceName,
                                String newMemberName) {
        String title = "Thành viên mới";
        String message = String.format("%s đã tham gia workspace %s", newMemberName, workspaceName);

        Map<String, Object> data = Map.of(
                "workspace_name", workspaceName,
                "new_member_name", newMemberName
        );

        Notification.RelatedEntities relatedEntities = new Notification.RelatedEntities();
        relatedEntities.setWorkspaceId(workspaceId);
        relatedEntities.setTriggeredBy(newMemberName);

        String actionUrl = String.format("/workspaces/%s/members", workspaceId);

        createNotification(userId, "new_member", title, message, data, relatedEntities, actionUrl);
    }

    // Tạo thông báo khi bị xóa khỏi workspace
    public void notifyRemovedFromWorkspace(String userId, String workspaceId,
                                           String workspaceName, String removerName) {
        String title = "Đã bị xóa khỏi workspace";
        String message = String.format("Bạn đã bị %s xóa khỏi workspace %s", removerName, workspaceName);

        Map<String, Object> data = Map.of(
                "workspace_name", workspaceName,
                "remover_name", removerName
        );

        Notification.RelatedEntities relatedEntities = new Notification.RelatedEntities();
        relatedEntities.setWorkspaceId(workspaceId);
        relatedEntities.setTriggeredBy(removerName);

        createNotification(userId, "removed_from_workspace", title, message, data, relatedEntities, null);
    }

    // Tạo thông báo khi được mention trong document
    public void notifyMention(String userId, String documentId, String documentTitle,
                              String mentionerName, String context) {
        String title = "Bạn được nhắc đến";
        String message = String.format("%s đã nhắc đến bạn trong tài liệu %s: %s",
                mentionerName, documentTitle, context);

        Map<String, Object> data = Map.of(
                "document_title", documentTitle,
                "mentioner_name", mentionerName,
                "context", context
        );

        Notification.RelatedEntities relatedEntities = new Notification.RelatedEntities();
        relatedEntities.setDocumentId(documentId);
        relatedEntities.setTriggeredBy(mentionerName);

        String actionUrl = String.format("/documents/%s", documentId);

        createNotification(userId, "mention", title, message, data, relatedEntities, actionUrl);
    }

    // Lấy thông báo của user
    public List<Notification> getUserNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getUnreadNotifications(String userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(String userId) {
        return notificationRepository.countUnreadByUserId(userId);
    }

    // Đánh dấu đã đọc
    public void markAsRead(String notificationId, String userId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            if (notification.getUserId().equals(userId)) {
                notification.setRead(true);
                notificationRepository.save(notification);
            }
        });
    }

    public void markMultipleAsRead(List<String> notificationIds, String userId) {
        notificationRepository.markNotificationsAsRead(userId, notificationIds);
    }

    public void markAllAsRead(String userId) {
        notificationRepository.markAllAsReadByUserId(userId);
    }

    // Xóa thông báo
    public void deleteNotification(String notificationId, String userId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            if (notification.getUserId().equals(userId)) {
                notificationRepository.delete(notification);
            }
        });
    }

    // Dọn dẹp thông báo cũ
    public void cleanupOldNotifications() {
        LocalDateTime cutoffDate = LocalDateTime.now().minusMonths(3); // Giữ thông báo 3 tháng
        List<Notification> oldNotifications = notificationRepository.findOldNotifications(cutoffDate);
        notificationRepository.deleteAll(oldNotifications);
        log.info("Cleaned up {} old notifications", oldNotifications.size());
    }
}