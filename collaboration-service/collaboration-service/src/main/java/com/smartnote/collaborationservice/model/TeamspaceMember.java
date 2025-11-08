package com.example.collabservice.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamspaceMember {
    @Field("user_id")
    private String userId;
    private String role; // "owner", "member"

    @Field("permission_level")
    private String permissionLevel; // "full_access", "edit_only", "view_only"

    @Field("custom_permissions")
    private CustomPermissions customPermissions;

    @Field("joined_at")
    private LocalDateTime joinedAt;

    @Field("invited_by")
    private String invitedBy;
    private String status = "active";

    @Field("inherited_from_workspace")
    private boolean inheritedFromWorkspace = false;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomPermissions {
        @Field("can_edit")
        private boolean canEdit = true;
        @Field("can_delete")
        private boolean canDelete = false;
        @Field("can_invite")
        private boolean canInvite = false;
        @Field("can_manage_settings")
        private boolean canManageSettings = false;
    }

    public static CustomPermissions getPermissionsForLevel(String level) {
        CustomPermissions permissions = new CustomPermissions();
        switch (level) {
            case "full_access":
                permissions.setCanEdit(true);
                permissions.setCanDelete(true);
                permissions.setCanInvite(true);
                permissions.setCanManageSettings(true);
                break;
            case "edit_only":
                permissions.setCanEdit(true);
                permissions.setCanDelete(false);
                permissions.setCanInvite(false);
                permissions.setCanManageSettings(false);
                break;
            case "view_only":
                permissions.setCanEdit(false);
                permissions.setCanDelete(false);
                permissions.setCanInvite(false);
                permissions.setCanManageSettings(false);
                break;
        }
        return permissions;
    }
}