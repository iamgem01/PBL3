package com.java.smartnote.collabservice.service;

import com.java.smartnote.collabservice.model.Invitation;
import com.java.smartnote.collabservice.model.Invitation.InvitationStatus;
import com.java.smartnote.collabservice.repository.InvitationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class InvitationService {

    @Autowired
    private InvitationRepository invitationRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private NoteService noteService;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${user.service.url:http://localhost:5000}")
    private String userServiceUrl;

    /**
     * Tạo invitation và gửi email
     */
    public Invitation createInvitation(String noteId, String inviterEmail, String inviteeEmail, String currentUserId) {
        System.out.println("========================================");
        System.out.println("📧 CREATING INVITATION");
        System.out.println("========================================");
        System.out.println("Note ID: " + noteId);
        System.out.println("From: " + inviterEmail);
        System.out.println("To: " + inviteeEmail);
        System.out.println("Current User: " + currentUserId);

        // Check if current user is the owner of the note
        com.java.smartnote.collabservice.model.Note note = noteService.getNoteById(noteId);
        if (note == null) {
            throw new RuntimeException("Note not found");
        }

        if (!note.getCreatedBy().equals(currentUserId)) {
            throw new RuntimeException("Only the note owner can send invitations");
        }

        // Kiểm tra xem đã invite chưa
        List<Invitation> existingInvitations = invitationRepository
                .findByNoteIdAndInviteeEmailAndStatus(noteId, inviteeEmail, InvitationStatus.PENDING);

        if (!existingInvitations.isEmpty()) {
            System.out.println("⚠️ Invitation already exists");
            return existingInvitations.get(0);
        }

        // Tạo invitation mới
        Invitation invitation = new Invitation();
        invitation.setNoteId(noteId);
        invitation.setInviterEmail(inviterEmail);
        invitation.setInviteeEmail(inviteeEmail);
        invitation.setToken(UUID.randomUUID().toString());
        invitation.setStatus(InvitationStatus.PENDING);
        invitation.setCreatedAt(LocalDateTime.now());
        invitation.setExpiresAt(LocalDateTime.now().plusDays(7)); // Hết hạn sau 7 ngày

        Invitation savedInvitation = invitationRepository.save(invitation);

        // Gửi email
        try {
            emailService.sendInvitationEmail(savedInvitation);
            System.out.println("✅ Invitation email sent successfully to: " + inviteeEmail);
        } catch (Exception e) {
            System.err.println("❌ CRITICAL: Failed to send invitation email to: " + inviteeEmail);
            System.err.println("❌ Error details: " + e.getMessage());
            e.printStackTrace();

            // XÓA INVITATION nếu không thể gửi email
            try {
                invitationRepository.delete(savedInvitation);
                System.err.println("🗑️ Invitation deleted due to email failure");
            } catch (Exception deleteError) {
                System.err.println("❌ Failed to delete invitation: " + deleteError.getMessage());
            }

            // FAIL toàn bộ operation
            throw new RuntimeException("Failed to send invitation email: " + e.getMessage(), e);
        }

        System.out.println("✅ INVITATION CREATED");
        System.out.println("========================================");

        return savedInvitation;
    }

    /**
     * Accept invitation
     * FIX: Actually share the note with the user when they accept
     */
    public Invitation acceptInvitation(String token, String userEmail) {
        System.out.println("========================================");
        System.out.println("✅ ACCEPTING INVITATION");
        System.out.println("========================================");

        Invitation invitation = invitationRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invitation not found"));

        // Kiểm tra hết hạn
        if (invitation.getExpiresAt().isBefore(LocalDateTime.now())) {
            invitation.setStatus(InvitationStatus.EXPIRED);
            invitationRepository.save(invitation);
            throw new RuntimeException("Invitation expired");
        }

        // Kiểm tra email
        if (!invitation.getInviteeEmail().equalsIgnoreCase(userEmail)) {
            throw new RuntimeException("Email does not match invitation");
        }

        // Kiểm tra đã accept chưa
        if (invitation.getStatus() == InvitationStatus.ACCEPTED) {
            System.out.println("⚠️ Invitation already accepted");
            return invitation;
        }

        // Update invitation
        invitation.setStatus(InvitationStatus.ACCEPTED);
        invitation.setAcceptedAt(LocalDateTime.now());
        Invitation updated = invitationRepository.save(invitation);

        // FIX: Actually add user to note shares when they accept invitation
        // This was missing - invitations were accepted but users couldn't see the note!
        try {
            System.out.println("📤 Adding user to note shares...");

            // Get user ID from email by calling user-service
            String userId = getUserIdFromEmail(userEmail);
            if (userId == null) {
                System.err.println("⚠️ Could not find userId for email: " + userEmail);
                System.err.println("⚠️ Using email as fallback identifier");
                userId = userEmail; // Fallback to email
            }

            com.java.smartnote.collabservice.model.Note note = noteService.getNoteById(invitation.getNoteId());
            if (note != null) {
                List<Object> currentShares = note.getShares();
                if (currentShares == null) {
                    currentShares = new java.util.ArrayList<>();
                }

                // Add userId to shares if not already present
                if (!currentShares.contains(userId)) {
                    currentShares.add(userId);
                    note.setShares(currentShares);
                    note.setUpdatedAt(LocalDateTime.now());
                    noteService.updateNoteShares(invitation.getNoteId(), currentShares);
                    System.out.println("✅ User added to note shares: " + userId);
                }
            }
        } catch (Exception e) {
            System.err.println("⚠️ Failed to add user to shares: " + e.getMessage());
            // Don't fail the whole operation, invitation is still accepted
        }

        System.out.println("✅ INVITATION ACCEPTED");
        System.out.println("========================================");

        return updated;
    }

    /**
     * Lấy invitations cho một note
     */
    public List<Invitation> getInvitationsByNoteId(String noteId) {
        return invitationRepository.findByNoteId(noteId);
    }

    /**
     * Lấy invitations cho một user
     */
    public List<Invitation> getPendingInvitationsForUser(String email) {
        return invitationRepository.findByInviteeEmailAndStatus(email, InvitationStatus.PENDING);
    }

    /**
     * Get userId from email by calling user-service
     */
    private String getUserIdFromEmail(String email) {
        try {
            String url = userServiceUrl + "/api/users/email/" + email;
            System.out.println("📡 Fetching userId from: " + url);

            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> userData = response.getBody();
                Object userId = userData.get("_id");
                if (userId == null) {
                    userId = userData.get("id");
                }

                if (userId != null) {
                    String userIdStr = userId.toString();
                    System.out.println("✅ Found userId: " + userIdStr + " for email: " + email);
                    return userIdStr;
                }
            }

            System.err.println("⚠️ No userId found for email: " + email);
            return null;

        } catch (Exception e) {
            System.err.println("❌ Error fetching userId: " + e.getMessage());
            return null;
        }
    }
}