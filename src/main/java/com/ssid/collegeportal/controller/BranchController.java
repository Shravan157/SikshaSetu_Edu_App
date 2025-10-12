package com.ssid.collegeportal.controller;

import com.ssid.collegeportal.dto.BranchRequestDTO;
import com.ssid.collegeportal.dto.BranchResponseDTO;
import com.ssid.collegeportal.model.Branch;
import com.ssid.collegeportal.service.BranchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/branches")
public class BranchController {
    @Autowired
    private BranchService branchService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'STUDENT')")
    public List<BranchResponseDTO> getAllBranches() {
        return branchService.getAllBranches().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public ResponseEntity<BranchResponseDTO> getBranchById(@PathVariable Long id) {
        return branchService.getBranchById(id)
                .map(this::toResponseDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public BranchResponseDTO createBranch(@Valid @RequestBody BranchRequestDTO dto) {
        Branch branch = new Branch();
        branch.setName(dto.getName());
        Branch saved = branchService.createBranch(branch);
        return toResponseDTO(saved);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BranchResponseDTO> updateBranch(@PathVariable Long id,
            @Valid @RequestBody BranchRequestDTO dto) {
        try {
            Branch branch = new Branch();
            branch.setName(dto.getName());
            Branch updated = branchService.updateBranch(id, branch);
            return ResponseEntity.ok(toResponseDTO(updated));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBranch(@PathVariable Long id) {
        branchService.deleteBranch(id);
        return ResponseEntity.noContent().build();
    }

    private BranchResponseDTO toResponseDTO(Branch branch) {
        BranchResponseDTO dto = new BranchResponseDTO();
        dto.setId(branch.getId());
        dto.setName(branch.getName());
        return dto;
    }
}