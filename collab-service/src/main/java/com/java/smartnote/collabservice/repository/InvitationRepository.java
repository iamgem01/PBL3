package com.java.smartnote.collabservice.repository;

import com.java.smartnote.collabservice.model.Invitation;
import com.java.smartnote.collabservice.model.Invitation.InvitationStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvitationRepository extends MongoRepository<Invitation, String> {
    
    /**
     * Tìm invitation theo token
     */
    Optional<Invitation> findByToken(String token);
    
    /**
     * Tìm invitations theo noteId
     */
    List<Invitation> findByNoteId(String noteId);
    
    /**
     * Tìm invitations theo invitee email và status
     */
    List<Invitation> findByInviteeEmailAndStatus(String inviteeEmail, InvitationStatus status);
    
    /**
     * Tìm invitation theo noteId, inviteeEmail và status
     */
    List<Invitation> findByNoteIdAndInviteeEmailAndStatus(
        String noteId, 
        String inviteeEmail, 
        InvitationStatus status
    );
}