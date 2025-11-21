package com.java.smartnote.collabservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserJoinMessage {
    private String userId;
    private String email;
    private String name;
    private String color;
    private String type; // "JOIN" or "LEAVE"
    private Long timestamp;
}