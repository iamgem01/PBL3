package com.smartnote.noteservice.repository;

import com.smartnote.noteservice.model.NoteHistory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoteHistoryRepository extends MongoRepository<NoteHistory, String> {
    List<NoteHistory> findByOriginalNoteId(String noteId);
    List<NoteHistory> findByOriginalNoteIdIn(List<String> noteIds);
}