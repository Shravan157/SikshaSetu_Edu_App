package com.ssid.collegeportal.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Branch {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name; // e.g., CSE, ECE

    @OneToMany(mappedBy = "branch")
    private List<Student> students;

    @OneToMany(mappedBy = "branch")
    private List<Faculty> faculties;
}