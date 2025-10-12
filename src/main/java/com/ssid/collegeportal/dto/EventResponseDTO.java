package com.ssid.collegeportal.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class EventResponseDTO {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime eventDate;
    private String location;
    private String attachmentUrl; // URL for downloading the attachment
}
