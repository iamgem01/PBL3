package com.example.collabservice.service;

import com.example.collabservice.model.Invitation;
import com.example.collabservice.model.Workspace;
import com.example.collabservice.model.Teamspace;
import com.example.collabservice.repository.CollaborationRepository;
import com.example.collabservice.repository.WorkspaceRepository;
import com.example.collabservice.repository.TeamspaceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class InvitationService {
    private final CollaborationRepository collaborationRepository;
    private final WorkspaceRepository workspaceRepository;
    private final TeamspaceRepository teamspaceRepository;
    private final WorkspaceService workspaceService;
    private final TeamspaceService teamspaceService;
    private final UserService userService;
    private final NotificationService notificationService;

    public Invitation createWorkspaceInvitation(String workspaceId, String email,
                                                String permission, String role,
                                                String invitedBy, String message) {

        // Kiểm tra quyền invite
        if (!workspaceService.hasPermission(invitedBy, workspaceId, "invite")) {
            throw new RuntimeException("No permission to invite to workspace");
        }

        // Kiểm tra xem invitation đã tồn tại chưa
        Optional<Invitation> existingInvitation = collaborationRepository
                .findPendingInvitation(workspaceId, "workspace", email);

        if (existingInvitation.isPresent()) {
            throw new RuntimeException("Invitation already exists for this email");
        }

        Invitation invitation = new Invitation();
        invitation.setType("workspace");
        invitation.setTargetId(workspaceId);
        invitation.setEmail(email);
        invitation.setToken(UUID.randomUUID().toString());
        invitation.setStatus("pending");
        invitation.setInvitedBy(invitedBy);
        invitation.setInvitedAt(LocalDateTime.now());
        invitation.setExpiresAt(LocalDateTime.now().plusDays(7));
        invitation.setPermission(permission);
        invitation.setRole(role);
        invitation.setMessage(message);
        invitation.setAutoJoinTeamspaces(true);

        // TODO: Gửi email invitation

        return collaborationRepository.save(invitation);
    }

    public Invitation createTeamspaceInvitation(String teamspaceId, String email,
                                                String permission, String role,
                                                String invitedBy, String message) {

        Optional<Teamspace> teamspaceOpt = teamspaceRepository.findById(teamspaceId);
        if (teamspaceOpt.isEmpty()) {
            throw new RuntimeException("Teamspace not found");
        }

        Teamspace teamspace = teamspaceOpt.get();

        // Kiểm tra quyền invite trong teamspace
        if (!teamspaceService.hasTeamspacePermission(invitedBy, teamspaceId, "can_invite")) {
            throw new RuntimeException("No permission to invite to teamspace");
        }

        Invitation invitation = new Invitation();
        invitation.setType("teamspace");
        invitation.setTargetId(teamspaceId);
        invitation.setEmail(email);
        invitation.setToken(UUID.randomUUID().toString());
        invitation.setStatus("pending");
        invitation.setInvitedBy(invitedBy);
        invitation.setInvitedAt(LocalDateTime.now());
        invitation.setExpiresAt(LocalDateTime.now().plusDays(7));
        invitation.setPermission(permission);
        invitation.setRole(role);
        invitation.setMessage(message);
        invitation.setAutoJoinTeamspaces(false);

        // TODO: Gửi email invitation

        return collaborationRepository.save(invitation);
    }

    public boolean acceptInvitation(String token, String userId) {
        Optional<Invitation> invitationOpt = collaborationRepository.findInvitationByToken(token);
        if (invitationOpt.isEmpty()) {
            throw new RuntimeException("Invitation not found");
        }

        Invitation invitation = invitationOpt.get();

        // Kiểm tra expiration
        if (invitation.getExpiresAt().isBefore(LocalDateTime.now())) {
            invitation.setStatus("expired");
            collaborationRepository.save(invitation);
            throw new RuntimeException("Invitation has expired");
        }

        // Kiểm tra status
        if (!invitation.getStatus().equals("pending")) {
            throw new RuntimeException("Invitation is not valid");
        }

        // Lấy email của user từ user service
        String userEmail = userService.getUserEmail(userId);
        if (!invitation.getEmail().equals(userEmail)) {
            throw new RuntimeException("Invitation is not for this user");
        }

        // Xử lý acceptance dựa trên type
        boolean success = false;
        if (invitation.getType().equals("workspace")) {
            success = workspaceService.addMemberToWorkspace(
                    invitation.getTargetId(), userId, invitation.getInvitedBy(), invitation.getPermission());
        } else if (invitation.getType().equals("teamspace")) {
            success = teamspaceService.addMemberToTeamspace(
                    invitation.getTargetId(), userId, invitation.getInvitedBy(), invitation.getPermission());
        }

        if (success) {
            invitation.setStatus("accepted");
            invitation.setResponseAt(LocalDateTime.now());
            collaborationRepository.save(invitation);
            return true;
        }

        return false;
    }

    public boolean declineInvitation(String token, String userId) {
        Optional<Invitation> invitationOpt = collaborationRepository.findInvitationByToken(token);
        if (invitationOpt.isPresent()) {
            Invitation invitation = invitationOpt.get();
            invitation.setStatus("declined");
            invitation.setResponseAt(LocalDateTime.now());
            collaborationRepository.save(invitation);
            return true;
        }
        return false;
    }

    public boolean revokeInvitation(String invitationId, String revokerId) {
        Optional<Invitation> invitationOpt = collaborationRepository.findInvitationById(invitationId);
        if (invitationOpt.isPresent()) {
            Invitation invitation = invitationOpt.get();

            // Kiểm tra quyền revoke
            if (!invitation.getInvitedBy().equals(revokerId)) {
                // Kiểm tra nếu revoker là owner/manager
                if (invitation.getType().equals("workspace")) {
                    if (!workspaceService.hasPermission(revokerId, invitation.getTargetId(), "manage_settings")) {
                        throw new RuntimeException("No permission to revoke invitation");
                    }
                }
            }

            invitation.setStatus("revoked");
            collaborationRepository.save(invitation);
            return true;
        }
        return false;
    }

    public List<Invitation> getPendingInvitationsByEmail(String email) {
        return collaborationRepository.findInvitationsByEmailAndStatus(email, "pending");
    }

    public void cleanupExpiredInvitations() {
        List<Invitation> expiredInvitations = collaborationRepository
                .findExpiredInvitations(LocalDateTime.now());

        for (Invitation invitation : expiredInvitations) {
            invitation.setStatus("expired");
            collaborationRepository.save(invitation);
        }

        log.info("Cleaned up {} expired invitations", expiredInvitations.size());
    }
}