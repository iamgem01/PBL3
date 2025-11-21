package com.aeternus.notification_service.kafka;

import javax.management.Notification;
import com.aeternus.notification_service.dto.NotificationRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.aeternus.notification_service.services.EmailService;
import com.aeternus.notification_service.services.NotificationService;

@Component
public class KafkaNotificationConsumer {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    private final NotificationService notificationService;

    public KafkaNotificationConsumer(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @KafkaListener(topics = "notification-topic", groupId = "notification_service_group")
    public void listen(NotificationRequest notificationRequest) {
        String result = notificationService.handleNotification(notificationRequest);
        logger.info("Process announcement: {}", result);
    }
}
