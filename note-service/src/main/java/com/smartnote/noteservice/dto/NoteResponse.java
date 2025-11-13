package com.smartnote.noteservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class NoteResponse {
    private String id;
    private String folderId;
    private String title;
    private String content;
    private String contentType;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer version;
    private List<String> tags;
    private Boolean isImportant;

    private Boolean isDeleted;
    private LocalDateTime deletedAt;
}