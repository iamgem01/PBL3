// UserServiceImpl.java (Implementation)
package com.aeternus.user_service.service;

import com.aeternus.user_service.dto.DeviceDto;
import com.aeternus.user_service.dto.UserProfileDto;
import com.aeternus.user_service.exception.ResourceNotFoundException;
import com.aeternus.user_service.model.Device;
import com.aeternus.user_service.model.User;
import com.aeternus.user_service.repository.DeviceRepository;
import com.aeternus.user_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final DeviceRepository deviceRepository;

    @Override
    @Transactional(readOnly = true)
    public UserProfileDto getCurrentUserProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        return mapToUserProfileDto(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DeviceDto> getActiveDevices(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        List<Device> activeDevices = deviceRepository.findByUserAndIsActive(user, true);
        
        return activeDevices.stream()
                .map(this::mapToDeviceDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void logoutFromDevice(String jwtToken) {
        Device device = deviceRepository.findBySessionToken(jwtToken)
                .orElseThrow(() -> new ResourceNotFoundException("Device session not found"));
        
        device.setActive(false);
        deviceRepository.save(device);
    }
    

    private UserProfileDto mapToUserProfileDto(User user) {
        UserProfileDto dto = new UserProfileDto();
        dto.setUserId(user.getUserId());
        dto.setUsername(user.getUsername());
        dto.setCreatedAt(user.getCreated_at());
        
        if (user.getEmail() != null) {
            dto.setEmail(user.getEmail().getEmail());
        }

        // Sử dụng query custom để lấy chỉ roleName, không load toàn bộ User_Role
        Set<String> roles = user.getUserRoles().stream()
            .map(userRole -> userRole.getRole().getRoleName())
            .collect(Collectors.toSet());
        dto.setRoles(roles);

        return dto;
    }
    
    private DeviceDto mapToDeviceDto(Device device) {
        DeviceDto dto = new DeviceDto();
        dto.setDeviceId(device.getDeviceId());
        dto.setDeviceName(device.getDeviceName());
        dto.setDeviceLocation(device.getDeviceLocation());
        dto.setLastActiveTime(device.getLastActiveTime());
        return dto;
    }
}