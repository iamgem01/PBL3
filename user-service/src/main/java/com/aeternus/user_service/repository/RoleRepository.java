// RoleRepository.java
package com.aeternus.user_service.repository;
import com.aeternus.user_service.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, String> { // Key là String (roleId)
    Optional<Role> findByRoleName(String roleName);
}