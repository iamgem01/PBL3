package com.java.smartnote.collabservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import com.java.smartnote.collabservice.websocket.YjsWebSocketHandler;

@Configuration
@EnableWebSocket
public class YjsWebSocketConfig implements WebSocketConfigurer {

    private final YjsWebSocketHandler yjsWebSocketHandler;

    public YjsWebSocketConfig(YjsWebSocketHandler yjsWebSocketHandler) {
        this.yjsWebSocketHandler = yjsWebSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        // Raw WebSocket endpoint cho Yjs - kết nối trực tiếp không qua STOMP
        registry.addHandler(yjsWebSocketHandler, "/yjs-ws")
                .setAllowedOrigins("http://localhost:3000", "http://127.0.0.1:3000");
        
        System.out.println("✅ Yjs Raw WebSocket endpoint registered: /yjs-ws");
        System.out.println("   - Supports direct WebSocket for Yjs collaboration protocol");
    }
}