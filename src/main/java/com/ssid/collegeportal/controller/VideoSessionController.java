package com.ssid.collegeportal.controller;

import com.ssid.collegeportal.dto.CreateVideoSessionRequest;
import com.ssid.collegeportal.dto.VideoSessionResponse;
import com.ssid.collegeportal.dto.ZegoTokenRequest;
import com.ssid.collegeportal.dto.ZegoTokenResponse;
import com.ssid.collegeportal.model.User;
import com.ssid.collegeportal.repository.UserRepository;
import com.ssid.collegeportal.service.VideoSessionService;
import com.ssid.collegeportal.service.ZegoCloudService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/video-sessions")
public class VideoSessionController {

    @Autowired
    private VideoSessionService videoSessionService;

    @Autowired
    private ZegoCloudService zegoCloudService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<VideoSessionResponse> createSession(@Valid @RequestBody CreateVideoSessionRequest request) {
        String teacherEmail = getCurrentUserEmail();
        VideoSessionResponse response = videoSessionService.createSession(request, teacherEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/{roomId}/join")
    @PreAuthorize("hasRole('STUDENT') or hasRole('FACULTY')")
    public ResponseEntity<VideoSessionResponse> joinSession(@PathVariable String roomId) {
        String userEmail = getCurrentUserEmail();
        VideoSessionResponse response = videoSessionService.joinSession(roomId, userEmail);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{roomId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('FACULTY')")
    public ResponseEntity<VideoSessionResponse> getSessionDetails(@PathVariable String roomId) {
        VideoSessionResponse response = videoSessionService.getSessionDetails(roomId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/teacher/{teacherId}")
    @PreAuthorize("hasAnyRole('FACULTY','ADMIN')")
    public ResponseEntity<List<VideoSessionResponse>> getTeacherSessions(@PathVariable Long teacherId) {
        String teacherEmail = getCurrentUserEmail();
        List<VideoSessionResponse> responses = videoSessionService.getTeacherSessions(teacherEmail);
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/zego/token")
    @PreAuthorize("hasRole('STUDENT') or hasRole('FACULTY')")
    public ResponseEntity<ZegoTokenResponse> generateZegoToken(@Valid @RequestBody ZegoTokenRequest request) {
        String userId = getCurrentUserId().toString();
        ZegoTokenResponse response = zegoCloudService.generateToken(request.getRoomId(), userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{roomId}/start")
    @PreAuthorize("hasAnyRole('FACULTY','ADMIN')")
    public ResponseEntity<VideoSessionResponse> startSession(@PathVariable String roomId) {
        String actorEmail = getCurrentUserEmail();
        VideoSessionResponse response = videoSessionService.startSession(roomId, actorEmail);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{roomId}/end")
    @PreAuthorize("hasAnyRole('FACULTY','ADMIN')")
    public ResponseEntity<VideoSessionResponse> endSession(@PathVariable String roomId) {
        String actorEmail = getCurrentUserEmail();
        VideoSessionResponse response = videoSessionService.endSession(roomId, actorEmail);
        return ResponseEntity.ok(response);
    }

    private String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getName();
    }

    private Long getCurrentUserId() {
        String email = getCurrentUserEmail();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}