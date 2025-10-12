package com.ssid.collegeportal.controller;

import com.ssid.collegeportal.dto.StudentRequestDTO;
import com.ssid.collegeportal.dto.StudentResponseDTO;
import com.ssid.collegeportal.model.Student;
import com.ssid.collegeportal.service.StudentService;
import com.ssid.collegeportal.repository.UserRepository;
import com.ssid.collegeportal.repository.BranchRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/students")
public class StudentController {
    @Autowired
    private StudentService studentService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private BranchRepository branchRepository;
    @Autowired
    private com.ssid.collegeportal.repository.FacultyRepository facultyRepository;

    @GetMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public List<StudentResponseDTO> getAllStudents(
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer semester,
            org.springframework.security.core.Authentication authentication) {
        com.ssid.collegeportal.model.User currentUser = userRepository.findByEmail(authentication.getName()).orElse(null);
        boolean isAdmin = currentUser != null && currentUser.getRoles().stream().anyMatch(r -> r.getName().equals("ADMIN"));
        boolean isFaculty = currentUser != null && currentUser.getRoles().stream().anyMatch(r -> r.getName().equals("FACULTY"));
        List<Student> students = studentService.getAllStudents();
        if (isFaculty) {
            // Only allow faculty to see students from their own branch
            com.ssid.collegeportal.model.Faculty faculty = facultyRepository.findAll().stream()
                .filter(f -> f.getUser() != null && f.getUser().getId().equals(currentUser.getId()))
                .findFirst().orElse(null);
            if (faculty != null && faculty.getBranch() != null) {
                Long facultyBranchId = faculty.getBranch().getId();
                students = students.stream().filter(s -> s.getBranch() != null && s.getBranch().getId().equals(facultyBranchId)).collect(Collectors.toList());
            } else {
                students = List.of();
            }
        } else if (!isAdmin) {
            // Not admin or faculty: students cannot list others
            students = List.of();
        }
        if (branchId != null) {
            students = students.stream().filter(s -> s.getBranch() != null && s.getBranch().getId().equals(branchId)).collect(Collectors.toList());
        }
        if (year != null) {
            students = students.stream().filter(s -> s.getYear() == year).collect(Collectors.toList());
        }
        if (semester != null) {
            students = students.stream().filter(s -> s.getSemester() == semester).collect(Collectors.toList());
        }
        return students.stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'FACULTY') or (hasRole('STUDENT') and #id == principal.id)")
    public ResponseEntity<StudentResponseDTO> getStudentById(@PathVariable Long id, org.springframework.security.core.Authentication authentication) {
        com.ssid.collegeportal.model.User currentUser = userRepository.findByEmail(authentication.getName()).orElse(null);
        boolean isAdmin = currentUser != null && currentUser.getRoles().stream().anyMatch(r -> r.getName().equals("ADMIN"));
        boolean isFaculty = currentUser != null && currentUser.getRoles().stream().anyMatch(r -> r.getName().equals("FACULTY"));
        boolean isStudent = currentUser != null && currentUser.getRoles().stream().anyMatch(r -> r.getName().equals("STUDENT"));
        return studentService.getStudentById(id)
                .filter(student -> {
                    if (isAdmin) return true;
                    if (isFaculty) {
                        com.ssid.collegeportal.model.Faculty faculty = facultyRepository.findAll().stream()
                            .filter(f -> f.getUser() != null && f.getUser().getId().equals(currentUser.getId()))
                            .findFirst().orElse(null);
                        return faculty != null && faculty.getBranch() != null && student.getBranch() != null && faculty.getBranch().getId().equals(student.getBranch().getId());
                    }
                    // Student: can only view self
                    return isStudent && student.getUser() != null && student.getUser().getId().equals(currentUser.getId());
                })
                .map(this::toResponseDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public StudentResponseDTO createStudent(@Valid @RequestBody StudentRequestDTO dto) {
        Student student = new Student();
        student.setUser(userRepository.findById(dto.getUserId()).orElse(null));
        student.setBranch(branchRepository.findById(dto.getBranchId()).orElse(null));
        student.setYear(dto.getYear());
        student.setSemester(dto.getSemester());
        Student saved = studentService.createStudent(student);
        return toResponseDTO(saved);
    }

    @PutMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'FACULTY') or (hasRole('STUDENT') and #id == principal.id)")
    public ResponseEntity<StudentResponseDTO> updateStudent(@PathVariable Long id,
            @Valid @RequestBody StudentRequestDTO dto) {
        try {
            Student student = new Student();
            student.setUser(userRepository.findById(dto.getUserId()).orElse(null));
            student.setBranch(branchRepository.findById(dto.getBranchId()).orElse(null));
            student.setYear(dto.getYear());
            student.setSemester(dto.getSemester());
            Student updated = studentService.updateStudent(id, student);
            return ResponseEntity.ok(toResponseDTO(updated));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }

    private StudentResponseDTO toResponseDTO(Student student) {
        StudentResponseDTO dto = new StudentResponseDTO();
        dto.setId(student.getId());
        if (student.getUser() != null) {
            dto.setUserId(student.getUser().getId());
            dto.setUserName(student.getUser().getName());
            dto.setUserEmail(student.getUser().getEmail());
        }
        if (student.getBranch() != null) {
            dto.setBranchId(student.getBranch().getId());
            dto.setBranchName(student.getBranch().getName());
        }
        dto.setYear(student.getYear());
        dto.setSemester(student.getSemester());
        return dto;
    }
}