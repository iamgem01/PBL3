package com.java.smartnote.collabservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    /**
     * Đăng ký WebSocket endpoint cho STOMP
     * Frontend sẽ kết nối tới: ws://localhost:8083/ws-collab
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws-collab")
                .setAllowedOrigins("http://localhost:3000", "http://127.0.0.1:3000")
                .withSockJS();  // Fallback cho browsers không support WebSocket (previous version browsers)
        
        System.out.println("✅ STOMP WebSocket endpoint registered: /ws-collab");
    }

    /**
     * Cấu hình message broker
     * - /app: Prefix cho messages từ Client → Server
     * - /topic: Prefix cho messages từ Server → Client (broadcast)
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Client gửi message tới: /app/ws/note.edit/{noteId}
        registry.setApplicationDestinationPrefixes("/app");

        // Server broadcast message tới: /topic/note/{noteId}
        // Message sent to the destination starts with '/app' will be directed to methods @MessageMapping in the Controller
        registry.enableSimpleBroker("/topic");
        
        System.out.println("✅ Message broker configured:");
        System.out.println("   - Client sends to: /app/ws/*");
        System.out.println("   - Server broadcasts to: /topic/note/*");
    }
}