// UserServiceImpl.java (Implementation)
package com.aeternus.user_service.service;

import com.aeternus.user_service.dto.DeviceDto;
import com.aeternus.user_service.dto.UserProfileDto;
import com.aeternus.user_service.exception.ResourceNotFoundException;
import com.aeternus.user_service.model.Device;
import com.aeternus.user_service.model.Email;
import com.aeternus.user_service.model.User;
import com.aeternus.user_service.repository.DeviceRepository;
import com.aeternus.user_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder; // Cần thêm import này
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder; // Và cái nà
import com.nimbusds.jwt.JWTParser;
import java.text.ParseException;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final DeviceRepository deviceRepository;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    @Transactional
    public void setNotePassword(UUID userId, String password) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        if(user.getNotePassword() != null) {
            throw new IllegalStateException("Note password already set");
        }
        String hashedPassword = passwordEncoder.encode(password);
        user.setNotePassword(hashedPassword);
        userRepository.save(user);
    }

    @Override 
    @Transactional
    public void changeNotePassword(UUID userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        if(user.getNotePassword() == null) {
            throw new IllegalStateException("No note password set");
        }
        if(!passwordEncoder.matches(currentPassword, user.getNotePassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        String hashedNewPassword = passwordEncoder.encode(newPassword);
        user.setNotePassword(hashedNewPassword);
        userRepository.save(user);  
    }

    @Override 
    @Transactional
    public void removeNotePassword(UUID userId, String currentPassword) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        if(user.getNotePassword() == null) {
            throw new IllegalStateException("No note password set");
        }
        if(!passwordEncoder.matches(currentPassword, user.getNotePassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        user.setNotePassword(null);
        userRepository.save(user);  
    }

    @Override
    @Transactional(readOnly = true) 
    public boolean hasNotePassword(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return user.getNotePassword() != null;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean verifyNotePassword(UUID userId, String password) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        if(user.getNotePassword() == null) {
            throw new IllegalStateException("No note password set");
        }
        return passwordEncoder.matches(password, user.getNotePassword());
    }

    private User getUserById(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }

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
    
    @Override
    @Transactional
    public void updateTheme(UUID userId, String theme) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        user.setTheme(theme);
        userRepository.save(user);
    }

    private UserProfileDto mapToUserProfileDto(User user) {
        UserProfileDto dto = new UserProfileDto();
        dto.setUserId(user.getUserId());
        dto.setUsername(user.getUsername());
        dto.setCreatedAt(user.getCreated_at());
        
        if (user.getEmail() != null) {
            dto.setEmail(user.getEmail().getEmail());
        }
        Email email = user.getEmail();
        if(email != null && email.getIdToken() != null && !email.getIdToken().isEmpty()) {
            try {
                String picture = (String) JWTParser.parse(email.getIdToken())
                                        .getJWTClaimsSet().getClaim("picture");
                dto.setAvatar(picture);
            } catch (ParseException e) {
                e.printStackTrace();
            }
        }

        dto.setTheme(user.getTheme());
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
