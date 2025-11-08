package com.example.collabservice.controller;

import com.example.collabservice.model.User;
import com.example.collabservice.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(@RequestHeader("X-User-Id") String userId) {
        return userService.getUser(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public ResponseEntity<List<User>> searchUsers(@RequestParam String query) {
        List<User> users = userService.searchUsers(query);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/basic-info")
    public ResponseEntity<List<User>> getUsersBasicInfo(@RequestParam List<String> userIds) {
        List<User> users = userService.getUsersBasicInfo(userIds);
        return ResponseEntity.ok(users);
    }
}