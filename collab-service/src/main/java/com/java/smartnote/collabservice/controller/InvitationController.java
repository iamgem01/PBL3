package com.java.smartnote.collabservice.controller;

import com.java.smartnote.collabservice.dto.InviteUserRequest;
import com.java.smartnote.collabservice.dto.AcceptInvitationRequest;
import com.java.smartnote.collabservice.model.Invitation;
import com.java.smartnote.collabservice.service.InvitationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RequestMapping("/api/invitations")
public class InvitationController {
    
    @Autowired
    private InvitationService invitationService;
    
    /**
     * Gửi invitation qua email
     */
    @PostMapping("/invite")
    public ResponseEntity<?> inviteUser(@RequestBody InviteUserRequest request) {
        System.out.println("========================================");
        System.out.println("📨 INVITE USER REQUEST");
        System.out.println("========================================");
        System.out.println("Note ID: " + request.getNoteId());
        System.out.println("Inviter: " + request.getInviterEmail());
        System.out.println("Invitee: " + request.getInviteeEmail());
        
        try {
            Invitation invitation = invitationService.createInvitation(
                request.getNoteId(),
                request.getInviterEmail(),
                request.getInviteeEmail()
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Invitation sent successfully");
            response.put("invitation", invitation);
            
            System.out.println("✅ INVITE SUCCESSFUL");
            System.out.println("========================================");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ INVITE FAILED: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to send invitation");
            error.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Accept invitation
     */
    @PostMapping("/accept")
    public ResponseEntity<?> acceptInvitation(@RequestBody AcceptInvitationRequest request) {
        System.out.println("========================================");
        System.out.println("✅ ACCEPT INVITATION REQUEST");
        System.out.println("========================================");
        System.out.println("Token: " + request.getToken());
        System.out.println("User Email: " + request.getUserEmail());
        
        try {
            Invitation invitation = invitationService.acceptInvitation(
                request.getToken(),
                request.getUserEmail()
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Invitation accepted");
            response.put("noteId", invitation.getNoteId());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ ACCEPT FAILED: " + e.getMessage());
            
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to accept invitation");
            error.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Lấy invitations cho một note
     */
    @GetMapping("/note/{noteId}")
    public ResponseEntity<?> getInvitationsByNote(@PathVariable String noteId) {
        try {
            List<Invitation> invitations = invitationService.getInvitationsByNoteId(noteId);
            return ResponseEntity.ok(invitations);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to fetch invitations");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Lấy pending invitations cho user
     */
    @GetMapping("/user/{email}")
    public ResponseEntity<?> getPendingInvitations(@PathVariable String email) {
        try {
            List<Invitation> invitations = invitationService.getPendingInvitationsForUser(email);
            return ResponseEntity.ok(invitations);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to fetch invitations");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}