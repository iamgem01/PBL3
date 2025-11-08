package com.example.collabservice.service;

import com.example.collabservice.model.User;
import com.example.collabservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public Optional<User> getUser(String userId) {
        return userRepository.findById(userId);
    }

    public String getUserEmail(String userId) {
        return userRepository.findById(userId)
                .map(User::getEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<User> searchUsers(String query) {
        return userRepository.findByEmailPattern(query);
    }

    public List<User> getUsersBasicInfo(List<String> userIds) {
        return userRepository.findUsersByIds(userIds);
    }

    public void updateUserLastActive(String userId) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setLastActive(java.time.LocalDateTime.now());
            userRepository.save(user);
        });
    }
}