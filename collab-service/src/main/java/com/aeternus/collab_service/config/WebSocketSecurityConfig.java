package com.aeternus.collab_service.config;

// (Bạn cần tạo class JwtUtil này)
import com.aeternus.collab_service.security.JwtUtil; 
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import java.util.ArrayList;

/**
 * Bảo vệ WebSocket endpoint, yêu cầu một JWT hợp lệ từ user-service
 */
@Configuration
@Order(Ordered.HIGHEST_PRECEDENCE + 99) // Chạy trước các interceptor bảo mật khác
public class WebSocketSecurityConfig implements WebSocketMessageBrokerConfigurer {

    @Autowired
    private JwtUtil jwtUtil; // (Class này phải có secret key giống user-service)

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor =
                        MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

                // 1. Chỉ kiểm tra khi client gửi lệnh CONNECT
                if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                    
                    // 2. Lấy token từ header "Authorization"
                    String authHeader = accessor.getFirstNativeHeader("Authorization");
                    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                        throw new RuntimeException("Missing or invalid Authorization header");
                    }
                    
                    String jwt = authHeader.substring(7);

                    // 3. Xác thực JWT
                    if (jwtUtil.validateToken(jwt)) {
                        String userId = jwtUtil.extractUserId(jwt);
                        
                        // 4. Đặt thông tin xác thực vào Security Context
                        // Principal (principal.getName()) trong Controller sẽ lấy từ đây
                        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                                userId, null, new ArrayList<>());
                        SecurityContextHolder.getContext().setAuthentication(auth);
                        accessor.setUser(auth);
                    } else {
                         throw new RuntimeException("Invalid JWT Token");
                    }
                }
                return message;
            }
        });
    }
}