package com.java.smartnote.collabservice.service;

import com.java.smartnote.collabservice.model.Invitation;
import com.java.smartnote.collabservice.model.Invitation.InvitationStatus;
import com.java.smartnote.collabservice.repository.InvitationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class InvitationService {
    
    @Autowired
    private InvitationRepository invitationRepository;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private NoteService noteService;
    
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
        
        // Add user to note shares - no need to call separately
        // The user can now access the note since invitation is accepted
        
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
}