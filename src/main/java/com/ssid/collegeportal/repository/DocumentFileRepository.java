package com.ssid.collegeportal.repository;

import com.ssid.collegeportal.model.DocumentFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentFileRepository extends JpaRepository<DocumentFile, Long> {

    List<DocumentFile> findByUploadedBy(String uploadedBy);

    List<DocumentFile> findByFileType(String fileType);

    List<DocumentFile> findByFileNameContainingIgnoreCase(String fileName);
}
