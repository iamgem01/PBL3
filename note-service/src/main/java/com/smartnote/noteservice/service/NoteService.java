package com.smartnote.noteservice.service;

import com.smartnote.noteservice.dto.NoteRequest;
import com.smartnote.noteservice.dto.NoteResponse;
import com.smartnote.noteservice.model.Note;
import com.smartnote.noteservice.model.NoteHistory;
import com.smartnote.noteservice.repository.NoteRepository;
import com.smartnote.noteservice.repository.NoteHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NoteService {

    private final NoteRepository noteRepository;
    private final NoteHistoryRepository noteHistoryRepository;

    public NoteResponse createNote(NoteRequest request, String userId) {
        Note note = new Note();
        note.setFolderId(request.getFolderId());
        note.setTitle(request.getTitle());
        note.setContent(request.getContent());
        note.setContentType(request.getContentType() != null ? request.getContentType() : "markdown");
        note.setCreatedBy(userId);
        note.setCreatedAt(LocalDateTime.now());
        note.setUpdatedAt(LocalDateTime.now());
        note.setVersion(1);
        note.setTags(request.getTags());
        note.setIsImportant(request.getIsImportant() != null ? request.getIsImportant() : false);
        note.setIsDeleted(false); 

        Note savedNote = noteRepository.save(note);
        return convertToResponse(savedNote);
    }

    public NoteResponse getNoteById(String id) {
        Note note = noteRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Note not found with id: " + id));
        return convertToResponse(note);
    }

    public NoteResponse updateNote(String id, NoteRequest request) {
        Note note = noteRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Note not found with id: " + id));
        
        if (note.getIsDeleted()) {
            throw new RuntimeException("Cannot update note in trash");
        }

        NoteHistory history = new NoteHistory(note);
        noteHistoryRepository.save(history);

        if (request.getTitle() != null)
            note.setTitle(request.getTitle());
        if (request.getContent() != null)
            note.setContent(request.getContent());
        if (request.getContentType() != null)
            note.setContentType(request.getContentType());
        if (request.getFolderId() != null)
            note.setFolderId(request.getFolderId());
        if (request.getTags() != null)
            note.setTags(request.getTags());

        if (request.getIsImportant() != null)
            note.setIsImportant(request.getIsImportant());

        note.setUpdatedAt(LocalDateTime.now());
        note.setVersion(note.getVersion() + 1);

        Note updatedNote = noteRepository.save(note);
        return convertToResponse(updatedNote);
    }

    public void deleteNote(String id) {
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Note not found with id: " + id));
        
        if (note.getIsDeleted()) {
            throw new RuntimeException("Note is already in trash");
        }
        
        note.setIsDeleted(true);
        note.setDeletedAt(LocalDateTime.now());
        noteRepository.save(note);
    }

    public List<NoteResponse> getAllNotes() {
    
        return noteRepository.findByIsDeletedFalse().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public void internalMoveToTrash(String noteId) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found with id: " + noteId));

        if (note.getIsDeleted()) {
            throw new RuntimeException("Note is already in trash");
        }

        note.setIsDeleted(true);
        note.setDeletedAt(LocalDateTime.now());
        noteRepository.save(note);
    }

    public void internalRestoreFromTrash(String noteId) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found with id: " + noteId));

        if (!note.getIsDeleted()) {
            throw new RuntimeException("Note is not in trash");
        }

        if (note.getFolderId() != null && !note.getFolderId().isEmpty()) {
            // Ở đây cần kiểm tra folder tồn tại và không bị xóa
            // Có thể cần inject FolderRepository để kiểm tra
        }

        note.setIsDeleted(false);
        note.setDeletedAt(null);
        noteRepository.save(note);
    }

    public void internalPermanentDelete(String noteId) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found with id: " + noteId));

        if (!note.getIsDeleted()) {
            throw new RuntimeException("Note is not in trash. Please move to trash first.");
        }

        noteRepository.delete(note);
    }

    public NoteResponse restoreNoteFromHistory(String noteId, String historyId) {
        NoteHistory historyVersion = noteHistoryRepository.findById(historyId)
                .orElseThrow(() -> new RuntimeException("History not found with id: " + historyId));

        Note currentNote = noteRepository.findByIdAndIsDeletedFalse(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found with id: " + noteId));

        if (!historyVersion.getOriginalNoteId().equals(currentNote.getId())) {
            throw new IllegalArgumentException("History version does not belong to the specified note.");
        }

        noteHistoryRepository.save(new NoteHistory(currentNote));

        currentNote.setTitle(historyVersion.getTitle());
        currentNote.setContent(historyVersion.getContent());
        currentNote.setContentType(historyVersion.getContentType());
        currentNote.setFolderId(historyVersion.getFolderId());
        currentNote.setTags(historyVersion.getTags());
        currentNote.setShares(historyVersion.getShares());
        currentNote.setMetadata(historyVersion.getMetadata());
        currentNote.setIsImportant(historyVersion.getIsImportant());
        
        currentNote.setVersion(currentNote.getVersion() + 1);
        currentNote.setUpdatedAt(LocalDateTime.now());

        Note restoredNote = noteRepository.save(currentNote);
        return convertToResponse(restoredNote);
    }

    public NoteResponse markAsImportant(String noteId, String userId) {
        Note note = noteRepository.findByIdAndIsDeletedFalse(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found with id: " + noteId));
        
        if (!note.getCreatedBy().equals(userId)) {
            throw new RuntimeException("Unauthorized to modify this note");
        }
        
        note.setIsImportant(true);
        note.setUpdatedAt(LocalDateTime.now());
        
        Note updatedNote = noteRepository.save(note);
        return convertToResponse(updatedNote);
    }

    public NoteResponse removeAsImportant(String noteId, String userId) {
        Note note = noteRepository.findByIdAndIsDeletedFalse(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found with id: " + noteId));
        
        if (!note.getCreatedBy().equals(userId)) {
            throw new RuntimeException("Unauthorized to modify this note");
        }
        
        note.setIsImportant(false);
        note.setUpdatedAt(LocalDateTime.now());
        
        Note updatedNote = noteRepository.save(note);
        return convertToResponse(updatedNote);
    }

    public List<NoteResponse> getImportantNotes(String userId) {
    
        return noteRepository.findByIsImportantTrueAndCreatedByAndIsDeletedFalse(userId).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<NoteHistory> getNoteHistory(String noteId) {
        return noteHistoryRepository.findByOriginalNoteId(noteId);
    }

    private NoteResponse convertToResponse(Note note) {
        NoteResponse response = new NoteResponse();
        response.setId(note.getId());
        response.setFolderId(note.getFolderId());
        response.setTitle(note.getTitle());
        response.setContent(note.getContent());
        response.setContentType(note.getContentType());
        response.setCreatedBy(note.getCreatedBy());
        response.setCreatedAt(note.getCreatedAt() != null ? note.getCreatedAt() : LocalDateTime.now());
        response.setUpdatedAt(note.getUpdatedAt() != null ? note.getUpdatedAt() : LocalDateTime.now());
        response.setVersion(note.getVersion());
        response.setTags(note.getTags());
        response.setIsImportant(note.getIsImportant());
        response.setIsDeleted(note.getIsDeleted()); 
        response.setDeletedAt(note.getDeletedAt()); 
        return response;
    }
}