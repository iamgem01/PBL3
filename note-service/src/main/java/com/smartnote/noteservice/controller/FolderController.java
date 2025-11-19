package com.smartnote.noteservice.controller;

import com.smartnote.noteservice.model.Folder;
import com.smartnote.noteservice.service.FolderService;
import com.smartnote.noteservice.dto.FolderRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/folders")
public class FolderController {

    @Autowired
    private FolderService folderService;

    @PostMapping
    public ResponseEntity<?> createFolder(@RequestBody FolderRequest request) {
        try {
            Folder folder = folderService.createFolder(
                    request.getName(),
                    request.getUserId(),
                    request.getWorkspaceId(),
                    request.getParentFolderId()
            );
            return ResponseEntity.ok(folder);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public List<Folder> getAllFolders(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String workspaceId) {
        
        if (userId != null) {
            return folderService.getUserFolders(userId);
        } else if (workspaceId != null) {
            return folderService.getWorkspaceFolders(workspaceId);
        } else {
            return folderService.getAllFolders();
        }
    }

    @GetMapping("/user/{userId}")
    public List<Folder> getUserFolders(@PathVariable String userId) {
        return folderService.getUserFolders(userId);
    }

    @GetMapping("/workspace/{workspaceId}")
    public List<Folder> getWorkspaceFolders(@PathVariable String workspaceId) {
        return folderService.getWorkspaceFolders(workspaceId);
    }

    @GetMapping("/subfolders/{parentId}")
    public List<Folder> getSubFolders(@PathVariable String parentId) {
        return folderService.getSubFolders(parentId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getFolderById(@PathVariable String id) {
        Optional<Folder> folder = folderService.getFolderById(id);
        if (folder.isPresent()) {
            return ResponseEntity.ok(folder.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> renameFolder(@PathVariable String id, @RequestBody FolderRequest request) {
        try {
            Folder folder = folderService.renameFolder(id, request.getNewName());
            return ResponseEntity.ok(folder);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/move/{id}")
    public ResponseEntity<?> moveFolder(@PathVariable String id, @RequestBody FolderRequest request) {
        try {
            Folder folder = folderService.moveFolder(id, request.getNewParentId());
            return ResponseEntity.ok(folder);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/position")
    public ResponseEntity<?> updatePosition(@PathVariable String id, @RequestBody Map<String, Integer> request) {
        try {
            Integer position = request.get("position");
            if (position == null) {
                return ResponseEntity.badRequest().body("Position is required");
            }
            Folder folder = folderService.updatePosition(id, position);
            return ResponseEntity.ok(folder);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/reorder")
    public ResponseEntity<?> reorder(@RequestBody List<String> folderIdsInOrder) {
        try {
            folderService.reorderFolders(folderIdsInOrder);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // @DeleteMapping("/{id}")
    // public ResponseEntity<?> deleteFolder(@PathVariable String id) {
    //     try {
    //         folderService.deleteFolder(id);
    //         return ResponseEntity.ok().body("Folder deleted successfully");
    //     } catch (Exception e) {
    //         return ResponseEntity.badRequest().body(e.getMessage());
    //     }
    // }
}
