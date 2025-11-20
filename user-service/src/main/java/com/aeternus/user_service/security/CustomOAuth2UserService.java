package com.aeternus.user_service.security; 

import com.aeternus.user_service.model.*;
import com.aeternus.user_service.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends OidcUserService { // SỬA: Kế thừa OidcUserService

    private static final Logger logger = LoggerFactory.getLogger(CustomOAuth2UserService.class);

    private final UserRepository userRepository;
    private final EmailRepository emailRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;

    @Override
    @Transactional
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        logger.info("Start login custom oauth (OIDC Flow)");

        // 1. Gọi lớp cha để lấy thông tin OidcUser chuẩn từ Google
        OidcUser oidcUser = super.loadUser(userRequest);
        Map<String, Object> attributes = oidcUser.getAttributes();
        
        // 2. Lấy thông tin định danh
        String googleSubId = (String) attributes.get("sub");
        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        
        // 3. Lấy Token từ OidcUserRequest (Dễ dàng hơn)
        String idToken = userRequest.getIdToken().getTokenValue();
        String accessToken = userRequest.getAccessToken().getTokenValue();
        
        // Kiểm tra xem User đã tồn tại chưa
        Optional<Email> emailOptional = emailRepository.findById(googleSubId);
        
        if (emailOptional.isEmpty()) {
            // --- TRƯỜNG HỢP USER MỚI ---
            logger.info("New user detected via Google OIDC: {}", email);

            // BƯỚC 1: Tạo và LƯU EMAIL TRƯỚC
            Email emailEntity = new Email();
            emailEntity.setGoogleSub(googleSubId);
            emailEntity.setEmail(email);
            emailEntity.setIdToken(idToken);
            emailEntity.setAccessToken(accessToken);
            emailEntity.setRefreshToken(null); // Google ít khi trả về refresh token ở luồng này
            
            //emailRepository.save(emailEntity); // Lưu ngay để có dữ liệu trong DB

            // BƯỚC 2: Tạo và LƯU USER SAU
            User user = new User();
            user.setUsername(name);
            user.setCreated_at(LocalDateTime.now());
            // Liên kết với Email đã lưu (Lưu ý: File User.java phải cho phép insert cột google_sub)
            user.setEmail(emailEntity); 
            
            User savedUser = userRepository.save(user); 
            
            // BƯỚC 3: Gán Role mặc định
            // Tìm Role USER (Phải đảm bảo đã chạy data.sql)
            Role defaultRole = roleRepository.findByRoleName("USER")
                    .orElseThrow(() -> new RuntimeException("Lỗi nghiêm trọng: Role 'USER' chưa được khởi tạo trong DB."));
            
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
            // --- TRƯỜNG HỢP USER CŨ ---
            logger.debug("Existing user login: {}", email);
            
            Email emailEntity = emailOptional.get();
            // Cập nhật token mới
            emailEntity.setIdToken(idToken);
            emailEntity.setAccessToken(accessToken);
            // Lưu ý: Không set refresh token thành null nếu nó không được trả về
            emailRepository.save(emailEntity); 
        }

        // Trả về OidcUser để Spring Security tiếp tục xử lý
        return oidcUser;
    }
}