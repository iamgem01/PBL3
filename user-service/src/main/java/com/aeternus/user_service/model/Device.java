package com.aeternus.user_service.model;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@Table(name = "Device")
public class Device {
    @Id 
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "devide_id")
    private UUID deviceId;
    
    @Column(name = "device_name", nullable = true, unique = false, length = 255)
    private String deviceName;
    
    @Column(name = "device_location", nullable = true, unique = false, length = 255)
    private String deviceLocation;
    
    @Column(name = "last_active_time", nullable = true, unique = false) 
    private LocalDateTime lastActiveTime;
    
    @Column(name = "session_token", nullable = false, unique = true, length = 255) 
    private String sessionToken;
    
    @Column(name = "is_active", nullable = false, unique = false) 
    private boolean isActive;

    //Relationship
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;
}

