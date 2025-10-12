package com.ssid.collegeportal.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "notes")
public class Note {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String content;

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false)
    private String branchName; // Which branch this note is for

    @Column(nullable = false)
    private Integer year; // Which year (1, 2, 3, 4)

    @Column(nullable = false)
    private Integer semester; // Which semester (1-8)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attachment_file_id")
    private DocumentFile attachmentFile; // Reference to the uploaded file

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Helper methods for backward compatibility
    public String getAttachmentName() {
        return attachmentFile != null ? attachmentFile.getFileName() : null;
    }

    public String getAttachmentType() {
        return attachmentFile != null ? attachmentFile.getFileType() : null;
    }

    public byte[] getAttachmentData() {
        return attachmentFile != null ? attachmentFile.getFileData() : null;
    }

    public boolean hasAttachment() {
        return attachmentFile != null;
    }

    public Long getAttachmentFileId() {
        return attachmentFile != null ? attachmentFile.getId() : null;
    }
}
