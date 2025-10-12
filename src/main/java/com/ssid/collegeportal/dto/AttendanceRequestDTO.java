package com.ssid.collegeportal.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class AttendanceRequestDTO {
    private Long studentId;
    private Long facultyId;
    private LocalDate date;
    private Boolean present;
}
