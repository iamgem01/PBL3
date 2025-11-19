package com.aeternus.user_service.security;
 import com.aeternus.user_service.model.Device;
// Read jwt from the cookie to authenticate client's all request 
 // Check the database about is_Active and saved jwt
 // If valid, then SecurityContextHolder
import com.aeternus.user_service.repository.DeviceRepository; 
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private final JwtTokenProvider jwtTokenProvider;
    private final DeviceRepository deviceRepository; // Thêm Repo
    
    @Value("${app.jwt.cookie-name}")
    private String jwtCookieName;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                    FilterChain filterChain) throws ServletException, IOException {
        
        String token = getTokenFromCookie(request);

        if (token != null && jwtTokenProvider.validateToken(token)) {
            if(jwtTokenProvider.validateToken(token)) {
                Optional<Device> deviceOpt = deviceRepository.findBySessionTokenAndIsActive(token, true);

                if(deviceOpt.isPresent()) {
                    logger.debug("Valid JWT and active device session found.");

                    Claims claims = jwtTokenProvider.getClaims(token);
                    String userId = claims.getSubject(); // Get UUID of user

                    // Lấy roles từ claims (đã lưu ở dạng List/Set)
                    List<String> roles = claims.get("roles", List.class);
                    List<SimpleGrantedAuthority> authorities = roles.stream()
                                                                    .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                                                                    .collect(Collectors.toList());

                    Authentication auth = new UsernamePasswordAuthenticationToken(
                        userId, 
                        null,   
                        authorities // RBAC
                    );

                    SecurityContextHolder.getContext().setAuthentication(auth);
                    
                } else {
                    logger.warn("JWT was valid, but no active device session found (user logged out?).");
                }
            } else {
                logger.warn("Invalid JWT token received.");
            }
        } else {
            logger.debug("No JWT cookie found, proceeding as anonymous");
        }
        // Transfer request to the second filter
        filterChain.doFilter(request, response);
    }
    
    // private boolean isTokenActiveInDatabase(String token) {
    //     return deviceRepository.findBySessionTokenAndIsActive(token, true).isPresent();
    // }

    private String getTokenFromCookie(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return null;
        }
        return Stream.of(request.getCookies())
                .filter(cookie -> cookie.getName().equals(jwtCookieName))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }
}