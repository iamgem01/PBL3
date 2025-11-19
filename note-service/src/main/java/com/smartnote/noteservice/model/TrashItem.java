package com.smartnote.noteservice.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "trash_items")
public class TrashItem {
    
    @Id
    private String id;  
    
    @Field("item_type")
    private ItemType itemType;
    
    private String name;
    
    @Field("user_id")
    private String userId;
    
    @Field("workspace_id")
    private String workspaceId;
    
    @Field("deleted_at")
    private LocalDateTime deletedAt;
    
    @Field("original_created_at")
    private LocalDateTime originalCreatedAt;
    
    @Field("parent_folder_id")
    private String parentFolderId;

    public TrashItem() {}

    public TrashItem(String id, ItemType itemType, String name, String userId, 
                    String workspaceId, LocalDateTime originalCreatedAt, String parentFolderId) {
        this.id = id;
        this.itemType = itemType;
        this.name = name;
        this.userId = userId;
        this.workspaceId = workspaceId;
        this.originalCreatedAt = originalCreatedAt;
        this.parentFolderId = parentFolderId;
        this.deletedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public ItemType getItemType() { return itemType; }
    public void setItemType(ItemType itemType) { this.itemType = itemType; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getWorkspaceId() { return workspaceId; }
    public void setWorkspaceId(String workspaceId) { this.workspaceId = workspaceId; }

    public LocalDateTime getDeletedAt() { return deletedAt; }
    public void setDeletedAt(LocalDateTime deletedAt) { this.deletedAt = deletedAt; }

    public LocalDateTime getOriginalCreatedAt() { return originalCreatedAt; }
    public void setOriginalCreatedAt(LocalDateTime originalCreatedAt) { this.originalCreatedAt = originalCreatedAt; }

    public String getParentFolderId() { return parentFolderId; }
    public void setParentFolderId(String parentFolderId) { this.parentFolderId = parentFolderId; }
}