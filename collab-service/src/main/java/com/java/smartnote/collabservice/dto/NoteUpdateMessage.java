package com.java.smartnote.collabservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class NoteUpdateMessage {
    private String noteId;      // ID của ghi chú đang sửa
    private String content;     // Nội dung mới (hoặc đoạn thay đổi)
    private String senderId;    // ID của người đang gõ (để FE phía kia biết ai đang gõ)
    private String type;        
}