// UserRepository.java
package com.aeternus.user_service.repository;
import com.aeternus.user_service.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    // No need to create findByGoogleSubId method, as EmailRepository
}