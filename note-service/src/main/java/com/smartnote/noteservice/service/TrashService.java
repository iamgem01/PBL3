package com.smartnote.noteservice.service;
import com.smartnote.noteservice.model.ItemType;
import com.smartnote.noteservice.model.TrashItem;
import java.util.List;

public interface TrashService {
    
    void moveToTrash(String itemId, ItemType itemType);
    
    void restoreFromTrash(String itemId);
    
    void permanentDelete(String itemId);
    
    List<TrashItem> getTrashItems(String userId);
    List<TrashItem> getTrashItemsByWorkspace(String workspaceId);
    List<TrashItem> getTrashItemsByType(String userId, ItemType itemType);
    
    void emptyTrash(String userId);
    void emptyTrashByWorkspace(String workspaceId);
    void emptyTrashByType(String userId, ItemType itemType);
    
    void cleanupExpiredItems(int daysToKeep);
    
    TrashStats getTrashStats(String userId);
    
    class TrashStats {
        private final int totalItems;
        private final long folderCount;
        private final long noteCount;
        
        public TrashStats(int totalItems, long folderCount, long noteCount) {
            this.totalItems = totalItems;
            this.folderCount = folderCount;
            this.noteCount = noteCount;
        }
        
        public int getTotalItems() { return totalItems; }
        public long getFolderCount() { return folderCount; }
        public long getNoteCount() { return noteCount; }
    }
}