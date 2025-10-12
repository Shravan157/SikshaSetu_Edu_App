package com.ssid.collegeportal.dto;

import com.ssid.collegeportal.model.SessionStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class VideoSessionResponse {
    private Long id;
    private String roomId;
    private Long teacherId;
    private String teacherName;
    private LocalDateTime scheduledTime;
    private LocalDateTime endTime;
    private String subject;
    private List<Long> participantIds;
    private SessionStatus status;
    private LocalDateTime createdAt;
}