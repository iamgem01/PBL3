package com.example.collabservice.controller;

import com.example.collabservice.model.Invitation;
import com.example.collabservice.service.InvitationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invitations")
@RequiredArgsConstructor
public class InvitationController {

    private final InvitationService invitationService;

    @PostMapping("/workspace/{workspaceId}")
    public ResponseEntity<Invitation> inviteToWorkspace(
            @PathVariable String workspaceId,
            @RequestParam String email,
            @RequestParam String permission,
            @RequestParam String role,
            @RequestHeader("X-User-Id") String invitedBy,
            @RequestParam(required = false) String message) {

        Invitation invitation = invitationService.createWorkspaceInvitation(
                workspaceId, email, permission, role, invitedBy, message);
        return ResponseEntity.ok(invitation);
    }

    @PostMapping("/teamspace/{teamspaceId}")
    public ResponseEntity<Invitation> inviteToTeamspace(
            @PathVariable String teamspaceId,
            @RequestParam String email,
            @RequestParam String permission,
            @RequestParam String role,
            @RequestHeader("X-User-Id") String invitedBy,
            @RequestParam(required = false) String message) {

        Invitation invitation = invitationService.createTeamspaceInvitation(
                teamspaceId, email, permission, role, invitedBy, message);
        return ResponseEntity.ok(invitation);
    }

    @PostMapping("/{token}/accept")
    public ResponseEntity<Void> acceptInvitation(
            @PathVariable String token,
            @RequestHeader("X-User-Id") String userId) {
        boolean success = invitationService.acceptInvitation(token, userId);
        return success ? ResponseEntity.ok().build() : ResponseEntity.badRequest().build();
    }

    @PostMapping("/{token}/decline")
    public ResponseEntity<Void> declineInvitation(
            @PathVariable String token,
            @RequestHeader("X-User-Id") String userId) {
        boolean success = invitationService.declineInvitation(token, userId);
        return success ? ResponseEntity.ok().build() : ResponseEntity.badRequest().build();
    }

    @GetMapping("/pending")
    public ResponseEntity<List<Invitation>> getPendingInvitations(
            @RequestHeader("X-User-Id") String userId) {
        // Get user email and then pending invitations
        List<Invitation> invitations = invitationService.getPendingInvitationsByEmail("user@example.com"); // Need to get from UserService
        return ResponseEntity.ok(invitations);
    }
}