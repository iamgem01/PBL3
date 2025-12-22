package com.java.smartnote.collabservice.controller;

import com.java.smartnote.collabservice.model.Note;
import com.java.smartnote.collabservice.service.NoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.java.smartnote.collabservice.dto.ShareNoteRequest;

@RestController
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true", allowedHeaders = "*", methods = {
        RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS })
public class NoteController {

    @Autowired
    private NoteService noteService;

    /**
     * HEALTH CHECK
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "Collab Service");
        health.put("port", 8083);
        health.put("timestamp", System.currentTimeMillis());

        System.out.println("✅ Health check successful");
        return ResponseEntity.ok(health);
    }

    /**
     * Lấy danh sách tất cả notes đang được share
     */
    @GetMapping("/api/notes/shared")
    public ResponseEntity<?> getSharedNotes(@RequestHeader(value = "X-User-Id", required = false) String userId) {
        System.out.println("🌐 [CONTROLLER] ===== RECEIVED REQUEST FOR SHARED NOTES =====");
        System.out.println("🌐 [CONTROLLER] UserId from header: " + userId);
        System.out.println("🌐 [CONTROLLER] UserId is null: " + (userId == null));
        System.out.println("🌐 [CONTROLLER] UserId length: " + (userId != null ? userId.length() : 0));

        try {
            System.out.println("📋 Fetching shared notes for user: " + (userId != null ? userId : "all users"));
            List<Note> sharedNotes = noteService.getSharedNotesForUser(userId);
            System.out.println("✅ Found " + sharedNotes.size() + " shared notes for user: " + userId);
            System.out.println("🌐 [CONTROLLER] ===== REQUEST COMPLETED =====");
            return ResponseEntity.ok(sharedNotes);
        } catch (Exception e) {
            System.err.println("❌ Error fetching shared notes: " + e.getMessage());
            e.printStackTrace();

            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to fetch shared notes");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Share một note với danh sách users hoặc "all"
     */
    @PostMapping("/api/notes/{noteId}/share")
    public ResponseEntity<?> shareNote(@PathVariable String noteId,
            @RequestBody ShareNoteRequest request) {
        System.out.println("========================================");
        System.out.println("📨 SHARE REQUEST RECEIVED");
        System.out.println("========================================");
        System.out.println("Note ID: " + noteId);
        System.out.println("Request: " + request);

        try {
            // Validation 1: Check noteId
            if (noteId == null || noteId.trim().isEmpty()) {
                System.err.println("❌ Invalid noteId");
                Map<String, String> error = new HashMap<>();
                error.put("error", "Invalid note ID");
                error.put("details", "Note ID cannot be empty");
                return ResponseEntity.badRequest().body(error);
            }

            // Validation 2: Check userIds
            List<String> userIds = request.getUserIds();
            if (userIds == null || userIds.isEmpty()) {
                System.err.println("❌ Invalid userIds");
                Map<String, String> error = new HashMap<>();
                error.put("error", "Invalid request");
                error.put("details", "userIds cannot be empty");
                return ResponseEntity.badRequest().body(error);
            }

            System.out.println("User IDs: " + userIds);
            System.out.println("User IDs count: " + userIds.size());

            // FIX: REMOVED AUTO "all_users" LOGIC
            // Notes should ONLY be shared with explicitly invited users
            // Enabling collaboration != sharing with everyone

            // Thực hiện share
            System.out.println("🚀 Calling noteService.shareNote...");
            Note sharedNote = noteService.shareNote(noteId, userIds);
            System.out.println("✅ Service call completed");

            if (sharedNote == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Share failed");
                error.put("details", "Note could not be shared");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
            }

            System.out.println("========================================");
            System.out.println("✅ SHARE API SUCCESSFUL");
            System.out.println("========================================");

            return ResponseEntity.ok(sharedNote);

        } catch (IllegalArgumentException e) {
            System.err.println("❌ Validation error: " + e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Validation failed");
            error.put("details", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            System.err.println("========================================");
            System.err.println("❌ SHARE API FAILED");
            System.err.println("Error: " + e.getMessage());
            System.err.println("Error type: " + e.getClass().getSimpleName());
            e.printStackTrace();
            System.err.println("========================================");

            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error");
            error.put("details", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Unshare một note
     */
    @PostMapping("/api/notes/{noteId}/unshare")
    public ResponseEntity<?> unshareNote(@PathVariable String noteId) {
        System.out.println("========================================");
        System.out.println("🔓 UNSHARE REQUEST RECEIVED");
        System.out.println("========================================");
        System.out.println("Note ID: " + noteId);

        try {
            Note unsharedNote = noteService.unshareNote(noteId);

            System.out.println("✅ UNSHARE SUCCESSFUL");
            System.out.println("========================================");

            return ResponseEntity.ok(unsharedNote);

        } catch (RuntimeException e) {
            System.err.println("❌ UNSHARE FAILED: " + e.getMessage());
            e.printStackTrace();
            System.err.println("========================================");

            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to unshare note");
            error.put("message", e.getMessage());
            error.put("noteId", noteId);

            // Not found vs other errors
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Lấy chi tiết một note theo ID
     */
    @GetMapping("/api/notes/{noteId}")
    public ResponseEntity<?> getNote(@PathVariable String noteId) {
        try {
            System.out.println("📖 Fetching note: " + noteId);
            Note note = noteService.getNoteById(noteId);

            if (note == null) {
                System.err.println("❌ Note not found: " + noteId);
                Map<String, String> error = new HashMap<>();
                error.put("error", "Note not found");
                error.put("noteId", noteId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            System.out.println("✅ Note retrieved: " + note.getTitle());
            return ResponseEntity.ok(note);

        } catch (Exception e) {
            System.err.println("❌ Error fetching note: " + e.getMessage());

            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to fetch note");
            error.put("message", e.getMessage());
            error.put("noteId", noteId);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * 🔥 UPDATE NOTE CONTENT - Endpoint cho shared notes
     * Frontend sẽ gọi endpoint này thay vì Note Service khi note đã shared
     */
    @PutMapping("/api/notes/{noteId}")
    public ResponseEntity<?> updateNote(
            @PathVariable String noteId,
            @RequestBody Map<String, Object> updates) {
        try {
            System.out.println("========================================");
            System.out.println("📝 UPDATE NOTE REQUEST (Collab Service)");
            System.out.println("========================================");
            System.out.println("Note ID: " + noteId);
            System.out.println("Updates: " + updates);

            Note note = noteService.getNoteById(noteId);
            if (note == null) {
                System.err.println("❌ Note not found: " + noteId);
                Map<String, String> error = new HashMap<>();
                error.put("error", "Note not found");
                error.put("noteId", noteId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            // Update content if provided
            if (updates.containsKey("content")) {
                String newContent = (String) updates.get("content");
                noteService.updateNoteContent(noteId, newContent);
                System.out.println("✅ Content updated: " + newContent.length() + " chars");
            }

            // Get updated note
            Note updatedNote = noteService.getNoteById(noteId);
            
            System.out.println("✅ UPDATE SUCCESSFUL");
            System.out.println("========================================");

            return ResponseEntity.ok(updatedNote);

        } catch (Exception e) {
            System.err.println("❌ UPDATE FAILED: " + e.getMessage());
            e.printStackTrace();
            System.err.println("========================================");

            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to update note");
            error.put("message", e.getMessage());
            error.put("noteId", noteId);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}