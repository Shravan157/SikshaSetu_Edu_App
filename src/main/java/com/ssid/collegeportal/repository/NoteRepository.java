package com.ssid.collegeportal.repository;

import com.ssid.collegeportal.model.Note;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NoteRepository extends JpaRepository<Note, Long> {
}
