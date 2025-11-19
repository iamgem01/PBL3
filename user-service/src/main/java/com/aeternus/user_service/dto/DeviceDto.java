// DeviceDto.java
package com.aeternus.user_service.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class DeviceDto {
    private UUID deviceId;
    private String deviceName;
    private String deviceLocation;
    private LocalDateTime lastActiveTime;
}