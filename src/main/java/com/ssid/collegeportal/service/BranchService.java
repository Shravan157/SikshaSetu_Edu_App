package com.ssid.collegeportal.service;

import com.ssid.collegeportal.model.Branch;
import com.ssid.collegeportal.repository.BranchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BranchService {
    @Autowired
    private BranchRepository branchRepository;

    public List<Branch> getAllBranches() {
        return branchRepository.findAll();
    }

    public Optional<Branch> getBranchById(Long id) {
        return branchRepository.findById(id);
    }

    public Branch createBranch(Branch branch) {
        return branchRepository.save(branch);
    }

    public Branch updateBranch(Long id, Branch branchDetails) {
        return branchRepository.findById(id).map(branch -> {
            branch.setName(branchDetails.getName());
            // Add more fields as needed
            return branchRepository.save(branch);
        }).orElseThrow(() -> new RuntimeException("Branch not found"));
    }

    public void deleteBranch(Long id) {
        branchRepository.deleteById(id);
    }
}