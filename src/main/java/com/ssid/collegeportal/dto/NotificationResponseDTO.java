package com.ssid.collegeportal.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NotificationResponseDTO {
    private Long id;
    private String title; // ✅ Missing field added
    private String message;
    private LocalDateTime createdAt;
}
