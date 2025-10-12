package com.ssid.collegeportal.controller;

import com.ssid.collegeportal.dto.NotificationRequestDTO;
import com.ssid.collegeportal.dto.NotificationResponseDTO;
import com.ssid.collegeportal.model.Notification;
import com.ssid.collegeportal.model.User;
import com.ssid.collegeportal.service.NotificationService;
import com.ssid.collegeportal.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'STUDENT')")
    public List<NotificationResponseDTO> getAllNotifications() {
        return notificationService.getAllNotifications()
                .stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'STUDENT')")
    public ResponseEntity<NotificationResponseDTO> getNotificationById(@PathVariable Long id) {
        return notificationService.getNotificationById(id)
                .map(n -> ResponseEntity.ok(toResponseDTO(n)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public ResponseEntity<?> createNotification(@RequestBody NotificationRequestDTO dto) {
        String type = dto.getType() != null ? dto.getType() : "GENERAL";
        List<Notification> notifications = notificationService.createNotification(dto, type);

        if (notifications.isEmpty()) {
            return ResponseEntity.badRequest().body("No recipients found for the specified audience");
        }

        // Return the first notification for backward compatibility, but indicate how
        // many were created
        Map<String, Object> response = new HashMap<>();
        response.put("notification", toResponseDTO(notifications.get(0)));
        response.put("totalCreated", notifications.size());
        response.put("message", notifications.size() + " notification(s) created successfully");

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public NotificationResponseDTO updateNotification(@PathVariable Long id, @RequestBody NotificationRequestDTO dto) {
        return toResponseDTO(notificationService.updateNotification(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'STUDENT')")
    public Page<NotificationResponseDTO> getMyNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Boolean unread,
            @RequestParam(required = false) String type) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null)
            return Page.empty();
        Pageable pageable = PageRequest.of(page, size);
        return notificationService.getNotificationsForUser(user, unread, type, pageable)
                .map(this::toResponseDTO);
    }

    @PutMapping("/{id}/mark-read")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'STUDENT')")
    public ResponseEntity<Void> markNotificationAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/mark-all-read")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'STUDENT')")
    public ResponseEntity<Void> markAllNotificationsAsRead() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        notificationService.markAllAsReadForUser(user);
        return ResponseEntity.noContent().build();
    }

    private NotificationResponseDTO toResponseDTO(Notification notification) {
        NotificationResponseDTO dto = new NotificationResponseDTO();
        dto.setId(notification.getId());
        dto.setTitle(notification.getTitle());
        dto.setMessage(notification.getMessage());
        dto.setCreatedAt(notification.getCreatedAt());
        return dto;
    }
}
