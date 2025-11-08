package com.example.collabservice.service;

import com.example.collabservice.model.Workspace;
import com.example.collabservice.model.WorkspaceMember;
import com.example.collabservice.repository.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class WorkspaceService {
    private final WorkspaceRepository workspaceRepository;
    private final NotificationService notificationService;
    private final UserService userService;

    public Workspace createWorkspace(Workspace workspace, String ownerId) {
        workspace.setOwnerId(ownerId);
        workspace.setCreatedAt(LocalDateTime.now());
        workspace.setUpdatedAt(LocalDateTime.now());

        Workspace savedWorkspace = workspaceRepository.save(workspace);

        // Tạo workspace member cho owner
        WorkspaceMember ownerMember = new WorkspaceMember();
        ownerMember.setUserId(ownerId);
        ownerMember.setRole("owner");
        ownerMember.setPermissions(WorkspaceMember.PermissionSets.OWNER_PERMISSIONS);
        ownerMember.setJoinedAt(LocalDateTime.now());
        ownerMember.setInvitedBy(ownerId);
        ownerMember.setStatus("active");
        ownerMember.setLastAccessed(LocalDateTime.now());

        workspaceRepository.addMemberToWorkspace(savedWorkspace.getId(), ownerMember, LocalDateTime.now());

        return savedWorkspace;
    }

    public Optional<Workspace> getWorkspace(String id) {
        return workspaceRepository.findById(id);
    }

    public List<Workspace> getUserWorkspaces(String userId) {
        return workspaceRepository.findByMemberUserId(userId);
    }

    public boolean addMemberToWorkspace(String workspaceId, String userId, String invitedBy, String role) {
        // Kiểm tra quyền của inviter
        if (!hasPermission(invitedBy, workspaceId, "invite")) {
            throw new RuntimeException("No permission to invite members");
        }

        WorkspaceMember member = new WorkspaceMember();
        member.setUserId(userId);
        member.setRole("member");

        // Set permissions based on role
        switch (role) {
            case "full_access":
                member.setPermissions(WorkspaceMember.PermissionSets.MEMBER_FULL_ACCESS);
                break;
            case "edit_only":
                member.setPermissions(WorkspaceMember.PermissionSets.MEMBER_EDIT_ONLY);
                break;
            case "view_only":
                member.setPermissions(WorkspaceMember.PermissionSets.MEMBER_VIEW_ONLY);
                break;
            default:
                member.setPermissions(WorkspaceMember.PermissionSets.MEMBER_VIEW_ONLY);
        }

        member.setJoinedAt(LocalDateTime.now());
        member.setInvitedBy(invitedBy);
        member.setStatus("active");
        member.setLastAccessed(LocalDateTime.now());

        workspaceRepository.addMemberToWorkspace(workspaceId, member, LocalDateTime.now());

        // Gửi thông báo cho thành viên mới
        try {
            Workspace workspace = getWorkspace(workspaceId).orElse(null);
            String inviterName = userService.getUser(invitedBy).map(com.example.collabservice.model.User::getName).orElse("Someone");

            if (workspace != null) {
                notificationService.notifyWorkspaceInvitation(
                        userId, workspaceId, workspace.getName(), inviterName, "generated-invitation-id"
                );
            }
        } catch (Exception e) {
            log.warn("Failed to send notification for new member: {}", e.getMessage());
        }

        // Update workspace statistics
        updateWorkspaceMemberCount(workspaceId);

        return true;
    }

    public boolean removeMemberFromWorkspace(String workspaceId, String userId, String removerId) {
        // Kiểm tra quyền remove
        if (!hasPermission(removerId, workspaceId, "remove_members")) {
            throw new RuntimeException("No permission to remove members");
        }

        // Không thể remove chính mình nếu là owner duy nhất
        if (isLastOwner(workspaceId, userId)) {
            throw new RuntimeException("Cannot remove the last owner");
        }

        workspaceRepository.deleteMemberByWorkspaceIdAndUserId(workspaceId, userId);

        // Gửi thông báo cho thành viên bị xóa
        try {
            Workspace workspace = getWorkspace(workspaceId).orElse(null);
            String removerName = userService.getUser(removerId).map(com.example.collabservice.model.User::getName).orElse("Someone");

            if (workspace != null) {
                notificationService.notifyRemovedFromWorkspace(
                        userId, workspaceId, workspace.getName(), removerName
                );
            }
        } catch (Exception e) {
            log.warn("Failed to send removal notification: {}", e.getMessage());
        }

        updateWorkspaceMemberCount(workspaceId);

        return true;
    }

    public boolean updateMemberPermissions(String workspaceId, String userId, String updaterId, List<String> permissions) {
        // Kiểm tra quyền
        if (!hasPermission(updaterId, workspaceId, "manage_settings")) {
            throw new RuntimeException("No permission to update member permissions");
        }

        Optional<WorkspaceMember> memberOpt = workspaceRepository.findMemberByWorkspaceIdAndUserId(workspaceId, userId);
        if (memberOpt.isPresent()) {
            workspaceRepository.updateMemberPermissions(workspaceId, userId, permissions, LocalDateTime.now());
            return true;
        }

        return false;
    }

    public boolean hasPermission(String userId, String workspaceId, String permission) {
        Optional<WorkspaceMember> memberOpt = workspaceRepository.findMemberByWorkspaceIdAndUserId(workspaceId, userId);
        if (memberOpt.isPresent()) {
            WorkspaceMember member = memberOpt.get();
            return member.getPermissions().contains(permission) || member.getRole().equals("owner");
        }
        return false;
    }

    public boolean isUserInWorkspace(String workspaceId, String userId) {
        return workspaceRepository.findMemberByWorkspaceIdAndUserId(workspaceId, userId).isPresent();
    }

    private boolean isLastOwner(String workspaceId, String userId) {
        List<WorkspaceMember> owners = workspaceRepository.findMembersByWorkspaceIdAndRole(workspaceId, "owner");
        return owners.size() == 1 && owners.get(0).getUserId().equals(userId);
    }

    private void updateWorkspaceMemberCount(String workspaceId) {
        long memberCount = workspaceRepository.countMembersByWorkspaceIdAndStatus(workspaceId, "active");
        workspaceRepository.findById(workspaceId).ifPresent(workspace -> {
            workspace.getStatistics().setTotalMembers((int) memberCount);
            workspace.setUpdatedAt(LocalDateTime.now());
            workspaceRepository.save(workspace);
        });
    }
}