package com.aeternus.note_service.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field; 

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "folders")
public class Folder {

    @Id
    private String id;

    @Field("workspace_id")
    private String workspaceId;

    @Field("parent_folder_id")
    private String parentFolderId;

    private String name;

    @Field("user_id")
    private String userId;

    private int position;

    @Field("created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Field("is_deleted")
    private boolean isDeleted = false;

    @Field("deleted_at")
    private LocalDateTime deletedAt;

    private String path;

    private List<String> ancestors = new ArrayList<>();

    public Folder() {}

    public Folder(String name, String userId, String workspaceId, String parentFolderId) {
        this.name = name;
        this.userId = userId;
        this.workspaceId = workspaceId;
        this.parentFolderId = parentFolderId;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getWorkspaceId() { return workspaceId; }
    public void setWorkspaceId(String workspaceId) { this.workspaceId = workspaceId; }

    public String getParentFolderId() { return parentFolderId; }
    public void setParentFolderId(String parentFolderId) { this.parentFolderId = parentFolderId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public int getPosition() { return position; }
    public void setPosition(int position) { this.position = position; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getPath() { return path; }
    public void setPath(String path) { this.path = path; }

    public List<String> getAncestors() { return ancestors; }
    public void setAncestors(List<String> ancestors) { this.ancestors = ancestors; }

    public boolean isDeleted() { 
        return isDeleted; 
    }
    
    public void setDeleted(boolean deleted) {
        this.isDeleted = deleted;
    }
    
    public LocalDateTime getDeletedAt() {
        return deletedAt;
    }

    public void setDeletedAt(LocalDateTime deletedAt) {
        this.deletedAt = deletedAt;
    }
}