// AuthController.java
package com.aeternus.user_service.controller;

import com.aeternus.user_service.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.stream.Stream;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

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
        Cookie cookie = new Cookie(jwtCookieName, null);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge(0); // Xoá ngay lập tức
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
}