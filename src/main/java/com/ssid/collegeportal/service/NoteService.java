package com.ssid.collegeportal.service;

import com.ssid.collegeportal.dto.NoteRequestDTO;
import com.ssid.collegeportal.model.DocumentFile;
import com.ssid.collegeportal.model.Note;
import com.ssid.collegeportal.model.Student;
import com.ssid.collegeportal.model.User;
import com.ssid.collegeportal.repository.NoteRepository;
import com.ssid.collegeportal.repository.StudentRepository;
import com.ssid.collegeportal.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class NoteService {

    private static final Logger logger = LoggerFactory.getLogger(NoteService.class);

    @Autowired
    private NoteRepository noteRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private StudentRepository studentRepository;
    @Autowired
    private DocumentFileService documentFileService;

    public List<Note> getAllNotes() {
        return noteRepository.findAll();
    }

    public List<Note> getNotesForUser(String email) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return List.of();
        }

        // If user is admin or faculty, return all notes
        if (user.getRoles().stream()
                .anyMatch(role -> role.getName().equals("ADMIN") || role.getName().equals("FACULTY"))) {
            return noteRepository.findAll();
        }

        // If user is student, return only notes for their branch, year, and semester
        if (user.getRoles().stream().anyMatch(role -> role.getName().equals("STUDENT"))) {
            Student student = studentRepository.findByUserId(user.getId());
            if (student != null && student.getBranch() != null) {
                return noteRepository.findAll().stream()
                        .filter(note -> note.getBranchName() != null &&
                                note.getBranchName().equals(student.getBranch().getName()) &&
                                note.getYear() != null &&
                                note.getYear().equals(student.getYear()) &&
                                note.getSemester() != null &&
                                note.getSemester().equals(student.getSemester()))
                        .collect(Collectors.toList());
            }
        }

        return List.of();
    }

    public Optional<Note> getNoteById(Long id) {
        return noteRepository.findById(id);
    }

    public Note createNote(NoteRequestDTO dto) {
        Note note = Note.builder()
                .title(dto.getTitle())
                .content(dto.getContent())
                .subject(dto.getSubject())
                .branchName(dto.getBranchName())
                .year(dto.getYear())
                .semester(dto.getSemester())
                .build();

        // Handle file attachment if present
        if (dto.getAttachment() != null && !dto.getAttachment().isEmpty()) {
            try {
                DocumentFile documentFile = documentFileService.uploadFile(
                    dto.getAttachment(),
                    getCurrentUsername(),
                    "Note attachment for: " + dto.getTitle()
                );
                note.setAttachmentFile(documentFile);
                logger.info("File attached to note: {} (file ID: {})", dto.getTitle(), documentFile.getId());
            } catch (Exception e) {
                logger.error("Failed to upload attachment for note: {}", dto.getTitle(), e);
                throw new RuntimeException("Failed to upload attachment", e);
            }
        }

        return noteRepository.save(note);
    }

    public Note updateNote(Long id, NoteRequestDTO dto) {
        Note note = noteRepository.findById(id).orElseThrow();
        note.setTitle(dto.getTitle());
        note.setContent(dto.getContent());
        note.setSubject(dto.getSubject());
        note.setBranchName(dto.getBranchName());
        note.setYear(dto.getYear());
        note.setSemester(dto.getSemester());

        // Handle file attachment if present
        if (dto.getAttachment() != null && !dto.getAttachment().isEmpty()) {
            try {
                // Delete old attachment if exists
                if (note.getAttachmentFile() != null) {
                    documentFileService.deleteFile(note.getAttachmentFile().getId());
                }

                // Upload new attachment
                DocumentFile documentFile = documentFileService.uploadFile(
                    dto.getAttachment(),
                    getCurrentUsername(),
                    "Updated note attachment for: " + dto.getTitle()
                );
                note.setAttachmentFile(documentFile);
                logger.info("File attachment updated for note: {} (file ID: {})", dto.getTitle(), documentFile.getId());
            } catch (Exception e) {
                logger.error("Failed to update attachment for note: {}", dto.getTitle(), e);
                throw new RuntimeException("Failed to update attachment", e);
            }
        }

        return noteRepository.save(note);
    }

    public void deleteNote(Long id) {
        Note note = noteRepository.findById(id).orElseThrow();

        // Delete associated file if exists
        if (note.getAttachmentFile() != null) {
            try {
                documentFileService.deleteFile(note.getAttachmentFile().getId());
                logger.info("Deleted attachment file for note ID: {} (file ID: {})", id, note.getAttachmentFile().getId());
            } catch (Exception e) {
                logger.warn("Failed to delete attachment file for note ID: {} (file ID: {})", id, note.getAttachmentFile().getId(), e);
            }
        }

        noteRepository.deleteById(id);
        logger.info("Note deleted successfully: ID {}", id);
    }

    private String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null ? auth.getName() : "anonymous";
    }
}
