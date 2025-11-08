package com.example.collabservice.controller;

import com.example.collabservice.model.Teamspace;
import com.example.collabservice.service.TeamspaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teamspaces")
@RequiredArgsConstructor
public class TeamspaceController {

    private final TeamspaceService teamspaceService;

    @PostMapping
    public ResponseEntity<Teamspace> createTeamspace(
            @RequestBody Teamspace teamspace,
            @RequestHeader("X-User-Id") String userId) {
        Teamspace created = teamspaceService.createTeamspace(teamspace, userId);
        return ResponseEntity.ok(created);
    }

    @PostMapping("/{teamspaceId}/members")
    public ResponseEntity<Void> addMember(
            @PathVariable String teamspaceId,
            @RequestParam String targetUserId,
            @RequestParam String permissionLevel,
            @RequestHeader("X-User-Id") String inviterId) {

        boolean success = teamspaceService.addMemberToTeamspace(teamspaceId, targetUserId, inviterId, permissionLevel);
        return success ? ResponseEntity.ok().build() : ResponseEntity.badRequest().build();
    }

    @GetMapping("/workspace/{workspaceId}")
    public ResponseEntity<List<Teamspace>> getWorkspaceTeamspaces(
            @PathVariable String workspaceId) {
        List<Teamspace> teamspaces = teamspaceService.getTeamspacesByWorkspace(workspaceId);
        return ResponseEntity.ok(teamspaces);
    }

    @GetMapping("/workspace/{workspaceId}/accessible")
    public ResponseEntity<List<Teamspace>> getAccessibleTeamspaces(
            @PathVariable String workspaceId,
            @RequestHeader("X-User-Id") String userId) {
        List<Teamspace> teamspaces = teamspaceService.getAccessibleTeamspaces(userId, workspaceId);
        return ResponseEntity.ok(teamspaces);
    }
}