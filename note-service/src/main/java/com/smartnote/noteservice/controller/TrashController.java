package com.smartnote.noteservice.controller;

import com.smartnote.noteservice.model.TrashItem;
import com.smartnote.noteservice.model.ItemType;
import com.smartnote.noteservice.service.TrashService;
import com.smartnote.noteservice.service.impl.TrashServiceImpl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/trash")
public class TrashController {

    @Autowired
    private TrashService trashService;

    @PostMapping("/move/{id}")
    public ResponseEntity<?> moveToTrash(@PathVariable String id, @RequestBody Map<String, String> request) {
        try {
            String itemTypeStr = request.get("itemType");
            
            if (itemTypeStr == null) {
                return ResponseEntity.badRequest().body("itemType is required");
            }
            
            ItemType itemType;
            try {
                itemType = ItemType.valueOf(itemTypeStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body("Invalid itemType. Use FOLDER or NOTE");
            }
            
            trashService.moveToTrash(id, itemType);
            return ResponseEntity.ok().body("Item moved to trash successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/restore/{itemId}")
    public ResponseEntity<?> restoreFromTrash(@PathVariable String itemId) {
        try {
            trashService.restoreFromTrash(itemId);
            return ResponseEntity.ok().body("Item restored successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<?> permanentDelete(@PathVariable String itemId) {
        try {
            trashService.permanentDelete(itemId);
            return ResponseEntity.ok().body("Item permanently deleted");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public List<TrashItem> getTrashItems(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String workspaceId,
            @RequestParam(required = false) String itemType) {
        
        if (itemType != null && userId != null) {
            try {
                ItemType type = ItemType.valueOf(itemType.toUpperCase());
                return trashService.getTrashItemsByType(userId, type);
            } catch (IllegalArgumentException e) {
                return List.of();
            }
        }
        
        if (userId != null) {
            return trashService.getTrashItems(userId);
        } else if (workspaceId != null) {
            return trashService.getTrashItemsByWorkspace(workspaceId);
        } else {
            return List.of();
        }
    }

    @DeleteMapping
    public ResponseEntity<?> emptyTrash(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String workspaceId,
            @RequestParam(required = false) String itemType) {
        
        try {
            if (itemType != null && userId != null) {
                ItemType type = ItemType.valueOf(itemType.toUpperCase());
                trashService.emptyTrashByType(userId, type);
                return ResponseEntity.ok().body(itemType + " trash emptied successfully");
            }
            else if (userId != null) {
                trashService.emptyTrash(userId);
                return ResponseEntity.ok().body("User trash emptied successfully");
            } else if (workspaceId != null) {
                trashService.emptyTrashByWorkspace(workspaceId);
                return ResponseEntity.ok().body("Workspace trash emptied successfully");
            } else {
                return ResponseEntity.badRequest().body("userId or workspaceId is required");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
//thong ke thung rac
    @GetMapping("/stats")
    public ResponseEntity<?> getTrashStats(@RequestParam String userId) {
        try {
          
            TrashService.TrashStats stats = trashService.getTrashStats(userId);
            return ResponseEntity.ok().body(Map.of(
                "totalItems", stats.getTotalItems(),
                "folderCount", stats.getFolderCount(),
                "noteCount", stats.getNoteCount()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // AUTO CLEANUP (cho admin)
    @PostMapping("/cleanup")
    public ResponseEntity<?> cleanupExpiredItems(@RequestParam(defaultValue = "30") int daysToKeep) {
        try {
            trashService.cleanupExpiredItems(daysToKeep);
            return ResponseEntity.ok().body("Cleanup completed successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/cleanup-invalid")
    public ResponseEntity<?> cleanupInvalidTrashItems() {
        try {
            ((TrashServiceImpl) trashService).cleanupInvalidTrashItems();
            return ResponseEntity.ok().body("Invalid trash items cleanup completed");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/validate/{itemId}")
    public ResponseEntity<?> validateTrashItem(@PathVariable String itemId) {
        try {
            boolean isValid = ((TrashServiceImpl) trashService).validateTrashItem(itemId);
            return ResponseEntity.ok().body(Map.of("itemId", itemId, "isValid", isValid));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}