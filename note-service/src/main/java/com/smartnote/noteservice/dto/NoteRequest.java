package com.smartnote.noteservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NoteRequest {
    @JsonProperty("folderId")
    private String folderId;
    private String title;
    private String content;
    private String contentType;
    private List<String> tags;
    private Boolean isImportant;
}
