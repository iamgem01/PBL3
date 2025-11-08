package com.example.collabservice.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "workspaces")
public class Workspace {
    @Id
    private String id;
    private String name;
    private String description;

    @Field("owner_id")
    private String ownerId;

    @Field("created_at")
    private LocalDateTime createdAt;

    @Field("updated_at")
    private LocalDateTime updatedAt;

    private String scope; // "default", "private"
    private WorkspaceSettings settings;
    private WorkspaceStatistics statistics;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WorkspaceSettings {
        @Field("allow_invites")
        private boolean allowInvites = true;
        @Field("default_permission")
        private String defaultPermission = "view_only";
        private String visibility = "visible";
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WorkspaceStatistics {
        @Field("total_members")
        private int totalMembers = 1;
        @Field("total_documents")
        private int totalDocuments = 0;
        @Field("storage_used")
        private long storageUsed = 0;
    }
}