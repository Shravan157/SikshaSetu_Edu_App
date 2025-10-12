package com.ssid.collegeportal.controller;

import com.ssid.collegeportal.dto.EventRequestDTO;
import com.ssid.collegeportal.dto.EventResponseDTO;
import com.ssid.collegeportal.model.Event;
import com.ssid.collegeportal.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/events")
public class EventController {
    @Autowired
    private EventService eventService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'STUDENT')")
    public List<EventResponseDTO> getAllEvents() {
        return eventService.getAllEvents().stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'STUDENT')")
    public ResponseEntity<EventResponseDTO> getEventById(@PathVariable Long id) {
        return eventService.getEventById(id)
                .map(e -> ResponseEntity.ok(toResponseDTO(e)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public EventResponseDTO createEvent(@ModelAttribute EventRequestDTO dto) {
        handleAttachment(dto);
        return toResponseDTO(eventService.createEvent(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public EventResponseDTO updateEvent(@PathVariable Long id, @ModelAttribute EventRequestDTO dto) {
        handleAttachment(dto);
        return toResponseDTO(eventService.updateEvent(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }

    private EventResponseDTO toResponseDTO(Event event) {
        EventResponseDTO dto = new EventResponseDTO();
        dto.setId(event.getId());
        dto.setTitle(event.getTitle());
        dto.setDescription(event.getDescription());
        dto.setEventDate(event.getEventDate());
        dto.setLocation(event.getLocation());
        dto.setAttachmentUrl(event.getAttachmentPath() != null ? "/api/events/attachment/" + event.getId() : null);
        return dto;
    }

    // Handle file upload for EventRequestDTO
    private void handleAttachment(EventRequestDTO dto) {
        MultipartFile file = dto.getAttachment();
        if (file != null && !file.isEmpty()) {
            String uploadDir = System.getProperty("user.dir") + File.separator + "uploads";
            try {
                Files.createDirectories(Paths.get(uploadDir));
                String filename = System.currentTimeMillis() + "_" + StringUtils.cleanPath(file.getOriginalFilename());
                Path targetPath = Paths.get(uploadDir).resolve(filename).normalize();
                Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
                dto.setAttachmentPath(filename);
            } catch (IOException e) {
                throw new RuntimeException("Failed to store attachment", e);
            }
        }
    }

    @GetMapping("/attachment/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'STUDENT')")
    public ResponseEntity<byte[]> downloadAttachment(@PathVariable Long id) {
        Event event = eventService.getEventById(id).orElse(null);
        if (event == null || event.getAttachmentPath() == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        String uploadDir = System.getProperty("user.dir") + File.separator + "uploads";
        Path filePath = Paths.get(uploadDir).resolve(event.getAttachmentPath()).normalize();
        try {
            byte[] fileBytes = Files.readAllBytes(filePath);
            String filename = event.getAttachmentPath();
            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=" + filename)
                    .body(fileBytes);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }
}
