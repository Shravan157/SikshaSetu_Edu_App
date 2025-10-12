package com.ssid.collegeportal.service;

import com.ssid.collegeportal.dto.CreateVideoSessionRequest;
import com.ssid.collegeportal.dto.VideoSessionResponse;
import com.ssid.collegeportal.model.SessionStatus;
import com.ssid.collegeportal.model.User;
import com.ssid.collegeportal.model.VideoSession;
import com.ssid.collegeportal.repository.UserRepository;
import com.ssid.collegeportal.repository.VideoSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class VideoSessionService {

    @Autowired
    private VideoSessionRepository videoSessionRepository;

    @Autowired
    private UserRepository userRepository;

    public VideoSessionResponse createSession(CreateVideoSessionRequest request, String teacherEmail) {
        User teacher = userRepository.findByEmail(teacherEmail)
            .orElseThrow(() -> new RuntimeException("Teacher not found"));

        if (!teacher.getRoles().stream().anyMatch(r -> r.getName().equals("FACULTY"))) {
            throw new RuntimeException("Only faculty can create sessions");
        }

        VideoSession session = new VideoSession();
        session.setRoomId(generateRoomId());
        session.setTeacher(teacher);
        session.setSubject(request.getSubject());
        session.setScheduledTime(request.getScheduledTime());
        session.setEndTime(request.getScheduledTime().plusMinutes(request.getDurationMinutes()));
        session.setStatus(SessionStatus.SCHEDULED);

        VideoSession saved = videoSessionRepository.save(session);
        return mapToResponse(saved);
    }

    public VideoSessionResponse joinSession(String roomId, String userEmail) {
        VideoSession session = videoSessionRepository.findByRoomId(roomId)
            .orElseThrow(() -> new RuntimeException("Session not found"));

        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (!session.getParticipantIds().contains(user.getId())) {
            session.getParticipantIds().add(user.getId());
            videoSessionRepository.save(session);
        }

        // Activate session if scheduled time reached
        if (session.getStatus() == SessionStatus.SCHEDULED &&
            LocalDateTime.now().isAfter(session.getScheduledTime())) {
            session.setStatus(SessionStatus.ACTIVE);
            videoSessionRepository.save(session);
        }

        return mapToResponse(session);
    }

    public List<VideoSessionResponse> getTeacherSessions(String teacherEmail) {
        User teacher = userRepository.findByEmail(teacherEmail)
            .orElseThrow(() -> new RuntimeException("Teacher not found"));

        List<VideoSession> sessions = videoSessionRepository.findByTeacherId(teacher.getId());
        return sessions.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public VideoSessionResponse getSessionDetails(String roomId) {
        VideoSession session = videoSessionRepository.findByRoomId(roomId)
            .orElseThrow(() -> new RuntimeException("Session not found"));
        return mapToResponse(session);
    }

    public VideoSessionResponse startSession(String roomId, String actorEmail) {
        VideoSession session = videoSessionRepository.findByRoomId(roomId)
            .orElseThrow(() -> new RuntimeException("Session not found"));
        User actor = userRepository.findByEmail(actorEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        boolean isAdmin = actor.getRoles().stream().anyMatch(r -> r.getName().equals("ADMIN"));
        boolean isTeacher = session.getTeacher() != null && session.getTeacher().getId().equals(actor.getId());
        if (!isAdmin && !isTeacher) {
            throw new RuntimeException("Only the assigned teacher or admin can start this session");
        }
        if (session.getStatus() != SessionStatus.ACTIVE) {
            session.setStatus(SessionStatus.ACTIVE);
            videoSessionRepository.save(session);
        }
        return mapToResponse(session);
    }

    public VideoSessionResponse endSession(String roomId, String actorEmail) {
        VideoSession session = videoSessionRepository.findByRoomId(roomId)
            .orElseThrow(() -> new RuntimeException("Session not found"));
        User actor = userRepository.findByEmail(actorEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        boolean isAdmin = actor.getRoles().stream().anyMatch(r -> r.getName().equals("ADMIN"));
        boolean isTeacher = session.getTeacher() != null && session.getTeacher().getId().equals(actor.getId());
        if (!isAdmin && !isTeacher) {
            throw new RuntimeException("Only the assigned teacher or admin can end this session");
        }
        if (session.getStatus() != SessionStatus.ENDED) {
            session.setStatus(SessionStatus.ENDED);
            videoSessionRepository.save(session);
        }
        return mapToResponse(session);
    }

    private String generateRoomId() {
        return "room_" + UUID.randomUUID().toString().substring(0, 8);
    }

    private VideoSessionResponse mapToResponse(VideoSession session) {
        VideoSessionResponse response = new VideoSessionResponse();
        response.setId(session.getId());
        response.setRoomId(session.getRoomId());
        response.setTeacherId(session.getTeacher().getId());
        response.setTeacherName(session.getTeacher().getName());
        response.setScheduledTime(session.getScheduledTime());
        response.setEndTime(session.getEndTime());
        response.setSubject(session.getSubject());
        response.setParticipantIds(session.getParticipantIds());
        response.setStatus(session.getStatus());
        response.setCreatedAt(session.getCreatedAt());
        return response;
    }
}
