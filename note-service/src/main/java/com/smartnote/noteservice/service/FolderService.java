package com.smartnote.noteservice.service;

import com.smartnote.noteservice.model.Folder;
import java.util.List;
import java.util.Optional;

public interface FolderService {
    Folder createFolder(String name, String userId, String workspaceId, String parentFolderId);
    List<Folder> getAllFolders();
    List<Folder> getSubFolders(String parentFolderId);
    List<Folder> getUserFolders(String userId);
    List<Folder> getWorkspaceFolders(String workspaceId);
    Folder renameFolder(String folderId, String newName);
    Folder moveFolder(String folderId, String newParentId);
    Optional<Folder> getFolderById(String folderId);
    Folder updatePosition(String folderId, int newPosition);
    void reorderFolders(List<String> folderIdsInOrder);

    void internalMoveToTrash(String folderId);
    void internalPermanentDelete(String folderId);
    Folder internalRestoreFromTrash(String folderId);
}