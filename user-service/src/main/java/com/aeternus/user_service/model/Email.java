package com.aeternus.user_service.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@Table(name = "Email")
public class Email {
    @Id
    @Column(name = "google_sub", nullable = false, unique = true, length = 255)
    private String googleSub; // Unique identifier for each email

    @Column(name = "email", nullable = false, unique = true, length = 255) 
    private String email; 

    @Column(name = "id_token", nullable = true, unique = true, length = 255)
    private String idToken;

    @Column(name = "access_token", nullable = true, unique = true, length = 255)
    private String accessToken;

    @Column(name = "refresh_token", nullable = true, unique = true, length = 255) 
    private String refreshToken;

    //Relationship 
    @OneToOne(mappedBy = "email", fetch = FetchType.LAZY)
    private User user; 
   
}
