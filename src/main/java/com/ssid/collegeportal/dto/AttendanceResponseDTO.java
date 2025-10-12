package com.ssid.collegeportal.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class AttendanceResponseDTO {
    private Long id;
    private Long studentId;
    private String studentName;
    private Long facultyId;
    private String facultyName;
    private LocalDate date;
    private Boolean present;
}
