package com.ssid.collegeportal.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class JoinSessionRequest {
    @NotBlank
    private String roomId;
}