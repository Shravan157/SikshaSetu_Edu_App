package com.ssid.collegeportal.repository;

import com.ssid.collegeportal.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
}