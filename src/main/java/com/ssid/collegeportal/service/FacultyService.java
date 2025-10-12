package com.ssid.collegeportal.service;

import com.ssid.collegeportal.model.Faculty;
import com.ssid.collegeportal.repository.FacultyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FacultyService {
    @Autowired
    private FacultyRepository facultyRepository;

    public List<Faculty> getAllFaculties() {
        return facultyRepository.findAll();
    }

    public Optional<Faculty> getFacultyById(Long id) {
        return facultyRepository.findById(id);
    }

    public Faculty createFaculty(Faculty faculty) {
        return facultyRepository.save(faculty);
    }

    public Faculty updateFaculty(Long id, Faculty facultyDetails) {
        return facultyRepository.findById(id).map(faculty -> {
            faculty.setUser(facultyDetails.getUser());
            faculty.setBranch(facultyDetails.getBranch());
            // Add more fields as needed
            return facultyRepository.save(faculty);
        }).orElseThrow(() -> new RuntimeException("Faculty not found"));
    }

    public void deleteFaculty(Long id) {
        facultyRepository.deleteById(id);
    }
}