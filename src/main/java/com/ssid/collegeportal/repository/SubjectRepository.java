package com.ssid.collegeportal.repository;

import com.ssid.collegeportal.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubjectRepository extends JpaRepository<Subject, Long> {
}