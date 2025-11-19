package com.aeternus.user_service.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aeternus.user_service.repository.UserRepository;

@RestController
@RequestMapping("/api/test")
public class TestController {
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping("/database")
    public String test() {
        return "Connect to database successfully. Have " + userRepository.count() + "user.";
    }
}
