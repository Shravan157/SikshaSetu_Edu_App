package com.ssid.collegeportal.controller;

import com.ssid.collegeportal.dto.FacultyRequestDTO;
import com.ssid.collegeportal.dto.FacultyResponseDTO;
import com.ssid.collegeportal.model.Faculty;
import com.ssid.collegeportal.service.FacultyService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/faculties")
@org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
public class FacultyController {
    @Autowired
    private FacultyService facultyService;

    @Autowired
    private com.ssid.collegeportal.repository.UserRepository userRepository;

    @Autowired
    private com.ssid.collegeportal.repository.BranchRepository branchRepository;

    @GetMapping
    public List<FacultyResponseDTO> getAllFaculties(Authentication authentication) {
        com.ssid.collegeportal.model.User currentUser = userRepository.findByEmail(authentication.getName()).orElse(null);
        boolean isAdmin = currentUser != null && currentUser.getRoles().stream().anyMatch(r -> r.getName().equals("ADMIN"));
        boolean isFaculty = currentUser != null && currentUser.getRoles().stream().anyMatch(r -> r.getName().equals("FACULTY"));
        List<Faculty> faculties = facultyService.getAllFaculties();
        if (isFaculty) {
            com.ssid.collegeportal.model.Faculty faculty = faculties.stream()
                    .filter(f -> f.getUser() != null && f.getUser().getId().equals(currentUser.getId()))
                    .findFirst().orElse(null);
            if (faculty != null && faculty.getBranch() != null) {
                Long facultyBranchId = faculty.getBranch().getId();
                faculties = faculties.stream().filter(f -> f.getBranch() != null && f.getBranch().getId().equals(facultyBranchId)).collect(Collectors.toList());
            } else {
                faculties = List.of();
            }
        } else if (!isAdmin) {
            faculties = List.of();
        }
        return faculties.stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FacultyResponseDTO> getFacultyById(@PathVariable Long id, Authentication authentication) {
        com.ssid.collegeportal.model.User currentUser = userRepository.findByEmail(authentication.getName()).orElse(null);
        boolean isAdmin = currentUser != null && currentUser.getRoles().stream().anyMatch(r -> r.getName().equals("ADMIN"));
        boolean isFaculty = currentUser != null && currentUser.getRoles().stream().anyMatch(r -> r.getName().equals("FACULTY"));
        return facultyService.getFacultyById(id)
                .filter(faculty -> {
                    if (isAdmin) return true;
                    if (isFaculty) {
                        Faculty self = facultyService.getAllFaculties().stream()
                                .filter(f -> f.getUser() != null && f.getUser().getId().equals(currentUser.getId()))
                                .findFirst().orElse(null);
                        return self != null && self.getBranch() != null && faculty.getBranch() != null && self.getBranch().getId().equals(faculty.getBranch().getId());
                    }
                    return false; // students and others cannot view
                })
                .map(this::toResponseDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public FacultyResponseDTO createFaculty(@Valid @RequestBody FacultyRequestDTO dto) {
        Faculty faculty = new Faculty();
        faculty.setUser(userRepository.findById(dto.getUserId()).orElse(null));
        faculty.setBranch(branchRepository.findById(dto.getBranchId()).orElse(null));
        Faculty saved = facultyService.createFaculty(faculty);
        return toResponseDTO(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FacultyResponseDTO> updateFaculty(@PathVariable Long id,
                                                            @Valid @RequestBody FacultyRequestDTO dto) {
        try {
            Faculty faculty = new Faculty();
            faculty.setUser(userRepository.findById(dto.getUserId()).orElse(null));
            faculty.setBranch(branchRepository.findById(dto.getBranchId()).orElse(null));
            Faculty updated = facultyService.updateFaculty(id, faculty);
            return ResponseEntity.ok(toResponseDTO(updated));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFaculty(@PathVariable Long id) {
        facultyService.deleteFaculty(id);
        return ResponseEntity.noContent().build();
    }

    private FacultyResponseDTO toResponseDTO(Faculty faculty) {
        FacultyResponseDTO dto = new FacultyResponseDTO();
        dto.setId(faculty.getId());
        if (faculty.getUser() != null) {
            dto.setUserId(faculty.getUser().getId());
            dto.setUserName(faculty.getUser().getName());
            dto.setUserEmail(faculty.getUser().getEmail());
        }
        if (faculty.getBranch() != null) {
            dto.setBranchId(faculty.getBranch().getId());
            dto.setBranchName(faculty.getBranch().getName());
        }
        return dto;
    }
}