package com.ssid.collegeportal.controller;

import com.ssid.collegeportal.config.JwtProvider;
import com.ssid.collegeportal.dto.AuthRequest;
import com.ssid.collegeportal.dto.AuthResponse;
import com.ssid.collegeportal.dto.RegisterRequest;
import com.ssid.collegeportal.model.Role;
import com.ssid.collegeportal.model.User;
import com.ssid.collegeportal.repository.RoleRepository;
import com.ssid.collegeportal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private JwtProvider jwtProvider;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RoleRepository roleRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private com.ssid.collegeportal.service.RateLimiterService rateLimiterService;
    @Autowired
    private com.ssid.collegeportal.repository.StudentRepository studentRepository;
    @Autowired
    private com.ssid.collegeportal.repository.FacultyRepository facultyRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        String email = request.getEmail();
        // Rate limiting by email
        if (rateLimiterService.isRateLimited("login:" + email)) {
            return ResponseEntity.status(429).body("Too many login attempts. Try again later.");
        }
        // Account lockout
        if (rateLimiterService.isLockedOut(email)) {
            return ResponseEntity.status(423).body("Account locked due to too many failed logins. Try again later.");
        }
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword()));
            String token = jwtProvider.generateToken(email);
            rateLimiterService.resetFailedLogins(email);
            return ResponseEntity.ok(new AuthResponse(token));
        } catch (Exception ex) {
            rateLimiterService.recordFailedLogin(email);
            return ResponseEntity.status(401).body("Invalid credentials");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Email already in use");
        }
        String requestedRole = request.getRole();
        // Only allow these roles to be registered
        String roleName = "STUDENT";
        if (requestedRole != null) {
            String upperRole = requestedRole.trim().toUpperCase();
            if (upperRole.equals("FACULTY") || upperRole.equals("ADMIN") || upperRole.equals("STUDENT")) {
                roleName = upperRole;
            }
        }
        Role role = roleRepository.findByName(roleName).orElse(null);
        if (role == null) {
            return ResponseEntity.badRequest().body("Invalid role specified");
        }
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRoles(Collections.singleton(role));
        userRepository.save(user);


        if (roleName.equals("STUDENT")) {
            com.ssid.collegeportal.model.Student student = new com.ssid.collegeportal.model.Student();
            student.setUser(user);
            studentRepository.save(student);
        } else if (roleName.equals("FACULTY")) {
            com.ssid.collegeportal.model.Faculty faculty = new com.ssid.collegeportal.model.Faculty();
            faculty.setUser(user);
            facultyRepository.save(faculty);
        }

        return ResponseEntity.ok("User registered successfully as " + roleName);
    }

    @PostMapping("/request-password-reset")
    public ResponseEntity<String> requestPasswordReset(@RequestBody RegisterRequest request) {
        String email = request.getEmail();
        if (rateLimiterService.isRateLimited("reset:" + email)) {
            return ResponseEntity.status(429).body("Too many requests. Try again later.");
        }
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.ok("If the email exists, a reset link will be sent.");
        }
        String token = java.util.UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(java.time.LocalDateTime.now().plusMinutes(30));
        userRepository.save(user);
        // TODO: Replace with real email service
        System.out.println("Password reset token for " + email + ": " + token);
        return ResponseEntity.ok("If the email exists, a reset link will be sent.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestParam String token, @RequestParam String newPassword) {
        User user = userRepository.findAll().stream()
                .filter(u -> token.equals(u.getResetToken()) && u.getResetTokenExpiry() != null
                        && u.getResetTokenExpiry().isAfter(java.time.LocalDateTime.now()))
                .findFirst().orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("Invalid or expired token");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
        return ResponseEntity.ok("Password reset successful");
    }
}