// UserRoleRepository.java
package com.aeternus.user_service.repository;
import com.aeternus.user_service.model.User;
import com.aeternus.user_service.model.UserRoleKey;
import com.aeternus.user_service.model.User_Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRoleRepository extends JpaRepository<User_Role, UserRoleKey> {
    List<User_Role> findByUser(User user);
    
}