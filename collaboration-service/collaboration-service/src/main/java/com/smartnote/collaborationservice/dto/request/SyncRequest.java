package com.example.collabservice.dto.request;

import com.example.collabservice.model.DocumentChange;
import lombok.Data;

import java.util.List;

@Data
public class SyncRequest {
    private String documentId;
    private String clientId;
    private Long clientVersion;
    private List<DocumentChange.Change> changes;
    private Long parentVersion;
}