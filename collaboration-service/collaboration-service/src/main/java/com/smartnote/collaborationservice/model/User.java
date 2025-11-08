package com.example.collabservice.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {
    @Id
    private String id;
    private String email;
    private String name;

    @Field("avatar_url")
    private String avatarUrl;

    private boolean verified;

    @Field("created_at")
    private LocalDateTime createdAt;

    @Field("last_login")
    private LocalDateTime lastLogin;

    @Field("last_active")
    private LocalDateTime lastActive;

    @Field("account_status")
    private String accountStatus;

    @Field("storage_used")
    private Long storageUsed;

    private Map<String, Object> preferences;
}