package com.ssid.collegeportal.dto;

import lombok.Data;
import jakarta.validation.constraints.*;

@Data
public class ResultRequestDTO {
    @NotNull(message = "Student ID is required")
    private Long studentId;

    @NotBlank(message = "Subject is required")
    @Size(min = 1, max = 100, message = "Subject must be between 1 and 100 characters")
    private String subject;

    @NotNull(message = "Marks are required")
    @DecimalMin(value = "0.0", message = "Marks must be at least 0")
    @DecimalMax(value = "100.0", message = "Marks must not exceed 100")
    private Double marks;
}
