package com.aeternus.note_service.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notes")
public class Note {
    
    @Id
    private String id;
    
    private String folderId;

    @Field("title")
    private String title;
    
    @Field("content")
    private String content;
    
    @Field("content_type")
    private String contentType = "markdown";
    
    @Field("created_by")
    private String createdBy;
    
    @Field("created_at")
    private LocalDateTime createdAt;
    
    @Field("updated_at")
    private LocalDateTime updatedAt;
    
    @Field("version")
    private Integer version = 1;
    
    @Field("shares")
    private List<Object> shares = new ArrayList<>();
    
    @Field("metadata")
    private Object metadata;
    
    @Field("tags")
    private List<String> tags = new ArrayList<>();

    @Field("is_important")
    private Boolean isImportant = false;

    @Field("is_deleted")
    private Boolean isDeleted = false;

    @Field("deleted_at")
    private LocalDateTime deletedAt;
}