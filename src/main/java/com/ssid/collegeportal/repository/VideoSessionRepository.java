package com.ssid.collegeportal.repository;

import com.ssid.collegeportal.model.VideoSession;
import com.ssid.collegeportal.model.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VideoSessionRepository extends JpaRepository<VideoSession, Long> {
    Optional<VideoSession> findByRoomId(String roomId);
    List<VideoSession> findByTeacherId(Long teacherId);
    List<VideoSession> findByStatus(SessionStatus status);
    List<VideoSession> findByScheduledTimeBetween(LocalDateTime start, LocalDateTime end);
    @Query("SELECT vs FROM VideoSession vs WHERE :userId MEMBER OF vs.participantIds")
    List<VideoSession> findByParticipantId(@Param("userId") Long userId);
}