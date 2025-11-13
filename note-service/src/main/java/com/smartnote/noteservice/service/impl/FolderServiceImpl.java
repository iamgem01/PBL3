package com.smartnote.noteservice.service.impl;

import com.smartnote.noteservice.model.Folder;
import com.smartnote.noteservice.repository.FolderRepository;
import com.smartnote.noteservice.service.FolderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FolderServiceImpl implements FolderService {

    @Autowired
    private FolderRepository folderRepository;

    @Override
    public Folder createFolder(String name, String userId, String workspaceId, String parentFolderId) {
        Folder folder = new Folder();
        folder.setName(name);
        folder.setUserId(userId);
        folder.setWorkspaceId(workspaceId);
        folder.setParentFolderId(parentFolderId);
        folder.setCreatedAt(LocalDateTime.now());
        folder.setDeleted(false);

        int newPosition = calculateNextPosition(parentFolderId, workspaceId);
        folder.setPosition(newPosition);

        Folder parent = null;
        if (parentFolderId != null && !parentFolderId.isEmpty()) {
            parent = folderRepository.findById(parentFolderId)
                    .orElseThrow(() -> new RuntimeException("Parent folder not found with id: " + parentFolderId));

            if (parent.isDeleted()) {
                throw new RuntimeException("Cannot create folder under a deleted parent folder");
            }

            if (parent.getWorkspaceId() != null && workspaceId != null && !parent.getWorkspaceId().equals(workspaceId)) {
                throw new RuntimeException("Workspace mismatch: parent and subfolder must be in the same workspace");
            }
            if (parent.getUserId() != null && userId != null && !parent.getUserId().equals(userId)) {
                throw new RuntimeException("User mismatch: parent and subfolder must have the same owner");
            }

            List<String> ancestors = new ArrayList<>(parent.getAncestors());
            ancestors.add(parent.getId());
            folder.setAncestors(ancestors);
        } else {
            folder.setAncestors(new ArrayList<>());
        }

        Folder savedFolder = folderRepository.save(folder);

        if (parent != null) {
            savedFolder.setPath(parent.getPath() + "/" + savedFolder.getId());
        } else {
            savedFolder.setPath("/" + savedFolder.getId());
        }

        Folder finalFolder = folderRepository.save(savedFolder);
        
        return finalFolder;
    }

    private int calculateNextPosition(String parentFolderId, String workspaceId) {
        List<Folder> existingFolders;
        
        if (parentFolderId != null && !parentFolderId.isEmpty()) {
            existingFolders = folderRepository.findByParentFolderIdAndIsDeletedFalse(parentFolderId);
        } else {
            existingFolders = folderRepository.findByWorkspaceIdAndIsDeletedFalse(workspaceId)
                    .stream()
                    .filter(f -> f.getParentFolderId() == null || f.getParentFolderId().isEmpty())
                    .collect(Collectors.toList());
        }
        
        if (existingFolders.isEmpty()) {
            return 0;
        }
        
        int maxPosition = existingFolders.stream()
                .mapToInt(Folder::getPosition)
                .max()
                .orElse(0);
        
        return maxPosition + 1;
    }

    @Override
    public List<Folder> getAllFolders() {
        return folderRepository.findByIsDeletedFalse();
    }

    @Override
    public List<Folder> getSubFolders(String parentFolderId) {
        return folderRepository.findByParentFolderIdAndIsDeletedFalse(parentFolderId);
    }

    @Override
    public List<Folder> getUserFolders(String userId) {
        return folderRepository.findByUserIdAndIsDeletedFalse(userId);
    }

    @Override
    public List<Folder> getWorkspaceFolders(String workspaceId) {
        return folderRepository.findByWorkspaceIdAndIsDeletedFalse(workspaceId);
    }

    @Override
    public Folder renameFolder(String folderId, String newName) {
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new RuntimeException("Folder not found with id: " + folderId));
        
        if (folder.isDeleted()) {
            throw new RuntimeException("Cannot rename folder in trash");
        }
        folder.setName(newName);
        Folder savedFolder = folderRepository.save(folder);
        
        return savedFolder;
    }

    @Override
    public Folder moveFolder(String folderId, String newParentId) {
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new RuntimeException("Folder not found"));

        if (folder.isDeleted()) {
            throw new RuntimeException("Cannot move folder in trash");
        }

        if (folderId.equals(newParentId)) {
            throw new RuntimeException("Cannot move folder into itself");
        }

        if (newParentId != null && folder.getAncestors().contains(newParentId)) {
            throw new RuntimeException("Cannot move folder into its own subfolder");
        }

        int newPosition = calculateNextPosition(newParentId, folder.getWorkspaceId());

        if (newParentId == null || newParentId.isEmpty()) {
            folder.setParentFolderId(null);
            folder.setAncestors(new ArrayList<>());
            folder.setPath("/" + folder.getId());
            folder.setPosition(newPosition);
        } else {
            Folder newParent = folderRepository.findById(newParentId)
                    .orElseThrow(() -> new RuntimeException("Parent folder not found"));

            if (newParent.isDeleted()) {
                throw new RuntimeException("Cannot move folder into a folder in trash");
            }

            folder.setParentFolderId(newParentId);
            folder.setPosition(newPosition);

            List<String> ancestors = new ArrayList<>(newParent.getAncestors());
            ancestors.add(newParent.getId());
            folder.setAncestors(ancestors);
            folder.setPath(newParent.getPath() + "/" + folder.getId());
        }

        Folder movedFolder = folderRepository.save(folder);
        return movedFolder;
    }

    @Override
    public Optional<Folder> getFolderById(String folderId) {
        return folderRepository.findById(folderId);
    }

    @Override
    public Folder updatePosition(String folderId, int newPosition) {
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new RuntimeException("Folder not found"));
        
        if (folder.isDeleted()) {
            throw new RuntimeException("Cannot update position of folder in trash");
        }
        
        if (newPosition < 0) {
            throw new RuntimeException("Position cannot be negative");
        }
        folder.setPosition(newPosition);
        Folder updatedFolder = folderRepository.save(folder);
        
        return updatedFolder;
    }

    @Override
    public void reorderFolders(List<String> folderIdsInOrder) {
        if (folderIdsInOrder == null || folderIdsInOrder.isEmpty()) {
            throw new RuntimeException("Folder IDs list cannot be empty");
        }
        
        for (String folderId : folderIdsInOrder) {
            Folder folder = folderRepository.findById(folderId)
                    .orElseThrow(() -> new RuntimeException("Folder not found: " + folderId));
            if (folder.isDeleted()) {
                throw new RuntimeException("Cannot reorder folder in trash: " + folderId);
            }
        }
        
        for (int i = 0; i < folderIdsInOrder.size(); i++) {
            String folderId = folderIdsInOrder.get(i);
            Folder folder = folderRepository.findById(folderId)
                    .orElseThrow(() -> new RuntimeException("Folder not found: " + folderId));
            folder.setPosition(i);
            folderRepository.save(folder);
        }
    }

    // ✅ INTERNAL METHODS CHO TRASH SERVICE

    @Override
    public void internalMoveToTrash(String folderId) {
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new RuntimeException("Folder not found with id: " + folderId));

        if (folder.isDeleted()) {
            throw new RuntimeException("Folder is already in trash");
        }

        softDeleteRecursive(folder);
    }

    @Override
    public Folder internalRestoreFromTrash(String folderId) {
        Optional<Folder> folderOpt = folderRepository.findById(folderId);
        
        if (!folderOpt.isPresent()) {
            throw new RuntimeException("Folder not found with id: " + folderId);
        }
        
        Folder folder = folderOpt.get();

        if (!folder.isDeleted()) {
            throw new RuntimeException("Folder is not in trash.");
        }

        if (folder.getParentFolderId() != null && !folder.getParentFolderId().isEmpty()) {
            Optional<Folder> parentOpt = folderRepository.findById(folder.getParentFolderId());
            if (parentOpt.isPresent()) {
                Folder parent = parentOpt.get();
                if (parent.isDeleted()) {
                    throw new RuntimeException("Cannot restore folder because parent folder is in trash");
                }
            } else {
                // Nếu parent không tồn tại, restore như root folder
                folder.setParentFolderId(null);
                folder.setAncestors(new ArrayList<>());
                folder.setPath("/" + folder.getId());
            }
        } else {
        }
        restoreRecursive(folder);
        return folder;
    }

    @Override
    public void internalPermanentDelete(String folderId) {
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new RuntimeException("Folder not found with id: " + folderId));

        if (!folder.isDeleted()) {
            throw new RuntimeException("Folder is not in trash. Please move to trash first.");
        }

        permanentDeleteRecursive(folder);
    }
    private void softDeleteRecursive(Folder folder) {
   
        folder.setDeleted(true);
        folder.setDeletedAt(LocalDateTime.now());
        folderRepository.save(folder);
        List<Folder> subFolders = folderRepository.findByParentFolderId(folder.getId());
        
        for (Folder subFolder : subFolders) {
            if (!subFolder.isDeleted()) {
                softDeleteRecursive(subFolder);
            } else {
            }
        }
    }

    private void restoreRecursive(Folder folder) {

        folder.setDeleted(false);
        folder.setDeletedAt(null);
        folderRepository.save(folder);
        List<Folder> subFolders = folderRepository.findByParentFolderId(folder.getId());
        
        for (Folder subFolder : subFolders) {
            if (subFolder.isDeleted()) {
                restoreRecursive(subFolder);
            } else {
            }
        }
    }

    private void permanentDeleteRecursive(Folder folder) {
        if (!folder.isDeleted()) {
            return;
        }
        List<Folder> subFolders = folderRepository.findByParentFolderId(folder.getId());
        
        for (Folder subFolder : subFolders) {
            if (subFolder.isDeleted()) {
                permanentDeleteRecursive(subFolder);
            } else {
            }
        }
        folderRepository.delete(folder);
    }
}