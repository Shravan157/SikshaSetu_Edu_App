package com.ssid.collegeportal.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FacultyRequestDTO {
    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Branch ID is required")
    private Long branchId;
    // Add more fields as needed
}