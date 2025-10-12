-- V4__Create_video_sessions_table.sql
CREATE TABLE video_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    room_id VARCHAR(255) NOT NULL UNIQUE,
    teacher_id BIGINT NOT NULL,
    scheduled_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    subject VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id)
);

CREATE TABLE video_session_participants (
    video_session_id BIGINT NOT NULL,
    participant_id BIGINT NOT NULL,
    PRIMARY KEY (video_session_id, participant_id),
    FOREIGN KEY (video_session_id) REFERENCES video_sessions(id),
    FOREIGN KEY (participant_id) REFERENCES users(id)
);