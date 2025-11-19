package com.aeternus.user_service.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer{
    @Value("${app.oauth2.redirect-uri}") // Get the url of frontend
    private String frontendUrl;

    @Override 
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**") // Effect with the url starts with /api...
                .allowedOrigins(frontendUrl)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*") // Accept any header
                .allowCredentials(true); // Allow client send request along with credentials - cookie 
    }

}
