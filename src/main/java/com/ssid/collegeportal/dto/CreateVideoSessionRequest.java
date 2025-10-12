package com.ssid.collegeportal.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateVideoSessionRequest {
    @NotBlank
    private String subject;

    @NotNull
    @Future
    private LocalDateTime scheduledTime;

    @NotNull
    @Min(30)
    @Max(480) // 8 hours max
    private Integer durationMinutes;
}