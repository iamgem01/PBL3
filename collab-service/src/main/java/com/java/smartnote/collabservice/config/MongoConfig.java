package com.smartnote.noteservice.config;

import com.mongodb.client.MongoClient;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@Configuration
@EnableMongoRepositories(basePackages = "com.smartnote.collabservice.repository")
@EnableMongoAuditing
public class MongoConfig {

    @Bean
    CommandLineRunner checkMongoConnection(MongoTemplate mongoTemplate, MongoClient mongoClient) {
        return args -> {
            try {
                mongoClient.listDatabaseNames().first();
                System.out.println("I can do it");
                System.out.println("MongoDB Connection Successfully!");
                System.out.println("Database: " + mongoTemplate.getDb().getName());
                System.out.println("Collections: " + mongoTemplate.getCollectionNames());
            } catch (Exception e) {
                System.err.println("MongoDB Connection Failed: " + e.getMessage());
            }
        };
    }
    
}