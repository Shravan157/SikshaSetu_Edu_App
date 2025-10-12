package com.ssid.collegeportal.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User recipient;

    private String title;
    private String message;
    private LocalDateTime createdAt;
    @Column(name = "`read`")
    private boolean read = false;
    private String type; // e.g., INFO, ALERT, EVENT
}