// AuthController.java
package com.aeternus.user_service.controller;

import com.aeternus.user_service.dto.UserProfileDto;
import com.aeternus.user_service.model.Device;
import com.aeternus.user_service.security.JwtTokenProvider;
import com.aeternus.user_service.service.UserService;
import com.aeternus.user_service.repository.*;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.UUID;
import java.util.stream.Stream;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final DeviceRepository deviceRepository;
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${app.jwt.cookie-name}")
    private String jwtCookieName;

    // Logout
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        // 1. Tìm token trong cookie
        String token = getTokenFromCookie(request);
        
        if (token != null) {
            // 2. Vô hiệu hoá token trong CSDL (bảng Device)
            userService.logoutFromDevice(token);
        }

        // 3. Xoá cookie khỏi client
        Cookie cookie = new Cookie(jwtCookieName, "");
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(0); 
        cookie.setAttribute("SameSite", "Lax");
        response.addCookie(cookie);
        
        return ResponseEntity.ok().build();
    }

    private String getTokenFromCookie(HttpServletRequest request) {
        if(request.getCookies() == null) {
            return null;
        }
        return Stream.of(request.getCookies())
                    .filter(cookie -> cookie.getName().equals(jwtCookieName))
                    .map(Cookie::getValue)
                    .findFirst()
                    .orElse(null);
    }

    @GetMapping("/validate")
    public ResponseEntity<Void> validateToken(HttpServletRequest request) {
        System.out.println("DEBUG: Entering validateToken controller..."); // Log kiểm tra
        String token = getTokenFromCookie(request);
        if(token == null) {
            System.out.println("DEBUG: Session token is null (Client hasn't sent token)"); // Log kiểm tra

            return ResponseEntity.status(401).build();
        }
        Device device = deviceRepository.findBySessionToken(token)
                                        .orElse(null);
        
        // 1. Ưu tiên kiểm tra trong DB (để hỗ trợ logout/thu hồi token)
        if(device != null) {
            if(device.isActive()) {
                System.out.println("DEBUG: Device active and valid"); // Log kiểm tra
                // Trả về UserId để Gateway biết
                return ResponseEntity.ok()
                        .header("X-User-Id", device.getUser().getUserId().toString())
                        .build();
            } else {
                System.out.println("DEBUG: Device inactive"); // Log kiểm tra
                return ResponseEntity.status(401).build();
            }
        }

        // 2. Fallback: Nếu không thấy trong DB, kiểm tra chữ ký JWT hợp lệ là cho qua
        if (jwtTokenProvider.validateToken(token)) {
            System.out.println("DEBUG: Session token is valid"); // Log kiểm tra
            String userId = jwtTokenProvider.getUserId(token);
            return ResponseEntity.ok()
                    .header("X-User-Id", userId)
                    .build();
        }
        System.out.println("DEBUG: Session token is invalid"); // Log kiểm tra
        
        return ResponseEntity.status(401).build();
    }

    @GetMapping("/me")
    // public ResponseEntity<?> getCurrentUser(HttpServletRequest request) {
    //     String token = getTokenFromCookie(request);
    //     if (token == null || !jwtTokenProvider.validateToken(token)) {
    //         return ResponseEntity.status(401).build();
    //     }
    //     // Trả về userId để frontend sử dụng (bạn có thể mở rộng để gọi userService lấy full profile)
    //     return ResponseEntity.ok(java.util.Map.of("userId", jwtTokenProvider.getUserId(token)));
    // }
    public ResponseEntity<UserProfileDto> getCurrentUser(Principal principal) {
        UUID userId = UUID.fromString(principal.getName());
        UserProfileDto userProfile = userService.getCurrentUserProfile(userId);
        return ResponseEntity.ok(userProfile);
    }

    @PostMapping("/theme")
    public ResponseEntity<Void> updateTheme(@RequestParam String theme, Principal principal) {
        UUID userId = UUID.fromString(principal.getName());
        userService.updateTheme(userId, theme);
        return ResponseEntity.ok().build();
    }
}