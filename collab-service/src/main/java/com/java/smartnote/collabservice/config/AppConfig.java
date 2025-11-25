package com.java.smartnote.collabservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import org.springframework.boot.web.client.RestTemplateBuilder;
import java.time.Duration;

@Configuration
public class AppConfig {
    
    /**
     * RestTemplate bean để gọi API từ note-service
     * Cấu hình timeout để tránh treo
     */
    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
                .setConnectTimeout(Duration.ofSeconds(10))  // Timeout kết nối: 10s
                .setReadTimeout(Duration.ofSeconds(30))     // Timeout đọc data: 30s
                .build();
    }
}