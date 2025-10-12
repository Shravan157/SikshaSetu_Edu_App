package com.ssid.collegeportal.controller;

import com.ssid.collegeportal.dto.UserResponseDTO;
import com.ssid.collegeportal.model.User;
import com.ssid.collegeportal.model.Role;
import com.ssid.collegeportal.repository.StudentRepository;
import com.ssid.collegeportal.repository.UserRepository;
import com.ssid.collegeportal.repository.FacultyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.stream.Collectors;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private com.ssid.collegeportal.repository.RoleRepository roleRepository;
    @Autowired
    private StudentRepository studentRepository;
    @Autowired
    private FacultyRepository facultyRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<UserResponseDTO> userDTOs = users.stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(userDTOs);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable Long id) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        UserResponseDTO dto = toResponseDTO(user);
        
        // Add student/faculty specific info if applicable
        if (user.getRoles().stream().anyMatch(r -> r.getName().equals("STUDENT"))) {
            com.ssid.collegeportal.model.Student student = studentRepository.findByUserId(user.getId());
            if (student != null) {
                dto.setBranchName(student.getBranch() != null ? student.getBranch().getName() : null);
                dto.setSemester(student.getSemester());
                dto.setYear(student.getYear());
            }
        }
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDTO> updateUser(@PathVariable Long id, @RequestBody UserResponseDTO updateDto) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        
        // Update basic user info
        if (updateDto.getName() != null && !updateDto.getName().trim().isEmpty()) {
            user.setName(updateDto.getName().trim());
        }
        userRepository.save(user);
        return ResponseEntity.ok(toResponseDTO(user));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        
        // Check if user is trying to delete themselves
        String currentUserEmail = getCurrentUserEmail();
        if (user.getEmail().equals(currentUserEmail)) {
            return ResponseEntity.badRequest().build(); // Cannot delete self
        }
        
        // Delete associated student/faculty records first if they exist
        com.ssid.collegeportal.model.Student student = studentRepository.findByUserId(id);
        if (student != null) {
            studentRepository.delete(student);
        }
        
        // Check for faculty record
        com.ssid.collegeportal.model.Faculty faculty = facultyRepository.findAll().stream()
            .filter(f -> f.getUser() != null && f.getUser().getId().equals(id))
            .findFirst().orElse(null);
        if (faculty != null) {
            facultyRepository.delete(faculty);
        }
        
        userRepository.delete(user);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> getMyProfile() {
        String email = getCurrentUserEmail();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        UserResponseDTO dto = toResponseDTO(user);

        if (user.getRoles().stream().anyMatch(r -> r.getName().equals("STUDENT"))) {
            com.ssid.collegeportal.model.Student student = studentRepository.findByUserId(user.getId());
            if (student != null) {
                dto.setBranchName(student.getBranch() != null ? student.getBranch().getName() : null);
                dto.setSemester(student.getSemester());
                dto.setYear(student.getYear());
            }
        }
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponseDTO> updateMyProfile(@RequestBody UserResponseDTO updateDto) {
        String email = getCurrentUserEmail();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        if (updateDto.getName() != null)
            user.setName(updateDto.getName());
        if (updateDto.getEmail() != null && !updateDto.getEmail().equals(user.getEmail())) {
            // Check for email conflict
            if (userRepository.existsByEmail(updateDto.getEmail())) {
                return ResponseEntity.badRequest().build();
            }
            user.setEmail(updateDto.getEmail());
        }
        userRepository.save(user);
        return ResponseEntity.ok(toResponseDTO(user));
    }

    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(@RequestParam String oldPassword, @RequestParam String newPassword) {
        String email = getCurrentUserEmail();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).body("User not found");
        }
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            return ResponseEntity.status(400).body("Old password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return ResponseEntity.ok("Password changed successfully");
    }

    private String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getName();
    }

    @PutMapping("/{userId}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> changeUserRole(@PathVariable Long userId, @RequestParam String role) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        String upperRole = role.trim().toUpperCase();
        Role newRole = roleRepository.findByName(upperRole).orElse(null);
        if (newRole == null) {
            return ResponseEntity.badRequest().body("Invalid role");
        }
        user.setRoles(java.util.Collections.singleton(newRole));
        userRepository.save(user);
        return ResponseEntity.ok("User role updated to " + upperRole);
    }

    private UserResponseDTO toResponseDTO(User user) {
        UserResponseDTO dto = new UserResponseDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRoles(user.getRoles().stream().map(r -> r.getName()).collect(Collectors.toSet()));
        return dto;
    }
}
