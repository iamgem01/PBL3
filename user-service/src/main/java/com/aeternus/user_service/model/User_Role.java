package com.aeternus.user_service.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

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
@Table(name = "User_Role")
@ToString(exclude = {"user", "role"})
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
    @JsonIgnore
    private User user;

    @ManyToOne
    @MapsId("roleId")
    @JoinColumn(name = "role_id")
    private Role role;

}
