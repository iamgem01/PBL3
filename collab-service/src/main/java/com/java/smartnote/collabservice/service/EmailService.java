package com.java.smartnote.collabservice.service;

import com.java.smartnote.collabservice.model.Invitation;
import com.java.smartnote.collabservice.model.Note;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    
    private final JavaMailSender mailSender;
    private final NoteService noteService;
    private final String frontendUrl;
    private final String fromEmail;
    private final String gmailAppPassword; // Thêm field này
    
    // Chỉ dùng constructor injection, không dùng field injection
    public EmailService(JavaMailSender mailSender, NoteService noteService,
                       @Value("${app.frontend.url:http://localhost:3000}") String frontendUrl,
                       @Value("${spring.mail.username}") String fromEmail,
                       @Value("${GMAIL_APP_PASSWORD:}") String gmailAppPassword) { // Thêm parameter này
        this.mailSender = mailSender;
        this.noteService = noteService;
        this.frontendUrl = frontendUrl;
        this.fromEmail = fromEmail;
        this.gmailAppPassword = gmailAppPassword; // Gán giá trị
        
        // Check configuration
        checkEmailConfiguration();
    }
    
    private void checkEmailConfiguration() {
        System.out.println("🔧 EMAIL SERVICE CONFIGURATION CHECK:");
        System.out.println("🔧 Frontend URL: " + frontendUrl);
        System.out.println("🔧 From Email: " + fromEmail);
        
        // Sử dụng field gmailAppPassword thay vì System.getenv()
        boolean passwordSet = gmailAppPassword != null && !gmailAppPassword.trim().isEmpty();
        
        System.out.println("🔧 Gmail App Password Set: " + passwordSet);
        if (passwordSet) {
            System.out.println("🔧 Password Length: " + gmailAppPassword.length() + " characters");
        } else {
            System.err.println("❌ GMAIL_APP_PASSWORD environment variable is NOT set!");
            System.err.println("❌ Please set GMAIL_APP_PASSWORD in your environment or .env file");
        }
        
        System.out.println("🔧 ==========================================");
    }
    
    /**
     * Gửi email mời collaboration
     */
    public void sendInvitationEmail(Invitation invitation) {
        System.out.println("📧 STARTING EMAIL SEND PROCESS");
        System.out.println("📧 To: " + invitation.getInviteeEmail());
        System.out.println("📧 From: " + fromEmail);
        System.out.println("📧 Frontend URL: " + frontendUrl);
        
        try {
            // Kiểm tra note
            Note note = noteService.getNoteById(invitation.getNoteId());
            String noteTitle = note != null ? note.getTitle() : "Untitled Document";
            System.out.println("📧 Note title: " + noteTitle);
            
            String invitationLink = frontendUrl + "/invitation/accept?token=" + invitation.getToken();
            System.out.println("📧 Invitation link: " + invitationLink);
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(invitation.getInviteeEmail());
            message.setSubject("You're invited to collaborate on \"" + noteTitle + "\"");
            message.setText(
                "Hello,\n\n" +
                invitation.getInviterEmail() + " has invited you to collaborate on the document \"" + noteTitle + "\".\n\n" +
                "Click the link below to accept the invitation:\n" +
                invitationLink + "\n\n" +
                "This invitation will expire in 7 days.\n\n" +
                "Best regards,\n" +
                "Aeternus Team"
            );
            
            System.out.println("📧 Attempting to send email via SMTP...");
            mailSender.send(message);
            
            System.out.println("✅ EMAIL SENT SUCCESSFULLY to: " + invitation.getInviteeEmail());
            
        } catch (Exception e) {
            System.err.println("❌ EMAIL SEND FAILED:");
            System.err.println("❌ Recipient: " + invitation.getInviteeEmail());
            System.err.println("❌ Error type: " + e.getClass().getSimpleName());
            System.err.println("❌ Error message: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to send invitation email: " + e.getMessage(), e);
        }
    }
}