package com.ssid.collegeportal.repository;

import com.ssid.collegeportal.model.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FacultyRepository extends JpaRepository<Faculty, Long> {
}