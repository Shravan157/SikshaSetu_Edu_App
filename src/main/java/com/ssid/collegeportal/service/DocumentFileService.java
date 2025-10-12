package com.ssid.collegeportal.service;

import com.ssid.collegeportal.model.DocumentFile;
import com.ssid.collegeportal.repository.DocumentFileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
public class DocumentFileService {

    private static final Logger logger = LoggerFactory.getLogger(DocumentFileService.class);

    private final DocumentFileRepository documentFileRepository;

    @Autowired
    public DocumentFileService(DocumentFileRepository documentFileRepository) {
        this.documentFileRepository = documentFileRepository;
    }

    public DocumentFile uploadFile(MultipartFile file, String uploadedBy, String description) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be null or empty");
        }

        DocumentFile documentFile = DocumentFile.builder()
                .fileName(file.getOriginalFilename())
                .fileType(file.getContentType())
                .fileData(file.getBytes())
                .uploadedBy(uploadedBy)
                .description(description)
                .build();

        DocumentFile savedFile = documentFileRepository.save(documentFile);
        logger.info("File uploaded successfully: {} ({} bytes) by user: {}",
                   savedFile.getFileName(), savedFile.getFileSize(), uploadedBy);

        return savedFile;
    }

    public DocumentFile uploadFile(MultipartFile file) throws IOException {
        return uploadFile(file, null, null);
    }

    public Optional<DocumentFile> getFile(Long id) {
        return documentFileRepository.findById(id);
    }

    public DocumentFile getFileOrThrow(Long id) {
        return getFile(id).orElseThrow(() -> {
            logger.warn("File not found with ID: {}", id);
            return new RuntimeException("File not found with ID: " + id);
        });
    }

    public List<DocumentFile> getAllFiles() {
        return documentFileRepository.findAll();
    }

    public List<DocumentFile> getFilesByUser(String uploadedBy) {
        return documentFileRepository.findByUploadedBy(uploadedBy);
    }

    public List<DocumentFile> getFilesByType(String fileType) {
        return documentFileRepository.findByFileType(fileType);
    }

    public List<DocumentFile> searchFilesByName(String fileName) {
        return documentFileRepository.findByFileNameContainingIgnoreCase(fileName);
    }

    public void deleteFile(Long id) {
        if (!documentFileRepository.existsById(id)) {
            throw new RuntimeException("File not found with ID: " + id);
        }
        documentFileRepository.deleteById(id);
        logger.info("File deleted successfully with ID: {}", id);
    }

    public boolean fileExists(Long id) {
        return documentFileRepository.existsById(id);
    }
}
