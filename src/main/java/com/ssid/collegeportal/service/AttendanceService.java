package com.ssid.collegeportal.service;

import com.ssid.collegeportal.dto.AttendanceRequestDTO;
import com.ssid.collegeportal.model.Attendance;
import com.ssid.collegeportal.model.Faculty;
import com.ssid.collegeportal.model.Student;
import com.ssid.collegeportal.repository.AttendanceRepository;
import com.ssid.collegeportal.repository.FacultyRepository;
import com.ssid.collegeportal.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AttendanceService {
    @Autowired
    private AttendanceRepository attendanceRepository;
    @Autowired
    private StudentRepository studentRepository;
    @Autowired
    private FacultyRepository facultyRepository;

    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAll();
    }

    public Optional<Attendance> getAttendanceById(Long id) {
        return attendanceRepository.findById(id);
    }

    public List<Attendance> getAttendanceByStudentId(Long studentId) {
        return attendanceRepository.findAll().stream()
                .filter(a -> a.getStudent() != null && a.getStudent().getId().equals(studentId))
                .toList();
    }

    public Attendance createAttendance(AttendanceRequestDTO dto) {
        Student student = studentRepository.findById(dto.getStudentId()).orElse(null);
        Faculty faculty = facultyRepository.findById(dto.getFacultyId()).orElse(null);
        Attendance attendance = new Attendance();
        attendance.setStudent(student);
        attendance.setFaculty(faculty);
        attendance.setDate(dto.getDate());
        attendance.setPresent(dto.getPresent());
        return attendanceRepository.save(attendance);
    }

    public Attendance updateAttendance(Long id, AttendanceRequestDTO dto) {
        Attendance attendance = attendanceRepository.findById(id).orElseThrow();
        Student student = studentRepository.findById(dto.getStudentId()).orElse(null);
        Faculty faculty = facultyRepository.findById(dto.getFacultyId()).orElse(null);
        attendance.setStudent(student);
        attendance.setFaculty(faculty);
        attendance.setDate(dto.getDate());
        attendance.setPresent(dto.getPresent());
        return attendanceRepository.save(attendance);
    }

    public void deleteAttendance(Long id) {
        attendanceRepository.deleteById(id);
    }
}
