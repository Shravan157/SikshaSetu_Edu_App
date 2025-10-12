package com.ssid.collegeportal.controller;

import com.ssid.collegeportal.dto.AttendanceRequestDTO;
import com.ssid.collegeportal.dto.AttendanceResponseDTO;
import com.ssid.collegeportal.model.Attendance;
import com.ssid.collegeportal.service.AttendanceService;
import com.ssid.collegeportal.repository.StudentRepository;
import com.ssid.collegeportal.repository.FacultyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {
    @Autowired
    private AttendanceService attendanceService;
    @Autowired
    private StudentRepository studentRepository;
    @Autowired
    private FacultyRepository facultyRepository;

    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public List<AttendanceResponseDTO> getMyAttendance() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        com.ssid.collegeportal.model.Student student = studentRepository.findByUserEmail(email);
        if (student == null) return java.util.Collections.emptyList();
        return attendanceService.getAttendanceByStudentId(student.getId()).stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public List<AttendanceResponseDTO> getAllAttendance() {
        return attendanceService.getAllAttendance().stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY') or (hasRole('STUDENT') and @attendanceController.isOwnAttendance(#id))")
    public ResponseEntity<AttendanceResponseDTO> getAttendanceById(@PathVariable Long id) {
        return attendanceService.getAttendanceById(id)
            .map(a -> ResponseEntity.ok(toResponseDTO(a)))
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY') or (hasRole('STUDENT') and #studentId == principal.id)")
    public List<AttendanceResponseDTO> getAttendanceByStudent(@PathVariable Long studentId) {
        return attendanceService.getAttendanceByStudentId(studentId).stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public AttendanceResponseDTO createAttendance(@RequestBody AttendanceRequestDTO dto) {
        return toResponseDTO(attendanceService.createAttendance(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public AttendanceResponseDTO updateAttendance(@PathVariable Long id, @RequestBody AttendanceRequestDTO dto) {
        return toResponseDTO(attendanceService.updateAttendance(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public ResponseEntity<Void> deleteAttendance(@PathVariable Long id) {
        attendanceService.deleteAttendance(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/mark")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public ResponseEntity<List<AttendanceResponseDTO>> markBulkAttendance(@RequestBody List<AttendanceRequestDTO> attendanceList) {
        try {
            List<Attendance> createdAttendance = attendanceList.stream()
                .map(dto -> attendanceService.createAttendance(dto))
                .collect(Collectors.toList());
            
            List<AttendanceResponseDTO> responseDTOs = createdAttendance.stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(responseDTOs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Helper for SpEL in @PreAuthorize
    public boolean isOwnAttendance(Long attendanceId) {
        // Get current authenticated user's email from security context
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        // Find attendance record
        return attendanceService.getAttendanceById(attendanceId)
            .map(attendance -> attendance.getStudent() != null &&
                attendance.getStudent().getUser() != null &&
                email.equals(attendance.getStudent().getUser().getEmail()))
            .orElse(false);
    }

    private AttendanceResponseDTO toResponseDTO(Attendance attendance) {
        AttendanceResponseDTO dto = new AttendanceResponseDTO();
        dto.setId(attendance.getId());
        if (attendance.getStudent() != null) {
            dto.setStudentId(attendance.getStudent().getId());
            dto.setStudentName(attendance.getStudent().getUser().getName());
        }
        if (attendance.getFaculty() != null) {
            dto.setFacultyId(attendance.getFaculty().getId());
            dto.setFacultyName(attendance.getFaculty().getUser().getName());
        }
        dto.setDate(attendance.getDate());
        dto.setPresent(attendance.getPresent());
        return dto;
    }
}
