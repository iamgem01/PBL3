package com.smartnote.noteservice.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

public class FolderRequest {
    private String name;

    @JsonProperty("userId")
    @JsonAlias("user_id")
    private String userId;

    @JsonProperty("workspaceId")
    @JsonAlias("workspace_id")
    private String workspaceId;

    @JsonProperty("parentFolderId")
    @JsonAlias("parent_folder_id")
    private String parentFolderId;

    @JsonProperty("newName")
    @JsonAlias("new_name")
    private String newName;        

    @JsonProperty("newParentId")
    @JsonAlias("new_parent_id")
    private String newParentId;   
    private Integer position;  


    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getWorkspaceId() { return workspaceId; }
    public void setWorkspaceId(String workspaceId) { this.workspaceId = workspaceId; }

    public String getParentFolderId() { return parentFolderId; }
    public void setParentFolderId(String parentFolderId) { this.parentFolderId = parentFolderId; }

    public String getNewName() { return newName; }
    public void setNewName(String newName) { this.newName = newName; }

    public String getNewParentId() { return newParentId; }
    public void setNewParentId(String newParentId) { this.newParentId = newParentId; }

    public Integer getPosition() { return position; } 
    public void setPosition(Integer position) { this.position = position; }
}