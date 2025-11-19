package com.aeternus.user_service.security;

// Call the JwtTokenProvier to make a token
// Save the token to the database in table 'Device'
// Mark the device is_active:true
// Send the token to the client
// Redirect to the client
import com.aeternus.user_service.model.Device;
import com.aeternus.user_service.model.Email;
import com.aeternus.user_service.model.User; 
import com.aeternus.user_service.model.User_Role;
import com.aeternus.user_service.repository.DeviceRepository; 
import com.aeternus.user_service.repository.EmailRepository;
import com.aeternus.user_service.repository.UserRoleRepository;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;


@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    private static final Logger logger = LoggerFactory.getLogger(OAuth2LoginSuccessHandler.class);
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailRepository emailRepository;
    private final DeviceRepository deviceRepository;
    private final UserRoleRepository userRoleRepository;

    @Value("${app.oauth2.redirect-uri}")
    private String frontendRedirectUri;
    
    @Value("${app.jwt.cookie-name}")
    private String jwtCookieName;

    @Override
    // @Transactional
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, 
                                        Authentication authentication) throws IOException, ServletException {
        // Get the information of the user
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        Map<String, Object> attributes = oAuth2User.getAttributes();
        String googleSubId = (String) attributes.get("sub");

        Email email = emailRepository.findById(googleSubId)
                .orElseThrow(() -> new IllegalStateException("Email không tìm thấy sau khi login"));
        User user = email.getUser();
        if (user == null) {
             throw new IllegalStateException("User không tìm thấy sau khi login");
        }

        Set<User_Role> userRoles = userRoleRepository.findByUser(user);
        Set<String> roleNames = userRoles.stream()
                                     .map(userRole -> userRole.getRole().getRoleName())
                                     .collect(Collectors.toSet());
        
        // Create "Session Token" (JWT)
        String jwtToken = jwtTokenProvider.createToken(user.getUserId(), roleNames);

        Device device = new Device();
        device.setSessionToken(jwtToken);
        device.setUser(user);
        device.setActive(true); 
        device.setLastActiveTime(LocalDateTime.now());
        device.setDeviceName(request.getHeader("User-Agent"));
        deviceRepository.save(device);

        logger.info("Saved new device/session to the database for user {}", user.getUserId());

        // Send Cookie to client
        Cookie cookie = new Cookie(jwtCookieName, jwtToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        //cookie.setMaxAge(60 * 60 * 2); // Can comment this line to force user login from 
        
        response.addCookie(cookie);
        getRedirectStrategy().sendRedirect(request, response, frontendRedirectUri); // Change to api gateway url
    }
}