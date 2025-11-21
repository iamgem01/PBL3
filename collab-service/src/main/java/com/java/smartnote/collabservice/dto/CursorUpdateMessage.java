package com.java.smartnote.collabservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CursorUpdateMessage {
    private String userId;
    private String email;
    private String name;
    private Integer position; // Cursor position in text
    private String color; // Cursor color
    private Long timestamp;
}