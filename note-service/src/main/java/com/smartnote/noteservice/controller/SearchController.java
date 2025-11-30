package com.smartnote.noteservice.controller;

import com.smartnote.noteservice.dto.NoteResponse;
import com.smartnote.noteservice.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SearchController {
    
    private final SearchService searchService;
    // Get notes by folderId
    @GetMapping("/folder/{folderId}")
    public ResponseEntity<List<NoteResponse>> getNotesByFolder(@PathVariable String folderId) {
        try {
            List<NoteResponse> notes = searchService.getNotesByFolder(folderId);
            return ResponseEntity.ok(notes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    
}