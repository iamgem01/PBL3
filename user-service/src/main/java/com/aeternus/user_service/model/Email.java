package com.aeternus.user_service.model;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "Email")
@ToString(exclude = "user")
public class Email {
    @Id
    @Column(name = "google_sub", nullable = false, unique = true, length = 255)
    private String googleSub; // Unique identifier for each email

    @Column(name = "email", nullable = false, unique = true, length = 255) 
    private String email; 

    @Column(name = "id_token", columnDefinition = "TEXT")
    private String idToken;

    @Column(name = "access_token", columnDefinition = "TEXT")
    private String accessToken;

    @Column(name = "refresh_token", columnDefinition = "TEXT") 
    private String refreshToken;

    //Relationship 
    @OneToOne(mappedBy = "email", fetch = FetchType.LAZY)
    @JsonBackReference
    private User user; 
   
}
