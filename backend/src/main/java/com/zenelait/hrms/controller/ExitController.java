package com.zenelait.hrms.controller;

import com.zenelait.hrms.entity.ExitRequest;
import com.zenelait.hrms.repository.ExitRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/exit")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class ExitController {

    @Autowired
    private ExitRequestRepository exitRequestRepository;

    @GetMapping
    public ResponseEntity<?> getExitRequests(@RequestParam Long orgId, @RequestParam(required = false) String username) {
        if (username != null && !username.trim().isEmpty()) {
            Optional<ExitRequest> opt = exitRequestRepository.findByUsernameAndOrganizationId(username, orgId);
            if (opt.isPresent()) {
                return ResponseEntity.ok(List.of(opt.get()));
            }
            return ResponseEntity.ok(List.of());
        }
        List<ExitRequest> list = exitRequestRepository.findByOrganizationId(orgId);
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<?> saveExitRequest(@RequestBody ExitRequest req) {
        if (req.getUsername() == null || req.getReason() == null ||
            req.getResignationDate() == null || req.getLastWorkingDay() == null ||
            req.getOrganizationId() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing required fields: username, reason, resignationDate, lastWorkingDay, organizationId"));
        }
        
        // Handle editing status or clearance
        if (req.getId() != null) {
            Optional<ExitRequest> opt = exitRequestRepository.findById(req.getId());
            if (opt.isPresent()) {
                ExitRequest existing = opt.get();
                if (req.getStatus() != null) {
                    existing.setStatus(req.getStatus());
                }
                if (req.getDepartmentClearance() != null) {
                    existing.setDepartmentClearance(req.getDepartmentClearance());
                }
                if (req.getItClearance() != null) {
                    existing.setItClearance(req.getItClearance());
                }
                if (req.getFinanceClearance() != null) {
                    existing.setFinanceClearance(req.getFinanceClearance());
                }
                
                // If all clearances are set, transition status to Completed
                if ("Cleared".equals(existing.getDepartmentClearance()) &&
                    "Cleared".equals(existing.getItClearance()) &&
                    "Cleared".equals(existing.getFinanceClearance())) {
                    existing.setStatus("Completed");
                }
                
                ExitRequest saved = exitRequestRepository.save(existing);
                return ResponseEntity.ok(saved);
            }
        }
        
        if (req.getStatus() == null) {
            req.setStatus("Pending");
        }
        if (req.getDepartmentClearance() == null) {
            req.setDepartmentClearance("Pending");
        }
        if (req.getItClearance() == null) {
            req.setItClearance("Pending");
        }
        if (req.getFinanceClearance() == null) {
            req.setFinanceClearance("Pending");
        }
        
        ExitRequest saved = exitRequestRepository.save(req);
        return ResponseEntity.ok(saved);
    }
}
