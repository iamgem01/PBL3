package com.java.smartnote.collabservice.controller;

import com.java.smartnote.collabservice.dto.NoteUpdateMessage;
import com.java.smartnote.collabservice.service.NoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class CollabController {

    @Autowired
    private NoteService noteService;

    /**
     * Xử lý realtime collaboration
     * 
     * Luồng hoạt động:
     * 1. User A gõ text → Frontend gửi message đến: /app/note.edit/{noteId}
     * 2. Method này nhận message và xử lý
     * 3. @SendTo tự động broadcast message đến: /topic/note/{noteId}
     * 4. Tất cả users đang subscribe /topic/note/{noteId} sẽ nhận được update
     * 
     * @param noteId - ID của note đang được edit
     * @param message - Nội dung thay đổi (content, senderId, type)
     * @return Message được broadcast cho tất cả clients
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
        System.out.println("Type: " + message.getType());
        System.out.println("Content length: " + (message.getContent() != null ? message.getContent().length() : 0));
        
        try {
            // Lưu vào database nếu là EDIT (không lưu CURSOR movements)
            if ("EDIT".equals(message.getType())) {
                noteService.updateNoteContent(noteId, message.getContent());
                System.out.println("✅ Content saved to database");
            } else {
                System.out.println("ℹ️ Cursor update (not saved to DB)");
            }
        } catch (Exception e) {
            System.err.println("❌ Error saving note: " + e.getMessage());
            e.printStackTrace();
        }
        
        System.out.println("📡 Broadcasting to all subscribers...");
        System.out.println("========================================");
        
        // Broadcast message cho tất cả clients (trừ sender)
        return message;
    }
    
    /**
     * Xử lý cursor position updates (optional)
     * Cho phép users thấy vị trí cursor của nhau
     */
    @MessageMapping("/note.cursor/{noteId}")
    @SendTo("/topic/note/{noteId}/cursor")
    public NoteUpdateMessage broadcastCursorUpdate(@DestinationVariable String noteId,
                                                   @Payload NoteUpdateMessage message) {
        System.out.println("👆 Cursor update from " + message.getSenderId() + " in note " + noteId);
        return message;
    }
}