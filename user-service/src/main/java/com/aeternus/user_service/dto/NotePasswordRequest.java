package com.aeternus.user_service.dto;

import lombok.Data;

@Data
public class NotePasswordRequest {
    private String password;       
    private String currentPassword; 
}