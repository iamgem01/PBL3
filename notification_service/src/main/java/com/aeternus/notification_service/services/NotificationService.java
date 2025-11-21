package com.aeternus.notification_service.services;

import org.springframework.stereotype.Service;

import com.aeternus.notification_service.dto.NotificationRequest;

@Service
public class NotificationService {
    private final EmailService emailService;
    
    public NotificationService(EmailService emailService) {
        this.emailService = emailService;
    }

    public String handleNotification(NotificationRequest request) {
        System.out.println("----- Annoucement -----");
        System.out.println("From service: " + request.getSourceService());
        System.out.println("User ID: " + request.getUserId());
        System.out.println("Recipient Email: " + request.getRecipientEmail());
        System.out.println("Body: " + request.getMessage());
        System.out.println("Notification Type: " + request.getNotificationType());
        System.out.println("-------------------------------------");

        String responseMessage = "";
        switch (request.getNotificationType().toUpperCase()) {
            case "ADMIN":
            case "WORKSPACE_TEAM":
                if(request.getRecipientEmail() != null && !request.getRecipientEmail().isEmpty()) {
                    String subject = "[Announcement] " + request.getSourceService() + " - " + request.getNotificationType();
                    emailService.sendEmail(request.getRecipientEmail(), subject, request.getMessage());
                } else {
                    responseMessage = "Can not send email: recipientEmail is empty!";
                }
                break;
            case "REMINDER":
            case "WORKSPACE_ACTIVITY":
                responseMessage = "Announcement has been created in the application.";
                break;    
            default:
                responseMessage = "Invalid announcement.";
                break;
        }
        return responseMessage;
    }
}