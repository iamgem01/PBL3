package com.java.smartnote.collabservice;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CollabServiceApplication {
	
	public static void main(String[] args) {
		// Load biến môi trường từ file .env trước khi khởi động Spring Boot
		Dotenv dotenv = Dotenv.configure().load();
		dotenv.entries().forEach(entry -> {
			System.setProperty(entry.getKey(), entry.getValue());
		});
		
		SpringApplication.run(CollabServiceApplication.class, args);
	}
}
