package com.zenelait.hrms.controller;

import com.zenelait.hrms.entity.TravelRequest;
import com.zenelait.hrms.repository.TravelRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/travel")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class TravelController {

    @Autowired
    private TravelRequestRepository travelRequestRepository;

    @GetMapping
    public ResponseEntity<?> getTravelRequests(@RequestParam Long orgId) {
        List<TravelRequest> list = travelRequestRepository.findByOrganizationId(orgId);
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<?> saveTravelRequest(@RequestBody TravelRequest req) {
        if (req.getUsername() == null || req.getDestination() == null ||
            req.getPurpose() == null || req.getStartDate() == null ||
            req.getEndDate() == null || req.getEstimatedCost() == null ||
            req.getOrganizationId() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing required fields: username, destination, purpose, startDate, endDate, estimatedCost, organizationId"));
        }
        
        if (req.getId() != null) {
            Optional<TravelRequest> opt = travelRequestRepository.findById(req.getId());
            if (opt.isPresent()) {
                TravelRequest existing = opt.get();
                if (req.getStatus() != null) {
                    existing.setStatus(req.getStatus());
                }
                if (req.getAdvanceDisbursement() != null) {
                    existing.setAdvanceDisbursement(req.getAdvanceDisbursement());
                }
                TravelRequest saved = travelRequestRepository.save(existing);
                return ResponseEntity.ok(saved);
            }
        }
        
        if (req.getStatus() == null) {
            req.setStatus("Pending");
        }
        if (req.getAdvanceDisbursement() == null) {
            req.setAdvanceDisbursement(0.0);
        }
        
        TravelRequest saved = travelRequestRepository.save(req);
        return ResponseEntity.ok(saved);
    }
}
