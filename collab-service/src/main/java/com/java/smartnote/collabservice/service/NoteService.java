package com.java.smartnote.collabservice.service;

import com.java.smartnote.collabservice.model.Note;
import com.java.smartnote.collabservice.repository.NoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class NoteService {
    
    @Autowired
    private NoteRepository noteRepository;
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Value("${note.service.url:http://localhost:8080}")
    private String noteServiceUrl;
    
    /**
     * Lấy tất cả notes đang được share
     */
    public List<Note> getSharedNotes() {
        return noteRepository.findAll().stream()
                .filter(note -> note.getShares() != null && !note.getShares().isEmpty())
                .filter(note -> !Boolean.TRUE.equals(note.getIsDeleted()))
                .collect(Collectors.toList());
    }
    
    /**
     * Share một note với danh sách users hoặc "all"
     */
    public Note shareNote(String noteId, List<String> userIds) {
        System.out.println("========================================");
        System.out.println("📤 SHARE NOTE PROCESS STARTED");
        System.out.println("========================================");
        System.out.println("Note ID: " + noteId);
        System.out.println("User IDs: " + userIds);
        System.out.println("User IDs size: " + (userIds != null ? userIds.size() : "null"));
        
        try {
            // Null check for userIds
            if (userIds == null) {
                throw new IllegalArgumentException("User IDs cannot be null");
            }
            
            if (userIds.isEmpty()) {
                throw new IllegalArgumentException("User IDs cannot be empty");
            }
            
            // Bước 1: Tìm note trong collab-service DB
            System.out.println("🔍 Finding note in collab-service DB...");
            Note note = noteRepository.findById(noteId).orElse(null);
            System.out.println("Note found: " + (note != null));
            
            if (note == null) {
                System.out.println("⚠️ Note not found in collab-service, attempting sync...");
                note = syncNoteFromNoteService(noteId);
                
                if (note == null) {
                    System.err.println("❌ Failed to sync note from note-service");
                    throw new RuntimeException("Note not found in note-service: " + noteId);
                }
            } else {
                System.out.println("✅ Note found in collab-service DB");
                System.out.println("Current shares: " + note.getShares());
            }
            
            // Bước 2: Cập nhật shares
            System.out.println("✅ Note found, updating shares...");
            System.out.println("New user IDs to add: " + userIds);
            
            // Convert String list to Object list safely
            List<Object> sharesAsObjects = userIds.stream()
                .map(id -> (Object) id)
                .collect(Collectors.toList());
            
            System.out.println("Converted shares: " + sharesAsObjects);
            
            note.setShares(sharesAsObjects);
            note.setUpdatedAt(LocalDateTime.now());
            
            // Bước 3: Lưu vào DB
            System.out.println("💾 Saving note to database...");
            Note savedNote = noteRepository.save(note);
            
            System.out.println("========================================");
            System.out.println("✅ SHARE SUCCESSFUL");
            System.out.println("Note Title: " + savedNote.getTitle());
            System.out.println("Shares count: " + (savedNote.getShares() != null ? savedNote.getShares().size() : 0));
            System.out.println("========================================");
            
            return savedNote;
            
        } catch (Exception e) {
            System.err.println("========================================");
            System.err.println("❌ SHARE FAILED");
            System.err.println("Error: " + e.getMessage());
            System.err.println("Error type: " + e.getClass().getSimpleName());
            e.printStackTrace();
            System.err.println("========================================");
            throw new RuntimeException("Failed to share note: " + e.getMessage(), e);
        }
    }

    /**
     * Unshare một note (xóa tất cả shares)
     */
    public Note unshareNote(String noteId) {
        System.out.println("========================================");
        System.out.println("🔓 UNSHARE NOTE PROCESS STARTED");
        System.out.println("========================================");
        System.out.println("Note ID: " + noteId);
        
        return noteRepository.findById(noteId).map(note -> {
            note.setShares(new ArrayList<>()); 
            note.setUpdatedAt(LocalDateTime.now());
            Note savedNote = noteRepository.save(note);
            
            System.out.println("✅ UNSHARE SUCCESSFUL");
            System.out.println("========================================");
            
            return savedNote;
        }).orElseThrow(() -> {
            System.err.println("❌ Note not found: " + noteId);
            System.err.println("========================================");
            return new RuntimeException("Note not found: " + noteId);
        });
    }
    
    /**
     * Lấy note theo ID, tự động sync nếu chưa có
     */
    public Note getNoteById(String noteId) {
        return noteRepository.findById(noteId)
                .orElseGet(() -> {
                    System.out.println("⚠️ Note not found in collab-service, syncing...");
                    return syncNoteFromNoteService(noteId);
                });
    }
    
    /**
     * FIX: Đồng bộ note từ note-service với error handling mạnh mẽ
     */
    private Note syncNoteFromNoteService(String noteId) {
        System.out.println("========================================");
        System.out.println("🔄 SYNCING NOTE FROM NOTE-SERVICE");
        System.out.println("========================================");
        
        try {
            String url = noteServiceUrl + "/api/notes/" + noteId;
            System.out.println("📡 Fetching from: " + url);
            
            // Thêm headers để tránh CORS issues
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            // Gọi API note-service
            ResponseEntity<Map> response = restTemplate.exchange(
                url, 
                HttpMethod.GET, 
                entity, 
                Map.class
            );
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> noteData = response.getBody();
                System.out.println("📦 Received data from note-service");
                System.out.println("Title: " + noteData.get("title"));
                
                // Chuyển đổi Map sang Note object
                Note note = mapToNote(noteData, noteId);
                
                // Lưu vào collab-service DB
                Note savedNote = noteRepository.save(note);
                
                System.out.println("✅ Note synced and saved successfully");
                System.out.println("========================================");
                
                return savedNote;
            }
            
        } catch (Exception e) {
            System.err.println("❌ Sync failed: " + e.getMessage());
            System.err.println("Error details: " + e.getClass().getName());
            e.printStackTrace();
        }
        
        System.err.println("========================================");
        System.err.println("⚠️ Could not sync from note-service");
        System.err.println("Possible causes:");
        System.err.println("1. Note-service is not running on " + noteServiceUrl);
        System.err.println("2. Note with ID " + noteId + " does not exist");
        System.err.println("3. Network/connectivity issues");
        System.err.println("========================================");
        
        return null;
    }
    
    /**
     * FIX: Chuyển đổi Map từ API sang Note object
     * Xử lý cả snake_case và camelCase field names
     */
    private Note mapToNote(Map<String, Object> data, String noteId) {
        Note note = new Note();
        
        note.setId(noteId);
        
        // Title
        note.setTitle(getStringValue(data, "title"));
        
        // Content
        note.setContent(getStringValue(data, "content"));
        
        // Content type
        String contentType = getStringValue(data, "contentType", "content_type");
        note.setContentType(contentType != null ? contentType : "markdown");
        
        // Created by
        note.setCreatedBy(getStringValue(data, "createdBy", "created_by"));
        
        // Timestamps
        note.setCreatedAt(parseDateTime(data, "createdAt", "created_at"));
        note.setUpdatedAt(parseDateTime(data, "updatedAt", "updated_at"));
        
        // Version
        Integer version = getIntegerValue(data, "version");
        note.setVersion(version != null ? version : 1);
        
        // Shares - khởi tạo empty list
        note.setShares(new ArrayList<>());
        
        // Tags
        List<String> tags = (List<String>) data.get("tags");
        note.setTags(tags != null ? tags : new ArrayList<>());
        
        // Boolean fields
        note.setIsImportant(getBooleanValue(data, "isImportant", "is_important"));
        note.setIsDeleted(getBooleanValue(data, "isDeleted", "is_deleted"));
        
        // Folder ID
        note.setFolderId(getStringValue(data, "folderId", "folder_id"));
        
        System.out.println("✅ Mapped note successfully");
        
        return note;
    }
    
    // Helper methods để xử lý field names
    
    private String getStringValue(Map<String, Object> data, String... keys) {
        for (String key : keys) {
            Object value = data.get(key);
            if (value != null) {
                return value.toString();
            }
        }
        return null;
    }
    
    private Integer getIntegerValue(Map<String, Object> data, String... keys) {
        for (String key : keys) {
            Object value = data.get(key);
            if (value instanceof Number) {
                return ((Number) value).intValue();
            }
        }
        return null;
    }
    
    private Boolean getBooleanValue(Map<String, Object> data, String... keys) {
        for (String key : keys) {
            Object value = data.get(key);
            if (value instanceof Boolean) {
                return (Boolean) value;
            }
        }
        return false;
    }
    
    private LocalDateTime parseDateTime(Map<String, Object> data, String... keys) {
        for (String key : keys) {
            Object value = data.get(key);
            if (value != null) {
                try {
                    // Xử lý nhiều format datetime
                    if (value instanceof String) {
                        return LocalDateTime.parse((String) value);
                    } else if (value instanceof List) {
                        // Format array: [2024, 1, 15, 10, 30, 0]
                        List<Integer> parts = (List<Integer>) value;
                        if (parts.size() >= 6) {
                            return LocalDateTime.of(
                                parts.get(0), parts.get(1), parts.get(2),
                                parts.get(3), parts.get(4), parts.get(5)
                            );
                        }
                    }
                } catch (Exception e) {
                    System.err.println("⚠️ Could not parse datetime: " + value);
                }
            }
        }
        return LocalDateTime.now();
    }
    
    /**
     * Cập nhật nội dung note (được gọi từ WebSocket)
     */
    public Note updateNoteContent(String noteId, String content) {
        return noteRepository.findById(noteId).map(note -> {
            note.setContent(content);
            note.setUpdatedAt(LocalDateTime.now());
            note.setVersion(note.getVersion() + 1);
            return noteRepository.save(note);
        }).orElseThrow(() -> new RuntimeException("Note not found: " + noteId));
    }
}