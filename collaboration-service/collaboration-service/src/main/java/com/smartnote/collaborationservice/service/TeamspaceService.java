package com.example.collabservice.service;

import com.example.collabservice.model.Teamspace;
import com.example.collabservice.model.TeamspaceMember;
import com.example.collabservice.repository.TeamspaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TeamspaceService {
    private final TeamspaceRepository teamspaceRepository;
    private final WorkspaceService workspaceService;

    public Teamspace createTeamspace(Teamspace teamspace, String creatorId) {
        // Kiểm tra quyền trong workspace
        if (!workspaceService.hasPermission(creatorId, teamspace.getWorkspaceId(), "write")) {
            throw new RuntimeException("No permission to create teamspace");
        }

        teamspace.setOwnerId(creatorId);
        teamspace.setCreatedAt(LocalDateTime.now());
        teamspace.setUpdatedAt(LocalDateTime.now());

        Teamspace savedTeamspace = teamspaceRepository.save(teamspace);

        // Tạo teamspace member cho owner
        TeamspaceMember ownerMember = new TeamspaceMember();
        ownerMember.setUserId(creatorId);
        ownerMember.setRole("owner");
        ownerMember.setPermissionLevel("full_access");
        ownerMember.setCustomPermissions(TeamspaceMember.getPermissionsForLevel("full_access"));
        ownerMember.setJoinedAt(LocalDateTime.now());
        ownerMember.setInvitedBy(creatorId);
        ownerMember.setStatus("active");

        teamspaceRepository.addMemberToTeamspace(savedTeamspace.getId(), ownerMember, LocalDateTime.now());

        return savedTeamspace;
    }

    public boolean addMemberToTeamspace(String teamspaceId, String userId, String invitedBy, String permissionLevel) {
        Optional<Teamspace> teamspaceOpt = teamspaceRepository.findById(teamspaceId);
        if (teamspaceOpt.isEmpty()) {
            return false;
        }

        Teamspace teamspace = teamspaceOpt.get();

        // Kiểm tra quyền trong teamspace
        if (!hasTeamspacePermission(invitedBy, teamspaceId, "can_invite")) {
            throw new RuntimeException("No permission to invite members to teamspace");
        }

        TeamspaceMember member = new TeamspaceMember();
        member.setUserId(userId);
        member.setRole("member");
        member.setPermissionLevel(permissionLevel);
        member.setCustomPermissions(TeamspaceMember.getPermissionsForLevel(permissionLevel));
        member.setJoinedAt(LocalDateTime.now());
        member.setInvitedBy(invitedBy);
        member.setStatus("active");

        teamspaceRepository.addMemberToTeamspace(teamspaceId, member, LocalDateTime.now());
        return true;
    }

    public boolean hasTeamspacePermission(String userId, String teamspaceId, String permission) {
        Optional<TeamspaceMember> memberOpt = teamspaceRepository.findMemberByTeamspaceIdAndUserId(teamspaceId, userId);
        if (memberOpt.isPresent()) {
            TeamspaceMember member = memberOpt.get();

            // Owner có toàn quyền
            if (member.getRole().equals("owner")) {
                return true;
            }

            // Kiểm tra custom permissions
            switch (permission) {
                case "can_edit":
                    return member.getCustomPermissions().isCanEdit();
                case "can_delete":
                    return member.getCustomPermissions().isCanDelete();
                case "can_invite":
                    return member.getCustomPermissions().isCanInvite();
                case "can_manage_settings":
                    return member.getCustomPermissions().isCanManageSettings();
                default:
                    return false;
            }
        }

        return false;
    }

    public List<Teamspace> getTeamspacesByWorkspace(String workspaceId) {
        return teamspaceRepository.findByWorkspaceId(workspaceId);
    }

    public List<Teamspace> getAccessibleTeamspaces(String userId, String workspaceId) {
        return teamspaceRepository.findTeamspacesByUserIdAndWorkspaceId(userId, workspaceId);
    }
}