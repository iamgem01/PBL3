// UserService.java (Interface)
package com.aeternus.user_service.service;

import com.aeternus.user_service.dto.DeviceDto;
import com.aeternus.user_service.dto.UserProfileDto;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

@Service
public interface UserService {
    UserProfileDto getCurrentUserProfile(UUID userId);
    List<DeviceDto> getActiveDevices(UUID userId);
    void logoutFromDevice(String jwtToken);
}