// EmailRepository.java
package com.aeternus.user_service.repository;
import com.aeternus.user_service.model.Email;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmailRepository extends JpaRepository<Email, String> { // Key là String (googleSub)
}