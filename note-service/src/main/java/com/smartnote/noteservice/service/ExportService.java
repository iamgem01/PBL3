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

    public byte[] exportNoteToPdf(NoteResponse note) throws IOException {
        String markdown = note.getContent();
        if (markdown == null || markdown.isBlank()) {
            markdown = "[Nội dung trống]";
        }

        Parser parser = Parser.builder().build();
        Node document = parser.parse(markdown);
        HtmlRenderer renderer = HtmlRenderer.builder().build();
        String html = renderer.render(document);

        // Thêm meta charset và CSS tốt hơn
        String finalHtml = "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<meta charset=\"UTF-8\"/>" +
                "<style>" +
                "@page { size: A4; margin: 2cm; }" +
                "body { " +
                "  font-family: 'DejaVu Sans', Arial, sans-serif; " +
                "  font-size: 12pt; " +
                "  line-height: 1.6; " +
                "  color: #333; " +
                "}" +
                "h1 { " +
                "  font-size: 24pt; " +
                "  color: #2c3e50; " +
                "  margin-bottom: 20px; " +
                "  border-bottom: 2px solid #3498db; " +
                "  padding-bottom: 10px; " +
                "}" +
                "h2 { font-size: 18pt; color: #34495e; margin-top: 20px; }" +
                "h3 { font-size: 14pt; color: #34495e; margin-top: 15px; }" +
                "p { margin: 10px 0; }" +
                "pre { " +
                "  background-color: #f5f5f5; " +
                "  border: 1px solid #ddd; " +
                "  padding: 15px; " +
                "  border-radius: 5px; " +
                "  overflow-x: auto; " +
                "}" +
                "code { " +
                "  font-family: 'Courier New', monospace; " +
                "  font-size: 10pt; " +
                "}" +
                "ul, ol { margin: 10px 0; padding-left: 30px; }" +
                "li { margin: 5px 0; }" +
                "blockquote { " +
                "  border-left: 4px solid #3498db; " +
                "  margin: 15px 0; " +
                "  padding-left: 15px; " +
                "  color: #555; " +
                "  font-style: italic; " +
                "}" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<h1>" + escapeHtml(note.getTitle()) + "</h1>" + 
                html +
                "</body></html>";

        try (ByteArrayOutputStream os = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.withHtmlContent(finalHtml, null);
            builder.toStream(os);
            builder.run();
            return os.toByteArray();
        } catch (Exception e) {
            // Log chi tiết lỗi
            System.err.println("Error generating PDF: " + e.getMessage());
            e.printStackTrace();
            throw new IOException("Failed to generate PDF: " + e.getMessage(), e);
        }
    }
    
    // Helper method để escape HTML
    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;")
                   .replace("\"", "&quot;")
                   .replace("'", "&#39;");
    }
}