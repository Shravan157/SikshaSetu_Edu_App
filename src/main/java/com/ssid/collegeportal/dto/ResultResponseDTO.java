package com.ssid.collegeportal.dto;

import lombok.Data;

@Data
public class ResultResponseDTO {
    private Long id;
    private Long studentId;
    private String studentName;
    private String subject;
    private Double marks;
}
