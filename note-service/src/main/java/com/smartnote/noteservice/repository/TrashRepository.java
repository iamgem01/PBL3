package com.smartnote.noteservice.repository;

import com.smartnote.noteservice.model.TrashItem;
import com.smartnote.noteservice.model.ItemType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TrashRepository extends MongoRepository<TrashItem, String> {
   
    List<TrashItem> findByUserId(String userId);
    
    List<TrashItem> findByWorkspaceId(String workspaceId);
    
    List<TrashItem> findByItemTypeAndUserId(ItemType itemType, String userId);
    
    List<TrashItem> findByDeletedAtBefore(LocalDateTime cutoffDate);
    
    void deleteByUserId(String userId);
    
    void deleteByWorkspaceId(String workspaceId);
    
    void deleteByItemTypeAndUserId(ItemType itemType, String userId);

}