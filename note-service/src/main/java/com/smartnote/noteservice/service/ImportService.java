package com.smartnote.noteservice.service;

import com.smartnote.noteservice.dto.NoteRequest;
import com.smartnote.noteservice.dto.NoteResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * Dịch vụ này xử lý logic nhập (import) dữ liệu từ các file bên ngoài.
 */
@Service
@RequiredArgsConstructor
public class ImportService {
    private final NoteService noteService;

    /**
     * Nhập một ghi chú từ một file (ví dụ: .md, .txt).
     * @param file File được tải lên.
     * @param userId ID của người dùng thực hiện việc nhập.
     * @param folderId (Tùy chọn) ID của thư mục để lưu ghi chú.
     * @return Ghi chú đã được tạo.
     * @throws IOException Nếu có lỗi khi đọc file.
     * @throws IllegalArgumentException Nếu file rỗng.
     */
    public NoteResponse importNote(MultipartFile file, String userId, String folderId) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty. Please select a file to upload.");
        }
        String content = new String(file.getBytes(), StandardCharsets.UTF_8);

        String title = file.getOriginalFilename();
        if (title != null) {
            title = title.replaceAll("\\.md$", "").replaceAll("\\.txt$", "");
        } else {
            title = "Imported Note - " + System.currentTimeMillis();
        }

        NoteRequest request = new NoteRequest();
        request.setTitle(title);
        request.setContent(content);
        request.setFolderId(folderId);
        request.setContentType("markdown"); 
        request.setTags(List.of("imported")); 
        return noteService.createNote(request, userId);
    }
}