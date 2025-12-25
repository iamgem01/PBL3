package com.aeternus.user_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginSessionDto {
    private String id;
    private String device;
    private String browser;
    private LocalDateTime lastActive;
    private boolean current;
}
