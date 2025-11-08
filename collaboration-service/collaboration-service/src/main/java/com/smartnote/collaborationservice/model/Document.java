package com.example.collabservice.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "documents")
public class Document {
    @Id
    private String id;

    @Field("workspace_id")
    private String workspaceId;

    @Field("teamspace_id")
    private String teamspaceId;

    private String title;
    private Object content;

    @Field("content_type")
    private String contentType;

    @Field("created_by")
    private String createdBy;

    @Field("created_at")
    private LocalDateTime createdAt;

    @Field("last_modified_by")
    private String lastModifiedBy;

    @Field("last_modified_at")
    private LocalDateTime lastModifiedAt;

    @Version
    private Long version;

    private DocumentPermissions permissions;
    private List<String> tags;

    @Field("is_archived")
    private boolean isArchived = false;

    @Field("archived_at")
    private LocalDateTime archivedAt;

    @Field("parent_id")
    private String parentId;

    @Field("template_id")
    private String templateId;

    private Map<String, Object> metadata;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DocumentPermissions {
        private boolean inheritance = true;
        private List<SpecificPermission> specific;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SpecificPermission {
        @Field("user_id")
        private String userId;
        private String permission;
    }
}