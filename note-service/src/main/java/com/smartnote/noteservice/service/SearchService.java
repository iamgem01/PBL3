package com.smartnote.noteservice.service;

import com.smartnote.noteservice.dto.NoteResponse;
import com.smartnote.noteservice.model.Note;
import com.smartnote.noteservice.repository.NoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final NoteRepository noteRepository;

    public List<NoteResponse> getNotesByFolder(String folderId) {
        List<Note> notes = noteRepository.findByFolderId(folderId);
        return notes.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }


    private NoteResponse convertToResponse(Note note) {
        NoteResponse response = new NoteResponse();
        response.setId(note.getId());
        response.setFolderId(note.getFolderId());
        response.setTitle(note.getTitle());
        response.setContent(note.getContent());
        response.setContentType(note.getContentType());
        response.setCreatedBy(note.getCreatedBy());
        response.setCreatedAt(note.getCreatedAt());
        response.setUpdatedAt(note.getUpdatedAt());
        response.setVersion(note.getVersion());
        response.setTags(note.getTags());
        return response;
    }
}