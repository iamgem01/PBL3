// UserController.java
package com.aeternus.user_service.controller;

// Get the user's information, see devices,...
import com.aeternus.user_service.dto.DeviceDto;
import com.aeternus.user_service.dto.UserProfileDto;
import com.aeternus.user_service.security.JwtTokenProvider;
import com.aeternus.user_service.service.UserService;
import com.aeternus.user_service.service.UserServiceImpl;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;

import java.security.Principal;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value; 
import java.util.stream.Stream; 
import jakarta.servlet.http.Cookie; 


@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    //private final JwtTokenProvider jwtTokenProvider; // Để lấy
    
    // @Value("${app.jwt.cookie-name}")
    // private String jwtCookieName;

    // Helper để lấy UUID từ request
    // private UUID getUserIdFromRequest(HttpServletRequest request) {
    //     String token = Stream.of(request.getCookies())
    //             .filter(cookie -> cookie.getName().equals(jwtCookieName))
    //             .map(Cookie::getValue)
    //             .findFirst()
    //             .orElseThrow(() -> new IllegalArgumentException("No token found"));
    //     String userId = jwtTokenProvider.getUserId(token);
    //     return UUID.fromString(userId);
    // }

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
}