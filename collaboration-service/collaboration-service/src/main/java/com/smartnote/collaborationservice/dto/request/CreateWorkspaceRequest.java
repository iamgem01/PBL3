package com.example.collabservice.dto.request;

import lombok.Data;

@Data
public class CreateWorkspaceRequest {
    private String name;
    private String description;
    private String scope; // "default", "private"
}