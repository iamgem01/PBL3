// UserRepository.java
package com.aeternus.user_service.repository;
import com.aeternus.user_service.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.aeternus.user_service.model.User;

import java.util.UUID;
import java.util.Optional;
import java.util.Set;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    // No need to create findByGoogleSubId method, as EmailRepository
    Optional<User> findById(UUID userId);
}