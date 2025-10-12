package com.ssid.collegeportal.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NoteResponseDTO {
    private Long id;
    private String title;
    private String content;
    private String subject;
    private String branchName;
    private Integer year;
    private Integer semester;
    private String attachmentUrl; // URL for downloading the attachment
    private boolean hasAttachment; // Whether the note has an attachment
    private LocalDateTime createdAt;
}
