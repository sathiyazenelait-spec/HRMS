package com.zenelait.hrms.controller;

import com.zenelait.hrms.entity.Sprint;
import com.zenelait.hrms.entity.Organization;
import com.zenelait.hrms.repository.SprintRepository;
import com.zenelait.hrms.repository.OrganizationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/sprints")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class SprintController {

    @Autowired
    private SprintRepository sprintRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @GetMapping
    public ResponseEntity<?> getSprints(@RequestParam(required = false) Long orgId) {
        if (orgId == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Parameter 'orgId' is required"));
        }
        List<Sprint> sprints = sprintRepository.findByOrganizationId(orgId);
        return ResponseEntity.ok(sprints);
    }

    @PostMapping("/create")
    public ResponseEntity<?> createSprint(@RequestParam(required = false) Long orgId, @RequestBody Map<String, Object> payload) {
        if (orgId == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Parameter 'orgId' is required"));
        }
        String name = (String) payload.get("name");
        String goal = (String) payload.get("goal");
        String startDateStr = (String) payload.get("startDate");
        String endDateStr = (String) payload.get("endDate");

        if (name == null || goal == null || startDateStr == null || endDateStr == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing required fields: name, goal, startDate, endDate"));
        }

        Optional<Organization> orgOpt = organizationRepository.findById(orgId);
        if (!orgOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Organization not found"));
        }

        try {
            LocalDate startDate = LocalDate.parse(startDateStr);
            LocalDate endDate = LocalDate.parse(endDateStr);

            Sprint sprint = Sprint.builder()
                    .name(name)
                    .goal(goal)
                    .startDate(startDate)
                    .endDate(endDate)
                    .status("Future")
                    .organization(orgOpt.get())
                    .build();

            sprintRepository.save(sprint);
            return ResponseEntity.ok(sprint);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid format: " + e.getMessage()));
        }
    }
}
