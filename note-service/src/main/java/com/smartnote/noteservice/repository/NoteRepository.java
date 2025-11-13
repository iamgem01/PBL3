package com.smartnote.noteservice.repository;

import com.smartnote.noteservice.model.Note;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NoteRepository extends MongoRepository<Note, String> {
    List<Note> findByFolderId(String folderId);
    
    List<Note> findByFolderIdAndIsDeletedFalse(String folderId);
    List<Note> findByCreatedByAndIsDeletedFalse(String userId);
    List<Note> findByIsDeletedFalse();
    List<Note> findByIsDeletedTrue();
    List<Note> findByIsDeletedTrueAndCreatedBy(String userId);
    Optional<Note> findByIdAndIsDeletedFalse(String id);

    @Query("{ 'folder_id': { $regex: ?0 } }")
    List<Note> findByTitleContainingIgnoreCase(String keyword);

    List<Note> findByCreatedBy(String userId);

    List<Note> findByTitleContainingIgnoreCaseAndCreatedBy(String keyword, String userId);
    List<Note> findByIsImportantTrueAndCreatedBy(String userId);
    List<Note> findByIsImportantAndCreatedBy(Boolean isImportant, String userId);
    
    List<Note> findByIsImportantTrueAndCreatedByAndIsDeletedFalse(String userId);
}