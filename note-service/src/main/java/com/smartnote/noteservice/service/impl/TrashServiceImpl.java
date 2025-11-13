package com.smartnote.noteservice.service.impl;

import com.smartnote.noteservice.model.Folder;
import com.smartnote.noteservice.model.Note;
import com.smartnote.noteservice.model.TrashItem;
import com.smartnote.noteservice.repository.FolderRepository;
import com.smartnote.noteservice.repository.NoteRepository;
import com.smartnote.noteservice.repository.TrashRepository;
import com.smartnote.noteservice.service.*;
import com.smartnote.noteservice.model.ItemType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TrashServiceImpl implements TrashService {

    @Autowired
    private FolderService folderService;
    
    @Autowired
    private NoteService noteService;
    
    @Autowired
    private FolderRepository folderRepository;
    
    @Autowired
    private NoteRepository noteRepository;
    
    @Autowired
    private TrashRepository trashRepository;

    @Override
    public void moveToTrash(String itemId, ItemType itemType) {
        
        if (trashRepository.existsById(itemId)) {
            throw new RuntimeException("Item already exists in trash: " + itemId);
        }
        
        switch (itemType) {
            case FOLDER:
                Folder folder = folderRepository.findById(itemId)
                    .orElseThrow(() -> new RuntimeException("Folder not found: " + itemId));
                
                if (folder.isDeleted()) {
                    throw new RuntimeException("Folder is already in trash: " + itemId);
                }
                TrashItem folderTrashItem = new TrashItem(
                    folder.getId(),
                    ItemType.FOLDER,
                    folder.getName(),
                    folder.getUserId(),
                    folder.getWorkspaceId(),
                    folder.getCreatedAt(),
                    folder.getParentFolderId()
                );
                trashRepository.save(folderTrashItem);

                folderService.internalMoveToTrash(itemId);
                break;
                
            case NOTE:
                Note note = noteRepository.findById(itemId)
                    .orElseThrow(() -> new RuntimeException("Note not found: " + itemId));
                
                if (note.getIsDeleted()) {
                    throw new RuntimeException("Note is already in trash: " + itemId);
                }
                TrashItem noteTrashItem = new TrashItem(
                    note.getId(),
                    ItemType.NOTE,
                    note.getTitle(),
                    note.getCreatedBy(),
                    "", 
                    note.getCreatedAt(),
                    note.getFolderId()
                );
                trashRepository.save(noteTrashItem);
                
                noteService.internalMoveToTrash(itemId);
                break;
                
            default:
                throw new RuntimeException("Unsupported item type: " + itemType);
        }
    }

    @Override
    public void restoreFromTrash(String itemId) {
        TrashItem trashItem = trashRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found in trash: " + itemId));
        
        switch (trashItem.getItemType()) {
            case FOLDER:
                boolean folderExists = folderRepository.existsById(itemId);
                
                if (!folderExists) {
                    trashRepository.deleteById(itemId);
                    throw new RuntimeException("Cannot restore - folder was permanently deleted: " + itemId);
                }
                
                folderService.internalRestoreFromTrash(itemId);
                break;
                
            case NOTE:
                boolean noteExists = noteRepository.existsById(itemId);
                
                if (!noteExists) {
                    trashRepository.deleteById(itemId);
                    throw new RuntimeException("Cannot restore - note was permanently deleted: " + itemId);
                }
                
                noteService.internalRestoreFromTrash(itemId);
                break;
                
            default:
                throw new RuntimeException("Unknown item type for: " + itemId);
        }
        trashRepository.deleteById(itemId);
    }

    @Override
    public void permanentDelete(String itemId) {
        TrashItem trashItem = trashRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found in trash: " + itemId));
        
        switch (trashItem.getItemType()) {
            case FOLDER:
                boolean folderExists = folderRepository.existsById(itemId);
                
                if (folderExists) {
                    folderService.internalPermanentDelete(itemId);
                }
                break;
                
            case NOTE:
                boolean noteExists = noteRepository.existsById(itemId);
                
                if (noteExists) {
                    noteService.internalPermanentDelete(itemId);
                }
                break;
                
            default:
                throw new RuntimeException("Unknown item type for: " + itemId);
        }
        trashRepository.deleteById(itemId);
    }

    @Override
    public List<TrashItem> getTrashItems(String userId) {
        return trashRepository.findByUserId(userId);
    }

    @Override
    public List<TrashItem> getTrashItemsByWorkspace(String workspaceId) {
        return trashRepository.findByWorkspaceId(workspaceId);
    }

    @Override
    public List<TrashItem> getTrashItemsByType(String userId, ItemType itemType) {
        return trashRepository.findByItemTypeAndUserId(itemType, userId);
    }

    @Override
    public void emptyTrash(String userId) {
        List<TrashItem> trashItems = trashRepository.findByUserId(userId);
        
        for (TrashItem item : trashItems) {
            try {
                permanentDelete(item.getId());
            } catch (Exception e) {
               
            }
        }
    }

    @Override
    public void emptyTrashByWorkspace(String workspaceId) {
        List<TrashItem> trashItems = trashRepository.findByWorkspaceId(workspaceId);
        
        for (TrashItem item : trashItems) {
            try {
                permanentDelete(item.getId());
            } catch (Exception e) {
                
            }
        }
    }

    @Override
    public void emptyTrashByType(String userId, ItemType itemType) {
        List<TrashItem> trashItems = trashRepository.findByItemTypeAndUserId(itemType, userId);
        
        for (TrashItem item : trashItems) {
            try {
                permanentDelete(item.getId());
            } catch (Exception e) {
                
            }
        }
    }

    @Override
    public void cleanupExpiredItems(int daysToKeep) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysToKeep);
        List<TrashItem> expiredItems = trashRepository.findByDeletedAtBefore(cutoffDate);
        
        for (TrashItem item : expiredItems) {
            try {
                permanentDelete(item.getId());
            } catch (Exception e) {
                
            }
        }
    }

    @Override
    public TrashStats getTrashStats(String userId) {
        List<TrashItem> allItems = trashRepository.findByUserId(userId);
        long folderCount = allItems.stream().filter(item -> item.getItemType() == ItemType.FOLDER).count();
        long noteCount = allItems.stream().filter(item -> item.getItemType() == ItemType.NOTE).count();
        return new TrashStats(allItems.size(), folderCount, noteCount);
    }

    public void cleanupInvalidTrashItems() {
        List<TrashItem> allTrashItems = trashRepository.findAll();
        for (TrashItem trashItem : allTrashItems) {
            boolean itemExists = false;
            
            switch (trashItem.getItemType()) {
                case FOLDER:
                    itemExists = folderRepository.existsById(trashItem.getId());
                    break;
                case NOTE:
                    itemExists = noteRepository.existsById(trashItem.getId());
                    break;
            }
            
            if (!itemExists) {
                trashRepository.delete(trashItem);
            }
        }
    }

    public boolean validateTrashItem(String itemId) {
        Optional<TrashItem> trashItemOpt = trashRepository.findById(itemId);
        if (!trashItemOpt.isPresent()) {
            return false;
        }
        
        TrashItem trashItem = trashItemOpt.get();
        boolean itemExists = false;
        
        switch (trashItem.getItemType()) {
            case FOLDER:
                itemExists = folderRepository.existsById(itemId);
                break;
            case NOTE:
                itemExists = noteRepository.existsById(itemId);
                break;
        }
        return itemExists;
    }
}