package com.java.smartnote.collabservice.controller;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.HashMap;
import java.util.Map;

@Controller
public class WebSocketController {
    
    private final SimpMessagingTemplate messagingTemplate;
    
    public WebSocketController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }
    
    /**
     * Handle note content updates
     */
    @MessageMapping("/ws/note.edit/{noteId}")
    @SendTo("/topic/note/{noteId}")
    public Map<String, Object> handleNoteEdit(
            @DestinationVariable String noteId,
            @Payload Map<String, Object> message,
            SimpMessageHeaderAccessor headerAccessor) {
        
        System.out.println("📨 Received note edit for note: " + noteId);
        System.out.println("Message: " + message);
        
        // Add server timestamp
        message.put("serverTimestamp", System.currentTimeMillis());
        
        return message;
    }
    
    /**
     * Handle user join events
     */
    @MessageMapping("/ws/note.join/{noteId}")
    @SendTo("/topic/note/{noteId}/users")
    public Map<String, Object> handleUserJoin(
            @DestinationVariable String noteId,
            @Payload Map<String, Object> userInfo) {
        
        System.out.println("👤 User joined note: " + noteId);
        System.out.println("User: " + userInfo);
        
        // Assign a random color if not provided
        if (!userInfo.containsKey("color")) {
            String[] colors = {"#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8"};
            userInfo.put("color", colors[(int)(Math.random() * colors.length)]);
        }
        
        userInfo.put("action", "join");
        userInfo.put("timestamp", System.currentTimeMillis());
        
        return userInfo;
    }
    
    /**
     * Handle user leave events
     */
    @MessageMapping("/ws/note.leave/{noteId}")
    @SendTo("/topic/note/{noteId}/users")
    public Map<String, Object> handleUserLeave(
            @DestinationVariable String noteId,
            @Payload Map<String, Object> userInfo) {
        
        System.out.println("👋 User left note: " + noteId);
        System.out.println("User: " + userInfo);
        
        userInfo.put("action", "leave");
        userInfo.put("timestamp", System.currentTimeMillis());
        
        return userInfo;
    }
    
    /**
     * Handle cursor position updates
     */
    @MessageMapping("/ws/note.cursor/{noteId}")
    @SendTo("/topic/note/{noteId}/cursor")
    public Map<String, Object> handleCursorUpdate(
            @DestinationVariable String noteId,
            @Payload Map<String, Object> cursorInfo) {
        
        // Only broadcast cursor updates, don't log them to avoid spam
        cursorInfo.put("timestamp", System.currentTimeMillis());
        
        return cursorInfo;
    }
}
