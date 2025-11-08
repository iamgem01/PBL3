package com.smartnote.collaborationservice.dto.response;

import lombok.Data;
import java.util.List;

@Data
public class SyncResponse {
    private String documentId;
    private Long currentVersion;
    private List<OperationDto> serverOperations;
    private Boolean hasConflict;
    private ConflictResolution conflictResolution;

    public SyncResponse() {}
}