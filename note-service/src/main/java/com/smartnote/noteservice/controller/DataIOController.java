package com.smartnote.noteservice.controller;
import com.smartnote.noteservice.dto.NoteResponse;
import com.smartnote.noteservice.service.ExportService;
import com.smartnote.noteservice.service.ImportService;
import com.smartnote.noteservice.service.NoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/data") 
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"}) // Sửa dòng này
public class DataIOController {

    private final ImportService importService;
    private final ExportService exportService;
    private final NoteService noteService; 

    @PostMapping("/import")
    public ResponseEntity<NoteResponse> importNoteFromFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folderId", required = false) String folderId,
            @RequestHeader(value = "X-User-Id", defaultValue = "user_001") String userId) {
        
        try {
            NoteResponse importedNote = importService.importNote(file, userId, folderId);
            return ResponseEntity.status(HttpStatus.CREATED).body(importedNote);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/export/md/{id}")
    public ResponseEntity<Resource> exportNoteAsMarkdown(@PathVariable String id) {
        try {
            NoteResponse note = noteService.getNoteById(id);
            String content = note.getContent() != null ? note.getContent() : "";
            
            ByteArrayResource resource = new ByteArrayResource(content.getBytes(StandardCharsets.UTF_8));
            String filename = note.getTitle() + ".md";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.parseMediaType("text/markdown"))
                    .body(resource);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/export/pdf/{id}")
    public ResponseEntity<Resource> exportNoteAsPdf(@PathVariable String id) {
        try {
            NoteResponse note = noteService.getNoteById(id);
            byte[] pdfBytes = exportService.exportNoteToPdf(note);
            ByteArrayResource resource = new ByteArrayResource(pdfBytes);
            String filename = note.getTitle() + ".pdf"; 

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(resource);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}