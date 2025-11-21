package com.java.smartnote.collabservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NoteUpdateMessage {
    private String noteId;
    private String content;
    private String senderId;
    private String senderEmail;
    private String senderName;
    private String type; // "EDIT" or "CURSOR"
    private Long timestamp;
}