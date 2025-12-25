// UserController.java
package com.aeternus.user_service.controller;

// Get the user's information, see devices,...
import com.aeternus.user_service.dto.*;
import com.aeternus.user_service.service.UserService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.http.HttpStatus;

import java.security.Principal;
import java.util.List;
import java.util.UUID;


@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserProfileDto> getCurrentUser(Principal principal) {
        UUID userId = UUID.fromString(principal.getName());
        UserProfileDto userProfile = userService.getCurrentUserProfile(userId);
        System.out.println("Send request after logging");
        return ResponseEntity.ok(userProfile);
    }

    @GetMapping("/devices")
    public ResponseEntity<List<DeviceDto>> getActiveDevices(Principal principal) {
        UUID userId = UUID.fromString(principal.getName());
        List<DeviceDto> devices = userService.getActiveDevices(userId);
        return ResponseEntity.ok(devices);
    }

    @GetMapping("/login-history")
    public ResponseEntity<List<LoginSessionDto>> getLoginHistory(Principal principal) {
        UUID userId = UUID.fromString(principal.getName());
        return ResponseEntity.ok(userService.getLoginHistory(userId));
    }

    @GetMapping("/note-password/status")
    public ResponseEntity<Boolean> hasNotePassword(Principal principal) {
        UUID userId = UUID.fromString(principal.getName());
        boolean hasPassword = userService.hasNotePassword(userId);
        return ResponseEntity.ok(hasPassword);
    }

    @PostMapping("/note-password/set")
    public ResponseEntity<Void> setNotePassword(@RequestBody NotePasswordRequest request, Principal principal) {
        UUID userId = UUID.fromString(principal.getName());
        userService.setNotePassword(userId, request.getPassword());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/note-password/change")
    public ResponseEntity<Void> changeNotePassword(@RequestBody NotePasswordRequest request, Principal principal) {
        UUID userId = UUID.fromString(principal.getName());
        userService.changeNotePassword(userId, request.getCurrentPassword(), request.getPassword());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/note-password/remove")
    public ResponseEntity<Void> removeNotePassword(@RequestBody NotePasswordRequest request, Principal principal) {
        UUID userId = UUID.fromString(principal.getName());
        userService.removeNotePassword(userId, request.getCurrentPassword());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/note-password/verify")
    public ResponseEntity<Boolean> verifyNotePassword(@RequestBody NotePasswordVerifyRequest request, Principal principal) {
        UUID userId = UUID.fromString(principal.getName());
        boolean isValid = userService.verifyNotePassword(userId, request.getPassword());
        if(isValid) {
            return ResponseEntity.ok(true);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(false);
        }
    }
    
}