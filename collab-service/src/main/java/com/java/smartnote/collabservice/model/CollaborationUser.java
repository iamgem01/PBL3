package com.java.smartnote.collabservice.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CollaborationUser {
    private String userId;
    private String email;
    private String name;
    private String color; 
    private Integer cursorPosition;
    private Long lastActivity; 
}