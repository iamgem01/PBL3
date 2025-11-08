package com.example.collabservice.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "teamspaces")
public class Teamspace {
    @Id
    private String id;

    @Field("workspace_id")
    private String workspaceId;

    private String name;
    private String description;

    @Field("owner_id")
    private String ownerId;

    @Field("created_at")
    private LocalDateTime createdAt;

    @Field("updated_at")
    private LocalDateTime updatedAt;

    private String scope; // "default", "private"
    private String color;
    private String icon;
    private TeamspaceSettings settings;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeamspaceSettings {
        @Field("allow_auto_join")
        private boolean allowAutoJoin = true;
        @Field("default_member_permission")
        private String defaultMemberPermission = "view_only";
    }
}