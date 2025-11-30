package com.smartnote.noteservice.controller;

import com.smartnote.noteservice.dto.NoteRequest;
import com.smartnote.noteservice.dto.NoteResponse;
import com.smartnote.noteservice.model.NoteHistory;
import com.smartnote.noteservice.service.NoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
public class NoteController {

    private final NoteService noteService;

    @PostMapping
    public ResponseEntity<NoteResponse> createNote(
            @RequestBody NoteRequest request,
            @RequestHeader(value = "X-User-Id", defaultValue = "user_001") String userId) {
        try {
            System.out.println("Received create note request: " + request);
            NoteResponse response = noteService.createNote(request, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            System.out.println("Error in controller: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<NoteResponse> getNoteById(@PathVariable String id) {
        try {
            NoteResponse response = noteService.getNoteById(id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {                                                                                                                          
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<NoteResponse> updateNote(
            @PathVariable String id,
            @RequestBody NoteRequest request) {
        try {
            NoteResponse response = noteService.updateNote(id, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNote(@PathVariable String id) {
        try {
            noteService.deleteNote(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping // Get all user's notes
    public ResponseEntity<List<NoteResponse>> getAllNotes(
            @RequestHeader(value = "X-User-Id", defaultValue = "user_001") String userId) {
        System.out.println("🌐 [CONTROLLER] Received request for user: " + userId);
        List<NoteResponse> notes = noteService.getAllNotesByUser(userId);
        System.out.println("📤 [CONTROLLER] Returning " + notes.size() + " notes for user: " + userId);
        return ResponseEntity.ok(notes);
    }
    
    

    @PostMapping("/{id}/restore/{historyId}")
    public ResponseEntity<NoteResponse> restoreNote(
            @PathVariable String id,
            @PathVariable String historyId) {
        try {
            NoteResponse restoredNote = noteService.restoreNoteFromHistory(id, historyId);
            return ResponseEntity.ok(restoredNote);
        } catch (RuntimeException e) {
           
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/{id}/history") // Get history of note
    public ResponseEntity<List<NoteHistory>> getNoteHistory(@PathVariable String id) {
        try {
            List<NoteHistory> history = noteService.getNoteHistory(id);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    // Mark the note important
     @PostMapping("/{id}/important")
    public ResponseEntity<NoteResponse> markAsImportant(
            @PathVariable String id,
            @RequestHeader(value = "X-User-Id", defaultValue = "user_001") String userId) {
        try {
            NoteResponse response = noteService.markAsImportant(id, userId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    // Unmark the note important
    @DeleteMapping("/{id}/important")
    public ResponseEntity<NoteResponse> removeAsImportant(
            @PathVariable String id,
            @RequestHeader(value = "X-User-Id", defaultValue = "user_001") String userId) {
        try {
            NoteResponse response = noteService.removeAsImportant(id, userId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    // Get the all important notes
    @GetMapping("/important")
    public ResponseEntity<List<NoteResponse>> getImportantNotes(
            @RequestHeader(value = "X-User-Id", defaultValue = "user_001") String userId) {
        try {
            List<NoteResponse> importantNotes = noteService.getImportantNotes(userId);
            return ResponseEntity.ok(importantNotes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}