package com.ssid.collegeportal.dto;

import lombok.Data;

@Data
public class StudentResponseDTO {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private Long branchId;
    private String branchName;
    private Integer year;
    private Integer semester;
    // Add more fields as needed
}