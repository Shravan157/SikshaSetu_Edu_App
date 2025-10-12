package com.ssid.collegeportal.repository;

import com.ssid.collegeportal.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventRepository extends JpaRepository<Event, Long> {
}