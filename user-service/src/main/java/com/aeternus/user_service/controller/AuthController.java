// AuthController.java
package com.aeternus.user_service.controller;

import com.aeternus.user_service.dto.UserProfileDto;
import com.aeternus.user_service.model.Device;
import com.aeternus.user_service.repository.DeviceRepository;
import com.aeternus.user_service.security.JwtTokenProvider;
import com.aeternus.user_service.service.UserService;
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
        String token = getTokenFromRequest(request);
        
        if (token != null) {
            // 2. Vô hiệu hoá token trong CSDL (bảng Device)
            userService.logoutFromDevice(token);
        }

        // 3. Xoá cookie khỏi client
        Cookie cookie = new Cookie(jwtCookieName, "");
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(10000); // Xoá ngay lập tức
        response.addCookie(cookie);
        
        return ResponseEntity.ok().build();
    }

    @GetMapping("/validate")
    public ResponseEntity<Void> validateToken(HttpServletRequest request) {
        String token = getTokenFromRequest(request);
        if(token == null) {
            return ResponseEntity.status(401).build();
        }
        Device device = deviceRepository.findBySessionToken(token)
                                        .orElse(null);
        
        // 1. Ưu tiên kiểm tra trong DB (để hỗ trợ logout/thu hồi token)
        if(device != null) {
            if(device.isActive()) {
                // Trả về UserId để Gateway biết
                return ResponseEntity.ok()
                        // .header("X-User-Id", device.getUser().getUserId().toString())
                        .build();
            } else {
                return ResponseEntity.status(401).build();
            }
        }

        // 2. Fallback: Nếu không thấy trong DB, kiểm tra chữ ký JWT hợp lệ là cho qua
        if (jwtTokenProvider.validateToken(token)) {
            String userId = jwtTokenProvider.getUserId(token);
            return ResponseEntity.ok()
                    // .header("X-User-Id", userId)
                    .build();
        }
        
        return ResponseEntity.status(401).build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileDto> getCurrentUser(Principal principal, HttpServletRequest request) {
        System.out.println("Receive request after logging");
        UUID userId = UUID.fromString(principal.getName());
        UserProfileDto userProfile = userService.getCurrentUserProfile(userId);
        String token = getTokenFromRequest(request);
        if(token != null) {
            System.out.println("token " + token);
        } else {
            System.out.println("token null");
        }
        userProfile.setAccessToken(token);
        return ResponseEntity.ok(userProfile);
    }

   

    // private String getTokenFromCookie(HttpServletRequest request) {
    //     if(request.getCookies() == null) {
    //         return null;
    //     }
    //     return Stream.of(request.getCookies())
    //                 .filter(cookie -> cookie.getName().equals(jwtCookieName))
    //                 .map(Cookie::getValue)
    //                 .findFirst()
    //                 .orElse(null);
    // }
    private String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if(bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        if(request.getCookies() != null) {
            return Stream.of(request.getCookies())
                        .filter(cookie -> cookie.getName().equals(jwtCookieName))
                        .map(Cookie::getValue)
                        .findFirst()
                        .orElse(null);
        }
        return null;
    }
}