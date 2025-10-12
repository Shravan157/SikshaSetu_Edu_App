package com.ssid.collegeportal.controller;

import com.ssid.collegeportal.dto.NoteRequestDTO;
import com.ssid.collegeportal.dto.NoteResponseDTO;
import com.ssid.collegeportal.model.DocumentFile;
import com.ssid.collegeportal.model.Note;
import com.ssid.collegeportal.service.DocumentFileService;
import com.ssid.collegeportal.service.NoteService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notes")
public class NoteController {
    private static final Logger logger = LoggerFactory.getLogger(NoteController.class);

    @Autowired
    private NoteService noteService;

    @Autowired
    private DocumentFileService documentFileService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'STUDENT')")
    public List<NoteResponseDTO> getAllNotes() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

        return noteService.getNotesForUser(email).stream()
                .map(this::toResponseDTO).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'STUDENT')")
    public ResponseEntity<NoteResponseDTO> getNoteById(@PathVariable Long id) {
        return noteService.getNoteById(id)
                .map(n -> ResponseEntity.ok(toResponseDTO(n)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public NoteResponseDTO createNote(@ModelAttribute NoteRequestDTO dto) {
        return toResponseDTO(noteService.createNote(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public NoteResponseDTO updateNote(@PathVariable Long id, @ModelAttribute NoteRequestDTO dto) {
        return toResponseDTO(noteService.updateNote(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public ResponseEntity<Void> deleteNote(@PathVariable Long id) {
        noteService.deleteNote(id);
        return ResponseEntity.noContent().build();
    }

    private NoteResponseDTO toResponseDTO(Note note) {
        NoteResponseDTO dto = new NoteResponseDTO();
        dto.setId(note.getId());
        dto.setTitle(note.getTitle());
        dto.setContent(note.getContent());
        dto.setSubject(note.getSubject());
        dto.setBranchName(note.getBranchName());
        dto.setYear(note.getYear());
        dto.setSemester(note.getSemester());
        dto.setCreatedAt(note.getCreatedAt());
        dto.setHasAttachment(note.hasAttachment());
        dto.setAttachmentUrl(note.hasAttachment() ? "/api/files/download/" + note.getAttachmentFileId() : null);
        return dto;
    }
    @GetMapping("/attachment/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'STUDENT')")
    public ResponseEntity<byte[]> downloadAttachment(@PathVariable Long id) {
        try {
            Note note = noteService.getNoteById(id).orElse(null);
            if (note == null || !note.hasAttachment()) {
                return ResponseEntity.notFound().build();
            }

            Long fileId = note.getAttachmentFileId();
            if (fileId == null) {
                return ResponseEntity.notFound().build();
            }

            DocumentFile file = documentFileService.getFile(fileId).orElse(null);
            if (file == null) {
                return ResponseEntity.notFound().build();
            }

            // Properly encode filename for Content-Disposition header
            String encodedFilename;
            try {
                encodedFilename = java.net.URLEncoder.encode(file.getFileName(), "UTF-8").replace("+", "%20");
            } catch (java.io.UnsupportedEncodingException e) {
                logger.warn("UTF-8 encoding not supported, using default encoding for filename: {}", file.getFileName());
                encodedFilename = file.getFileName().replace(" ", "%20");
            }

            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename*=UTF-8''" + encodedFilename + "; filename=\"" + file.getFileName().replace("\"", "\\\"") + "\"")
                    .header("Content-Type", file.getFileType())
                    .header("Content-Length", String.valueOf(file.getFileSize()))
                    .header("Cache-Control", "no-cache")
                    .body(file.getFileData());

        } catch (Exception e) {
            logger.error("Error downloading attachment for note ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
