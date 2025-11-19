// UserProfileDto.java
package com.aeternus.user_service.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Data
public class UserProfileDto {
    private UUID userId;
    private String username;
    private String email; // Chỉ lấy email string
    private LocalDateTime createdAt;
    private Set<String> roles; // Chỉ lấy tên roles
}