package com.ssid.collegeportal.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ZegoTokenRequest {
    @NotBlank
    private String roomId;

    @NotBlank
    private String userId;
}