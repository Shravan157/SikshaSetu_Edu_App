package com.ssid.collegeportal.controller;

import com.ssid.collegeportal.dto.ResultRequestDTO;
import com.ssid.collegeportal.dto.ResultResponseDTO;
import com.ssid.collegeportal.model.Result;
import com.ssid.collegeportal.service.ResultService;
import com.ssid.collegeportal.repository.StudentRepository;
import com.ssid.collegeportal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/results")
public class ResultController {
    @Autowired
    private ResultService resultService;
    @Autowired
    private StudentRepository studentRepository;
    @Autowired
    private UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'STUDENT')")
    public List<ResultResponseDTO> getAllResults() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        String email = auth.getName();

        // Find the user by email
        com.ssid.collegeportal.model.User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return List.of();
        }

        // If user is a student, return only their results
        if (user.getRoles().stream().anyMatch(role -> role.getName().equals("STUDENT"))) {
            com.ssid.collegeportal.model.Student student = studentRepository.findByUserId(user.getId());
            if (student != null) {
                return resultService.getResultsByStudentId(student.getId()).stream()
                        .map(this::toResponseDTO).collect(Collectors.toList());
            }
            return List.of();
        }

        // For admin/faculty, return all results
        return resultService.getAllResults().stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY') or (hasRole('STUDENT') and @resultController.isOwnResult(#id))")
    public ResponseEntity<ResultResponseDTO> getResultById(@PathVariable Long id) {
        return resultService.getResultById(id)
                .map(r -> ResponseEntity.ok(toResponseDTO(r)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY') or (hasRole('STUDENT') and @resultController.isOwnStudentResult(#studentId))")
    public List<ResultResponseDTO> getResultsByStudent(@PathVariable Long studentId) {
        return resultService.getResultsByStudentId(studentId).stream().map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public ResultResponseDTO createResult(@Valid @RequestBody ResultRequestDTO dto) {
        return toResponseDTO(resultService.createResult(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public ResultResponseDTO updateResult(@PathVariable Long id, @Valid @RequestBody ResultRequestDTO dto) {
        return toResponseDTO(resultService.updateResult(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public ResponseEntity<Void> deleteResult(@PathVariable Long id) {
        resultService.deleteResult(id);
        return ResponseEntity.noContent().build();
    }

    // Helper for SpEL in @PreAuthorize
    public boolean isOwnResult(Long resultId) {
        // This method should check if the currently authenticated student owns the
        // result
        // You will need to implement this using Spring Security context and your
        // repositories
        return false; // Placeholder
    }

    // New helper for studentId check
    public boolean isOwnStudentResult(Long studentId) {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        String email = auth.getName();
        // Find the user by email
        com.ssid.collegeportal.model.User user = userRepository.findByEmail(email).orElse(null);
        if (user == null)
            return false;
        com.ssid.collegeportal.model.Student student = studentRepository.findByUserId(user.getId());
        return student != null && student.getId().equals(studentId);
    }

    private ResultResponseDTO toResponseDTO(Result result) {
        ResultResponseDTO dto = new ResultResponseDTO();
        dto.setId(result.getId());
        if (result.getStudent() != null) {
            dto.setStudentId(result.getStudent().getId());
            dto.setStudentName(result.getStudent().getUser().getName());
        }
        dto.setSubject(result.getSubject());
        dto.setMarks(result.getMarks());
        return dto;
    }
}
