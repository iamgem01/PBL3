package com.aeternus.note_service.dto;

import com.aeternus.note_service.model.Note;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@ToString
@Setter
@EqualsAndHashCode
@Getter
@AllArgsConstructor
public class NoteSyncEvent {
    private String workspaceId;
    private Note note;
    private String eventType;
}
