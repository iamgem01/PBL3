package com.example.collabservice.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    @Field("user_id")
    private String userId; // Người nhận thông báo

    private String type; // 'invitation', 'document_change', 'member_joined', 'mention', 'comment'

    private String title;
    private String message;

    private Map<String, Object> data; // Dữ liệu bổ sung

    @Field("is_read")
    private boolean isRead = false;

    @Field("created_at")
    private LocalDateTime createdAt;

    @Field("related_entities")
    private RelatedEntities relatedEntities;

    @Field("action_url")
    private String actionUrl; // URL để điều hướng khi click

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RelatedEntities {
        @Field("workspace_id")
        private String workspaceId;

        @Field("teamspace_id")
        private String teamspaceId;

        @Field("document_id")
        private String documentId;

        @Field("invitation_id")
        private String invitationId;

        @Field("triggered_by")
        private String triggeredBy; // UserId người tạo thông báo
    }
}