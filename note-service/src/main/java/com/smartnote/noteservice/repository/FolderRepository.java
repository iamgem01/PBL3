package com.smartnote.noteservice.repository;

import com.smartnote.noteservice.model.Folder;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface FolderRepository extends MongoRepository<Folder, String> {
    List<Folder> findByUserId(String userId);
    List<Folder> findByParentFolderId(String parentFolderId);
    List<Folder> findByWorkspaceId(String workspaceId);
    
    List<Folder> findByUserIdAndIsDeletedFalse(String userId);
    List<Folder> findByParentFolderIdAndIsDeletedFalse(String parentFolderId);
    List<Folder> findByWorkspaceIdAndIsDeletedFalse(String workspaceId);
    
    List<Folder> findByUserIdAndIsDeletedTrue(String userId);
    List<Folder> findByIsDeletedFalse();
    
}