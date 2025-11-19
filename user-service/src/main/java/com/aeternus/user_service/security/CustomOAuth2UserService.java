package com.aeternus.user_service.security; 

import com.aeternus.user_service.model.*;
import com.aeternus.user_service.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {
    private static final Logger logger = LoggerFactory.getLogger(CustomOAuth2UserService.class);

    private final UserRepository userRepository;
    private final EmailRepository emailRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        Map<String, Object> attributes = oAuth2User.getAttributes();
        
        // 1. Lấy thông tin từ Google
        String googleSubId = (String) attributes.get("sub");
        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        
        // Lấy token an toàn
        String idToken = (String) userRequest.getAdditionalParameters().get("id_token");
        String accessToken = userRequest.getAccessToken().getTokenValue();
        // Refresh token thường null nếu không request offline access
        String refreshToken = null; 

        Optional<Email> emailOptional = emailRepository.findById(googleSubId);
        
        if (emailOptional.isEmpty()) {
            // --- TRƯỜNG HỢP USER MỚI ---
            logger.info("New user detected via Google OAuth: {}", email);

            // BƯỚC 1: Tạo và LƯU EMAIL TRƯỚC
            // (Chúng ta lưu chủ động, không chờ User cascade)
            Email emailEntity = new Email();
            emailEntity.setGoogleSub(googleSubId);
            emailEntity.setEmail(email);
            emailEntity.setIdToken(idToken);
            emailEntity.setAccessToken(accessToken);
            if (refreshToken != null) {
                emailEntity.setRefreshToken(refreshToken);
            }
            // Lưu ngay lập tức để đảm bảo khóa chính tồn tại
            emailRepository.save(emailEntity);

            // BƯỚC 2: Tạo và LƯU USER SAU
            User user = new User();
            user.setUsername(name);
            user.setCreated_at(LocalDateTime.now());
            // Gán liên kết
            user.setEmail(emailEntity);
            
            // Lưu User. Lúc này Email đã có trong DB, Hibernate sẽ link FK chính xác
            User savedUser = userRepository.save(user); 
            
            // BƯỚC 3: Gán Role mặc định
            Role defaultRole = roleRepository.findByRoleName("USER")
                    .orElseThrow(() -> new RuntimeException("Lỗi: Role 'USER' chưa được khởi tạo (hãy chạy file data.sql)."));
            
            UserRoleKey userRoleKey = new UserRoleKey();
            userRoleKey.setUserId(savedUser.getUserId());
            userRoleKey.setRoleId(defaultRole.getRoleId());
            
            User_Role userRole = new User_Role();
            userRole.setUserRole(userRoleKey);
            userRole.setUser(savedUser);
            userRole.setRole(defaultRole);
            
            userRoleRepository.save(userRole);
            logger.info("Successfully created user {} with ROLE_USER", savedUser.getUserId());

        } else {
            // --- TRƯỜNG HỢP USER CŨ (LOGIN LẠI) ---
            logger.debug("Existing user detected: {}", email);
            
            Email emailEntity = emailOptional.get();
            // Cập nhật token mới nhất
            emailEntity.setIdToken(idToken);
            emailEntity.setAccessToken(accessToken);
            if (refreshToken != null) {
                emailEntity.setRefreshToken(refreshToken);
            }
            emailRepository.save(emailEntity); 
        }

        return oAuth2User;
    }
}