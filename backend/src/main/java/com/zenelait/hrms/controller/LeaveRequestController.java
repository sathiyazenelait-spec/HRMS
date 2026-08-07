package com.zenelait.hrms.controller;

import com.zenelait.hrms.entity.LeaveRequest;
import com.zenelait.hrms.repository.LeaveRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/leaves")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class LeaveRequestController {

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @GetMapping
    public ResponseEntity<?> getLeaves(@RequestParam Long orgId, @RequestParam(required = false) String username) {
        if (username != null && !username.trim().isEmpty()) {
            List<LeaveRequest> list = leaveRequestRepository.findByUsernameAndOrganizationId(username, orgId);
            return ResponseEntity.ok(list);
        } else {
            List<LeaveRequest> list = leaveRequestRepository.findByOrganizationId(orgId);
            return ResponseEntity.ok(list);
        }
    }

    @PostMapping
    public ResponseEntity<?> requestLeave(@RequestBody Map<String, Object> payload) {
        String username = (String) payload.get("username");
        String type = (String) payload.get("type");
        Number durationNum = (Number) payload.get("duration");
        Number orgIdNum = (Number) payload.get("organizationId");

        if (username == null || type == null || durationNum == null || orgIdNum == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing required fields: username, type, duration, organizationId"));
        }

        LeaveRequest lr = LeaveRequest.builder()
                .username(username)
                .type(type)
                .duration(durationNum.intValue())
                .status("PENDING")
                .requestedAt(LocalDate.now())
                .organizationId(orgIdNum.longValue())
                .build();

        leaveRequestRepository.save(lr);
        return ResponseEntity.ok(lr);
    }

    @PostMapping("/approve")
    public ResponseEntity<?> approveLeave(@RequestBody Map<String, Object> payload) {
        Number idNum = (Number) payload.get("id");
        String status = (String) payload.get("status"); // APPROVED or REJECTED

        if (idNum == null || status == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing required parameters: id, status"));
        }

        Optional<LeaveRequest> existing = leaveRequestRepository.findById(idNum.longValue());
        if (!existing.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Leave request not found"));
        }

        LeaveRequest lr = existing.get();
        lr.setStatus(status.toUpperCase());
        leaveRequestRepository.save(lr);
        return ResponseEntity.ok(lr);
    }
}
