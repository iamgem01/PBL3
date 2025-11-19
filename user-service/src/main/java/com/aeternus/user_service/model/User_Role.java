package com.aeternus.user_service.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@Table(name  = "User_Role")
public class User_Role {
    @EmbeddedId
    @AttributeOverrides({
        @AttributeOverride(name = "user_id", column = @Column(name = "user_id", nullable = false)),
        @AttributeOverride(name = "role_id", column = @Column(name = "role_id", nullable = false))
    })
    private UserRoleKey userRole;

    //Relationship
    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "user_id") 
    private User user;

    @ManyToOne
    @MapsId("roleId")
    @JoinColumn(name = "role_id")
    private Role role;

}
