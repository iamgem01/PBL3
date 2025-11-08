package com.smartnote.collaborationservice.dto.response;

import lombok.Data;
import java.time.Instant;
import java.util.List;

@Data
public class DocumentResponse {
    private String id;
    private String title;
    private String content;
    private String workspaceId;
    private String teamspaceId;
    private Long currentVersion;
    private List<String> activeCollaborators;
    private Instant createdAt;
    private Instant updatedAt;

    // Constructors
    public DocumentResponse() {}

    public DocumentResponse(String id, String title, String content) {
        this.id = id;
        this.title = title;
        this.content = content;
    }
}