package com.ssid.collegeportal.dto;

import lombok.Data;
import java.util.List;

@Data
public class NotificationRequestDTO {
    private String title; // ✅ Needed to support update/create
    private String message;
    private Long recipientUserId; // For individual notifications
    private String type; // e.g., INFO, ALERT, EVENT
    private String audience; // ALL_USERS, ALL_STUDENTS, ALL_FACULTY, SPECIFIC_USER, SPECIFIC_BRANCH
    private Long branchId; // For branch-specific notifications
    private List<Long> recipientUserIds; // For multiple specific users
}
