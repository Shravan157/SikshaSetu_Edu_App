package com.ssid.collegeportal.dto;

import lombok.Data;

@Data
public class FacultyResponseDTO {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private Long branchId;
    private String branchName;
    // Add more fields as needed
}