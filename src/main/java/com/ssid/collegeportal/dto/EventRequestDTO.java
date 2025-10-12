package com.ssid.collegeportal.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

@Data
public class EventRequestDTO {
    private String title;
    private String description;
    private LocalDateTime eventDate;
    private String location;
    private MultipartFile attachment; // Optional file attachment
    private String attachmentPath;

}
