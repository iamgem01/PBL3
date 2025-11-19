package com.aeternus.note_service.controller;

import com.aeternus.note_service.model.Folder;
import com.aeternus.note_service.model.Note;
import com.aeternus.note_service.repository.FolderRepository;
import com.aeternus.note_service.repository.NoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;

import java.lang.management.OperatingSystemMXBean;
import java.security.Principal; 
import java.time.LocalDateTime;

@Controller
public class NoteSyncController {
    @Autowired
    private SimpMessageSendingOperations messagingTemplate;

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private FolderRepository folderRepository;

    
    @MessageMapping("/sync/note/update")
    public void handleNoteUpdate(@Payload Note updatedNote, Principal principal) {
    
        Note existingNote = noteRepository.findById(updatedNote.getId())
                .orElseThrow(() -> new RuntimeException("Note not found"));

        existingNote.setTitle(updatedNote.getTitle());
        existingNote.setContent(updatedNote.getContent());
        existingNote.setUpdatedAt(LocalDateTime.now());
        existingNote.setVersion(existingNote.getVersion() + 1);

        Note savedNote = noteRepository.save(existingNote);

        Folder folder = folderRepository.findById(savedNote.getFolderId())
                .orElseThrow(() -> new RuntimeException("Folder not found"));
        
        String workspaceId = folder.getWorkspaceId();

    
        String destination = "/topic/workspace/" + workspaceId;
        
        messagingTemplate.convertAndSend(destination, savedNote);
        
        OperatingSystemMXBean o;
    }

    @Mesa
}