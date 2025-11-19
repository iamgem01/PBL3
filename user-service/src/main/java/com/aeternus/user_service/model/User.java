package com.aeternus.user_service.model;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@Table(name = "User")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "username", nullable = true, unique = false, length = 255)
    private String username;

    @Column(name = "password", nullable = true, unique = false, length = 255)
    private String password;

    @Column(name = "created_at", nullable = true, unique = false)
    private LocalDateTime created_at;

    // Relationships
    @OneToOne(cascade = CascadeType.ALL)
    // Hiệu chỉnh: Bỏ insertable=false, updatable=false
    // Cột này trong bảng User sẽ lưu khoá ngoại (google_sub)
    @JoinColumn(name = "google_sub", referencedColumnName = "google_sub") 
    private Email email;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Device> devices;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<User_Role> userRoles;
}