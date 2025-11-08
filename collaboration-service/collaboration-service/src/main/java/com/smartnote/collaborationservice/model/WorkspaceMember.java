package com.example.collabservice.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkspaceMember {
    @Field("user_id")
    private String userId;
    private String role; // "owner", "member"
    private List<String> permissions;

    @Field("joined_at")
    private LocalDateTime joinedAt;

    @Field("invited_by")
    private String invitedBy;


    @Field("last_accessed")
    private LocalDateTime lastAccessed;

    public static class PermissionSets {
        public static final List<String> OWNER_PERMISSIONS = List.of(
                "read", "write", "delete", "invite", "manage_settings", "remove_members"
        );
        public static final List<String> MEMBER_FULL_ACCESS = List.of("read", "write", "delete");
        public static final List<String> MEMBER_EDIT_ONLY = List.of("read", "write");
        public static final List<String> MEMBER_VIEW_ONLY = List.of("read");
    }
}