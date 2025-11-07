package com.smartnote.userservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// Đảm bảo annotation này tồn tại
@SpringBootApplication
public class UserServiceApplication {

    public static void main(String[] args) {
        // Phương thức này là điểm khởi đầu của ứng dụng
        SpringApplication.run(UserServiceApplication.class, args);
    }
}