package com.ssid.collegeportal.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BranchRequestDTO {
    @NotBlank(message = "Branch name is required")
    private String name;
    // Add more fields as needed
}