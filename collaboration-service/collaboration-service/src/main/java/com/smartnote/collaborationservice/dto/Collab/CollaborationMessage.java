package com.example.collabservice.dto.websocket;

import com.example.collabservice.model.DocumentChange;
import lombok.Data;

import java.util.List;

@Data
public class CollaborationMessage {
    private String type; // "CHANGE", "CURSOR_UPDATE", "SYNC_REQUEST", "SYNC_RESPONSE", "ERROR"
    private Object data;
    private List<DocumentChange.Change> changes;
    private Long parentVersion;
    private Long sinceVersion;
    private Integer cursorPosition;
    private String clientId;

    public CollaborationMessage() {}

    public CollaborationMessage(String type, Object data) {
        this.type = type;
        this.data = data;
    }
}