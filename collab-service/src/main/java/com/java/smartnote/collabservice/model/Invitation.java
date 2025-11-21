package com.java.smartnote.collabservice.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "invitations")
public class Invitation {
    
    @Id
    private String id;
    
    @Field("note_id")
    private String noteId;
    
    @Field("inviter_email")
    private String inviterEmail;
    
    @Field("invitee_email")
    private String inviteeEmail;
    
    @Field("token")
    private String token; // Unique token for invitation link
    
    @Field("status")
    private InvitationStatus status = InvitationStatus.PENDING;
    
    @Field("created_at")
    private LocalDateTime createdAt;
    
    @Field("expires_at")
    private LocalDateTime expiresAt;
    
    @Field("accepted_at")
    private LocalDateTime acceptedAt;
    
    public enum InvitationStatus {
        PENDING,
        ACCEPTED,
        DECLINED,
        EXPIRED
    }
}