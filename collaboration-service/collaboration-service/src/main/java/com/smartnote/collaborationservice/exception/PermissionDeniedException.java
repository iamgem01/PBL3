package com.example.collabservice.exception;

public class PermissionDeniedException extends RuntimeException {
    public PermissionDeniedException(String message) {
        super(message);
    }

    public PermissionDeniedException(String resource, String action) {
        super(String.format("Permission denied for %s: %s", action, resource));
    }
}