package com.aeternus.notification_service.service; // SỬA PACKAGE

import com.aeternus.notification_service.dto.UserRegisteredEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class NotificationConsumer {
    private static final Logger logger = LoggerFactory.getLogger(NotificationConsumer.class);

    @Autowired
    private EmailService emailService;

    @KafkaListener(topics = "user", groupId = "notification-group")
    public void consumeUserRegisteredEvent(UserRegisteredEvent event) {
        logger.info("Received event from Kafka - User: {}, Email: {}", event.getName(), event.getEmail());
        emailService.sendWelcomeEmail(event.getEmail(), event.getName());
    }
}