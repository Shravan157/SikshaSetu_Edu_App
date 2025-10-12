package com.ssid.collegeportal.config;

import com.ssid.collegeportal.model.Role;
import com.ssid.collegeportal.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Override
    public void run(String... args) throws Exception {
        // Initialize roles if they don't exist
        if (roleRepository.findByName("ADMIN").isEmpty()) {
            Role adminRole = new Role("ADMIN");
            roleRepository.save(adminRole);
            System.out.println("Created ADMIN role");
        }

        if (roleRepository.findByName("FACULTY").isEmpty()) {
            Role facultyRole = new Role("FACULTY");
            roleRepository.save(facultyRole);
            System.out.println("Created FACULTY role");
        }

        if (roleRepository.findByName("STUDENT").isEmpty()) {
            Role studentRole = new Role("STUDENT");
            roleRepository.save(studentRole);
            System.out.println("Created STUDENT role");
        }

        System.out.println("Role initialization completed");
    }
}
