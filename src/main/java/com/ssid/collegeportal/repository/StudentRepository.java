package com.ssid.collegeportal.repository;

import com.ssid.collegeportal.model.Student;
import com.ssid.collegeportal.model.Branch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Student findByUserId(Long userId);

    Student findByUserEmail(String email);

    List<Student> findByBranch(Branch branch);

    List<Student> findByBranchId(Long branchId);
}