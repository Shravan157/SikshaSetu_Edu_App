package com.ssid.collegeportal.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "document_files")
public class DocumentFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String fileType;

    @Lob
    @Column(nullable = false, columnDefinition = "LONGBLOB")
    private byte[] fileData;

    // Optional metadata
    private String uploaderName;
    private String description;
    private String uploadedBy; // User who uploaded the file

    @Column(name = "uploaded_at", nullable = false)
    private LocalDateTime uploadedAt;

    @Column(name = "file_size")
    private Long fileSize;

    @PrePersist
    protected void onCreate() {
        uploadedAt = LocalDateTime.now();
        if (fileData != null) {
            fileSize = (long) fileData.length;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        if (fileData != null) {
            fileSize = (long) fileData.length;
        }
    }
}
