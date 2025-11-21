package com.java.smartnote.collabservice.controller;

import com.java.smartnote.collabservice.dto.NoteUpdateMessage;
import com.java.smartnote.collabservice.dto.CursorUpdateMessage;
import com.java.smartnote.collabservice.dto.UserJoinMessage;
import com.java.smartnote.collabservice.service.NoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Set;
import java.util.HashSet;

@Controller
public class CollabController {

    @Autowired
    private NoteService noteService;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    // Track active users per note: noteId -> Set of userIds
    private Map<String, Set<String>> activeUsers = new ConcurrentHashMap<>();
    
    // Track user colors: userId -> color
    private Map<String, String> userColors = new ConcurrentHashMap<>();
    
    // Available colors for cursors
    private String[] CURSOR_COLORS = {
        "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", 
        "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9"
    };

    /**
     * User joins a note session
     */
    @MessageMapping("/note.join/{noteId}")
    @SendTo("/topic/note/{noteId}/users")
    public UserJoinMessage userJoined(@DestinationVariable String noteId,
                                      @Payload UserJoinMessage message) {
        System.out.println("========================================");
        System.out.println("👤 USER JOINED");
        System.out.println("========================================");
        System.out.println("Note ID: " + noteId);
        System.out.println("User ID: " + message.getUserId());
        System.out.println("Email: " + message.getEmail());
        
        // Add user to active users
        activeUsers.computeIfAbsent(noteId, k -> new HashSet<>()).add(message.getUserId());
        
        // Assign color if not exists
        if (!userColors.containsKey(message.getUserId())) {
            int colorIndex = userColors.size() % CURSOR_COLORS.length;
            userColors.put(message.getUserId(), CURSOR_COLORS[colorIndex]);
        }
        
        message.setColor(userColors.get(message.getUserId()));
        message.setType("JOIN");
        
        System.out.println("Color assigned: " + message.getColor());
        System.out.println("Active users: " + activeUsers.get(noteId).size());
        System.out.println("========================================");
        
        return message;
    }
    
    /**
     * User leaves a note session
     */
    @MessageMapping("/note.leave/{noteId}")
    @SendTo("/topic/note/{noteId}/users")
    public UserJoinMessage userLeft(@DestinationVariable String noteId,
                                    @Payload UserJoinMessage message) {
        System.out.println("👋 User left: " + message.getUserId() + " from note " + noteId);
        
        Set<String> users = activeUsers.get(noteId);
        if (users != null) {
            users.remove(message.getUserId());
            if (users.isEmpty()) {
                activeUsers.remove(noteId);
            }
        }
        
        message.setType("LEAVE");
        return message;
    }

    /**
     * Xử lý realtime collaboration - Content changes
     */
    @MessageMapping("/note.edit/{noteId}")
    @SendTo("/topic/note/{noteId}")
    public NoteUpdateMessage broadcastNoteUpdate(@DestinationVariable String noteId, 
                                                 @Payload NoteUpdateMessage message) {
        
        System.out.println("========================================");
        System.out.println("📝 REALTIME UPDATE RECEIVED");
        System.out.println("========================================");
        System.out.println("Note ID: " + noteId);
        System.out.println("Sender ID: " + message.getSenderId());
        System.out.println("Sender Email: " + message.getSenderEmail());
        System.out.println("Type: " + message.getType());
        System.out.println("Content length: " + (message.getContent() != null ? message.getContent().length() : 0));
        
        try {
            // Lưu vào database
            if ("EDIT".equals(message.getType())) {
                noteService.updateNoteContent(noteId, message.getContent());
                System.out.println("✅ Content saved to database");
            }
        } catch (Exception e) {
            System.err.println("❌ Error saving note: " + e.getMessage());
            e.printStackTrace();
        }
        
        System.out.println("📡 Broadcasting to all subscribers...");
        System.out.println("========================================");
        
        return message;
    }
    
    /**
     * Xử lý cursor position updates
     * Giống Google Docs - mỗi user có cursor riêng với màu khác nhau
     */
    @MessageMapping("/note.cursor/{noteId}")
    @SendTo("/topic/note/{noteId}/cursor")
    public CursorUpdateMessage broadcastCursorUpdate(@DestinationVariable String noteId,
                                                     @Payload CursorUpdateMessage message) {
        // Add color to cursor message
        String color = userColors.get(message.getUserId());
        if (color != null) {
            message.setColor(color);
        }
        
        return message;
    }
    
    /**
     * Get active users for a note
     */
    @MessageMapping("/note.users/{noteId}")
    public void requestActiveUsers(@DestinationVariable String noteId) {
        Set<String> users = activeUsers.getOrDefault(noteId, new HashSet<>());
        
        Map<String, Object> response = new ConcurrentHashMap<>();
        response.put("noteId", noteId);
        response.put("activeUsers", users);
        response.put("count", users.size());
        
        messagingTemplate.convertAndSend("/topic/note/" + noteId + "/users", response);
    }
}