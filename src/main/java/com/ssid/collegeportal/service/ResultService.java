package com.ssid.collegeportal.service;

import com.ssid.collegeportal.dto.ResultRequestDTO;
import com.ssid.collegeportal.model.Result;
import com.ssid.collegeportal.model.Student;
import com.ssid.collegeportal.repository.ResultRepository;
import com.ssid.collegeportal.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ResultService {
    @Autowired
    private ResultRepository resultRepository;
    @Autowired
    private StudentRepository studentRepository;

    public List<Result> getAllResults() {
        return resultRepository.findAll();
    }

    public Optional<Result> getResultById(Long id) {
        return resultRepository.findById(id);
    }

    public List<Result> getResultsByStudentId(Long studentId) {
        return resultRepository.findAll().stream()
                .filter(r -> r.getStudent() != null && r.getStudent().getId().equals(studentId))
                .toList();
    }

    public Result createResult(ResultRequestDTO dto) {
        // Validate student exists
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found with ID: " + dto.getStudentId()));

        // Validate marks range
        if (dto.getMarks() < 0 || dto.getMarks() > 100) {
            throw new RuntimeException("Marks must be between 0 and 100");
        }

        // Validate subject is not empty
        if (dto.getSubject() == null || dto.getSubject().trim().isEmpty()) {
            throw new RuntimeException("Subject cannot be empty");
        }

        Result result = new Result();
        result.setStudent(student);
        result.setSubject(dto.getSubject().trim());
        result.setMarks(dto.getMarks());
        return resultRepository.save(result);
    }

    public Result updateResult(Long id, ResultRequestDTO dto) {
        Result result = resultRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Result not found with ID: " + id));

        // Validate student exists
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found with ID: " + dto.getStudentId()));

        // Validate marks range
        if (dto.getMarks() < 0 || dto.getMarks() > 100) {
            throw new RuntimeException("Marks must be between 0 and 100");
        }

        // Validate subject is not empty
        if (dto.getSubject() == null || dto.getSubject().trim().isEmpty()) {
            throw new RuntimeException("Subject cannot be empty");
        }

        result.setStudent(student);
        result.setSubject(dto.getSubject().trim());
        result.setMarks(dto.getMarks());
        return resultRepository.save(result);
    }

    public void deleteResult(Long id) {
        resultRepository.deleteById(id);
    }
}
