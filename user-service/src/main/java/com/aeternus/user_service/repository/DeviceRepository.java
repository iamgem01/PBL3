// DeviceRepository.java
package com.aeternus.user_service.repository;
import com.aeternus.user_service.model.Device;
import com.aeternus.user_service.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;
import java.util.UUID;

@Repository
public interface DeviceRepository extends JpaRepository<Device, UUID> {
    Optional<Device> findBySessionTokenAndIsActive(String sessionToken, boolean isActive);
    Optional<Device> findBySessionToken(String sessionToken);
    List<Device> findByUserAndIsActive(User user, boolean isActive);
}