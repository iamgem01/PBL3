package com.smartnote.noteservice.service;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import com.smartnote.noteservice.dto.NoteResponse;
import org.commonmark.node.Node;
import org.commonmark.parser.Parser;
import org.commonmark.renderer.html.HtmlRenderer;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;


@Service
public class ExportService {

    /**
     * Chuyển đổi một NoteResponse thành một mảng byte PDF.
     * @param note Ghi chú cần chuyển đổi.
     * @return Mảng byte chứa dữ liệu PDF.
     * @throws IOException Nếu có lỗi trong quá trình tạo PDF.
     */
    public byte[] exportNoteToPdf(NoteResponse note) throws IOException {
        String markdown = note.getContent();
        if (markdown == null || markdown.isBlank()) {
            markdown = "[Nội dung trống]";
        }

        Parser parser = Parser.builder().build();
        Node document = parser.parse(markdown);
        HtmlRenderer renderer = HtmlRenderer.builder().build();
        String html = renderer.render(document);

        String finalHtml = "<html><head><style>" +
                "body { font-family: sans-serif; }" +
                "h1, h2, h3 { color: #333; }" +
                "pre { background-color: #f4f4f4; border: 1px solid #ddd; padding: 10px; border-radius: 5px; }" +
                "code { font-family: monospace; }" +
                "</style></head><body>" +
                "<h1>" + note.getTitle() + "</h1>" + 
                html +
                "</body></html>";
        try (ByteArrayOutputStream os = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.withHtmlContent(finalHtml, null); 
            builder.toStream(os);
            builder.run();
            return os.toByteArray();
        }
    }
}