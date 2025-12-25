// UserService.java (Interface)
package com.aeternus.user_service.service;

import com.aeternus.user_service.dto.DeviceDto;
import com.aeternus.user_service.dto.LoginSessionDto;
import com.aeternus.user_service.dto.UserProfileDto;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

@Service
public interface UserService {
    UserProfileDto getCurrentUserProfile(UUID userId);
    List<DeviceDto> getActiveDevices(UUID userId);
    void logoutFromDevice(String jwtToken);
    void setNotePassword(UUID userId, String password);
    void changeNotePassword(UUID userId, String currentPassword, String newPassword);
    void removeNotePassword(UUID userId, String currentPassword);   
    boolean hasNotePassword(UUID userId);
    boolean verifyNotePassword(UUID userId, String password);
    public void updateTheme(UUID userId, String theme);
    public List<LoginSessionDto> getLoginHistory(UUID userId);
}