package com.example.collabservice.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
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
    private String type; // "workspace", "teamspace"

    @Field("target_id")
    private String targetId;

    private String email;
    private String token;
    private String status; // "pending", "accepted", "expired", "revoked"

    @Field("invited_by")
    private String invitedBy;

    @Field("invited_at")
    private LocalDateTime invitedAt;

    @Field("expires_at")
    private LocalDateTime expiresAt;

    private String permission;
    private String role;
    private String message;

    @Field("response_at")
    private LocalDateTime responseAt;

    @Field("auto_join_teamspaces")
    private boolean autoJoinTeamspaces;
}