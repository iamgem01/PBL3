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
        // ✅ FIX: Thêm Vite port (5173) và các variants
        registry.addHandler(yjsWebSocketHandler, "/yjs-ws")
                .setAllowedOrigins(
                    "http://localhost:3000",      // React CRA default
                    "http://127.0.0.1:3000",
                    "http://localhost:5173",      // ✅ Vite default port
                    "http://127.0.0.1:5173",      // ✅ Vite localhost variant
                    "http://localhost:5174",      // Vite alternate
                    "*"                           // ✅ Allow all (development only)
                );
        
        System.out.println("✅ Yjs Raw WebSocket endpoint registered: /yjs-ws");
        System.out.println("   - Allowed origins: localhost:3000, localhost:5173, and all origins");
        System.out.println("   - Supports direct WebSocket for Yjs collaboration protocol");
    }
}