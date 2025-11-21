package com.aeternus.notification_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// @Data
// @NoArgsConstructor
// @AllArgsConstructor
public class NotificationRequest {
    private String userId;
    private String message;
    private String notificationType;
    private String recipientEmail;
    private String sourceService;

    public NotificationRequest() {}

    public NotificationRequest(String userId, String message, String notificationType, String recipientEmail, String sourceService) {
        this.userId = userId;
        this.message = message;
        this.notificationType = notificationType;
        this.recipientEmail = recipientEmail;
        this.sourceService = sourceService;
    }
    public String getUserId() { return this.userId; }
    public String getMessage() { return this.message; }
    public String getNotificationType() { return this.notificationType; }
    public String getRecipientEmail() { return this.recipientEmail; }
    public String getSourceService() { return this.sourceService; }
    public void setUserId(String userId) { this.userId = userId; }
    public void setMessage(String message) { this.message = message; }
    public void setNotificationType(String notificationType) { this.notificationType = notificationType; }
    public void setRecipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; }
    public void setSourceService(String sourceService) { this.sourceService = sourceService; }
    @Override 
    public String toString() {
        return "NotificationRequest{" + 
                "userId='" + userId + '\'' +
                ", message='" + message + '\'' +
                ", notificationType='" + notificationType + '\'' +
                ", recipientEmail='" + recipientEmail + '\'' +
                ", sourceService='" + sourceService + '\'' + '}';
    }
}
