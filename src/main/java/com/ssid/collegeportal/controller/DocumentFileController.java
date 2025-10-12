package com.ssid.collegeportal.controller;

import com.ssid.collegeportal.model.DocumentFile;
import com.ssid.collegeportal.service.DocumentFileService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/files")
public class DocumentFileController {

    private static final Logger logger = LoggerFactory.getLogger(DocumentFileController.class);

    private final DocumentFileService documentFileService;

    @Autowired
    public DocumentFileController(DocumentFileService documentFileService) {
        this.documentFileService = documentFileService;
    }

    @PostMapping("/upload")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'STUDENT')")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file,
                                           @RequestParam(value = "description", required = false) String description) {
        try {
            String currentUser = getCurrentUsername();
            DocumentFile uploadedFile = documentFileService.uploadFile(file, currentUser, description);
            logger.info("File uploaded successfully by user: {}", currentUser);
            return ResponseEntity.ok("File uploaded successfully! ID: " + uploadedFile.getId());
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid file upload attempt: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        } catch (IOException e) {
            logger.error("Error uploading file", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error uploading file: " + e.getMessage());
        }
    }

    @GetMapping("/download/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'STUDENT')")
    public ResponseEntity<byte[]> downloadFile(@PathVariable Long id) {
        try {
            DocumentFile file = documentFileService.getFileOrThrow(id);

            // Properly encode filename for Content-Disposition header
            String encodedFilename = URLEncoder.encode(file.getFileName(), StandardCharsets.UTF_8.toString())
                    .replace("+", "%20");

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(file.getFileType()))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                           "attachment; filename*=UTF-8''" + encodedFilename +
                           "; filename=\"" + file.getFileName().replace("\"", "\\\"") + "\"")
                    .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(file.getFileSize()))
                    .header(HttpHeaders.CACHE_CONTROL, "no-cache")
                    .body(file.getFileData());

        } catch (RuntimeException e) {
            logger.warn("File download failed for ID: {}, error: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Unexpected error during file download for ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'STUDENT')")
    public ResponseEntity<DocumentFile> getFileInfo(@PathVariable Long id) {
        return documentFileService.getFile(id)
                .map(file -> ResponseEntity.ok(file))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'STUDENT')")
    public ResponseEntity<List<DocumentFile>> getAllFiles() {
        List<DocumentFile> files = documentFileService.getAllFiles();
        return ResponseEntity.ok(files);
    }

    @GetMapping("/user/{username}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'STUDENT')")
    public ResponseEntity<List<DocumentFile>> getFilesByUser(@PathVariable String username) {
        List<DocumentFile> files = documentFileService.getFilesByUser(username);
        return ResponseEntity.ok(files);
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'STUDENT')")
    public ResponseEntity<List<DocumentFile>> searchFiles(@RequestParam String filename) {
        List<DocumentFile> files = documentFileService.searchFilesByName(filename);
        return ResponseEntity.ok(files);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public ResponseEntity<String> deleteFile(@PathVariable Long id) {
        try {
            documentFileService.deleteFile(id);
            return ResponseEntity.ok("File deleted successfully");
        } catch (RuntimeException e) {
            logger.warn("File deletion failed for ID: {}, error: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    private String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null ? auth.getName() : "anonymous";
    }
}
