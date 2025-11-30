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
        
        System.out.println("Received note edit for note: " + noteId);
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
        
        System.out.println("ðŸ‘¤ User joined note: " + noteId);
        System.out.println("User: " + userInfo);
        
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
    
    /**
     * Handle presence updates (online/offline status)
     */
    @MessageMapping("/ws/note.presence/{noteId}")
    @SendTo("/topic/note/{noteId}/presence")
    public Map<String, Object> handlePresenceUpdate(
            @DestinationVariable String noteId,
            @Payload Map<String, Object> presenceInfo) {
        
        System.out.println("ðŸ‘ï¸ Presence update for note: " + noteId);
        presenceInfo.put("timestamp", System.currentTimeMillis());
        
        return presenceInfo;
    }
    
    /**
     * Handle typing indicators
     */
    @MessageMapping("/ws/note.typing/{noteId}")
    @SendTo("/topic/note/{noteId}/typing")
    public Map<String, Object> handleTypingIndicator(
            @DestinationVariable String noteId,
            @Payload Map<String, Object> typingInfo) {
        
        // Don't log typing indicators to avoid spam
        typingInfo.put("timestamp", System.currentTimeMillis());
        
        return typingInfo;
    }
    
    /**
     * Handle user selection updates
     */
    @MessageMapping("/ws/note.selection/{noteId}")
    @SendTo("/topic/note/{noteId}/selection")
    public Map<String, Object> handleSelectionUpdate(
            @DestinationVariable String noteId,
            @Payload Map<String, Object> selectionInfo) {
        
        selectionInfo.put("timestamp", System.currentTimeMillis());
        
        return selectionInfo;
    }
}
