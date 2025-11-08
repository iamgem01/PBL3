package com.example.collabservice.controller;

import com.example.collabservice.model.Workspace;
import com.example.collabservice.service.WorkspaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workspaces")
@RequiredArgsConstructor
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    @PostMapping
    public ResponseEntity<Workspace> createWorkspace(
            @RequestBody Workspace workspace,
            @RequestHeader("X-User-Id") String userId) {
        Workspace created = workspaceService.createWorkspace(workspace, userId);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public ResponseEntity<List<Workspace>> getUserWorkspaces(
            @RequestHeader("X-User-Id") String userId) {
        List<Workspace> workspaces = workspaceService.getUserWorkspaces(userId);
        return ResponseEntity.ok(workspaces);
    }

    @GetMapping("/{workspaceId}")
    public ResponseEntity<Workspace> getWorkspace(@PathVariable String workspaceId) {
        return workspaceService.getWorkspace(workspaceId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{workspaceId}/members")
    public ResponseEntity<Void> addMember(
            @PathVariable String workspaceId,
            @RequestParam String targetUserId,
            @RequestParam String role,
            @RequestHeader("X-User-Id") String inviterId) {

        boolean success = workspaceService.addMemberToWorkspace(workspaceId, targetUserId, inviterId, role);
        return success ? ResponseEntity.ok().build() : ResponseEntity.badRequest().build();
    }

    @DeleteMapping("/{workspaceId}/members/{userId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable String workspaceId,
            @PathVariable String userId,
            @RequestHeader("X-User-Id") String removerId) {

        boolean success = workspaceService.removeMemberFromWorkspace(workspaceId, userId, removerId);
        return success ? ResponseEntity.ok().build() : ResponseEntity.badRequest().build();
    }

    @GetMapping("/{workspaceId}/has-permission")
    public ResponseEntity<Boolean> hasPermission(
            @PathVariable String workspaceId,
            @RequestParam String permission,
            @RequestHeader("X-User-Id") String userId) {

        boolean hasPerm = workspaceService.hasPermission(userId, workspaceId, permission);
        return ResponseEntity.ok(hasPerm);
    }
}