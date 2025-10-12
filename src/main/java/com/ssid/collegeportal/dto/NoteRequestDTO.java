package com.ssid.collegeportal.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class NoteRequestDTO {
    private String title;
    private String content;
    private String subject;
    private String branchName;
    private Integer year;
    private Integer semester;
    private MultipartFile attachment; // Optional file attachment
}
