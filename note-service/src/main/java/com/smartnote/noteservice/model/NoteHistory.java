package com.smartnote.noteservice.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@Document(collection = "note_history")
public class NoteHistory {

    @Id
    private String id;

    @Field("original_note_id")
    private String originalNoteId;
    @Field("is_important")
    private Boolean isImportant;

    private String folderId;
    private String title;
    private String content;
    @Field("content_type")
    private String contentType;
    @Field("created_by")
    private String createdBy;
    @Field("created_at")
    private LocalDateTime createdAt;
    @Field("updated_at")
    private LocalDateTime updatedAt;
    private Integer version;
    private List<Object> shares;
    private Object metadata;
    private List<String> tags;
    private String action; 
    private String description;

    public NoteHistory(Note note) {
        this.originalNoteId = note.getId();
        this.folderId = note.getFolderId();
        this.title = note.getTitle();
        this.content = note.getContent();
        this.contentType = note.getContentType();
        this.createdBy = note.getCreatedBy();
        this.createdAt = note.getCreatedAt();
        this.updatedAt = note.getUpdatedAt();
        this.version = note.getVersion();
        this.shares = note.getShares();
        this.metadata = note.getMetadata();
        this.tags = note.getTags();
        this.isImportant = note.getIsImportant();
    }
}