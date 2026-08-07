package com.zenelait.hrms.controller;

import com.zenelait.hrms.entity.Department;
import com.zenelait.hrms.entity.Squad;
import com.zenelait.hrms.entity.SquadMembership;
import com.zenelait.hrms.repository.DepartmentRepository;
import com.zenelait.hrms.repository.SquadMembershipRepository;
import com.zenelait.hrms.repository.SquadRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/teams")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class TeamController {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private SquadRepository squadRepository;

    @Autowired
    private SquadMembershipRepository squadMembershipRepository;

    // Departments API
    @GetMapping("/departments")
    public ResponseEntity<?> getDepartments(@RequestParam Long orgId) {
        List<Department> list = departmentRepository.findByOrganizationId(orgId);
        return ResponseEntity.ok(list);
    }

    @PostMapping("/departments")
    public ResponseEntity<?> saveDepartment(@RequestBody Department dept) {
        if (dept.getName() == null || dept.getOrganizationId() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing required fields: name, organizationId"));
        }
        Department saved = departmentRepository.save(dept);
        return ResponseEntity.ok(saved);
    }

    // Squads API
    @GetMapping("/squads")
    public ResponseEntity<?> getSquads(@RequestParam Long orgId, @RequestParam(required = false) Long departmentId) {
        if (departmentId != null) {
            List<Squad> list = squadRepository.findByDepartmentIdAndOrganizationId(departmentId, orgId);
            return ResponseEntity.ok(list);
        }
        List<Squad> list = squadRepository.findByOrganizationId(orgId);
        return ResponseEntity.ok(list);
    }

    @PostMapping("/squads")
    public ResponseEntity<?> saveSquad(@RequestBody Squad squad) {
        if (squad.getName() == null || squad.getDepartmentId() == null || squad.getOrganizationId() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing required fields: name, departmentId, organizationId"));
        }
        Squad saved = squadRepository.save(squad);
        return ResponseEntity.ok(saved);
    }

    // Squad memberships API
    @GetMapping("/memberships")
    public ResponseEntity<?> getMemberships(@RequestParam Long orgId, @RequestParam(required = false) Long squadId, @RequestParam(required = false) String username) {
        if (username != null && !username.trim().isEmpty()) {
            List<SquadMembership> list = squadMembershipRepository.findByUsernameAndOrganizationId(username, orgId);
            return ResponseEntity.ok(list);
        }
        if (squadId != null) {
            List<SquadMembership> list = squadMembershipRepository.findBySquadIdAndOrganizationId(squadId, orgId);
            return ResponseEntity.ok(list);
        }
        List<SquadMembership> list = squadMembershipRepository.findByOrganizationId(orgId);
        return ResponseEntity.ok(list);
    }

    @PostMapping("/memberships")
    public ResponseEntity<?> saveMembership(@RequestBody SquadMembership membership) {
        if (membership.getSquadId() == null || membership.getUsername() == null ||
            membership.getRoleTitle() == null || membership.getOrganizationId() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing required fields: squadId, username, roleTitle, organizationId"));
        }
        
        // If they specify membership ID, we edit it, otherwise create.
        if (membership.getId() != null) {
            Optional<SquadMembership> existingOpt = squadMembershipRepository.findById(membership.getId());
            if (existingOpt.isPresent()) {
                SquadMembership existing = existingOpt.get();
                existing.setRoleTitle(membership.getRoleTitle());
                existing.setAllocationPercentage(membership.getAllocationPercentage());
                SquadMembership saved = squadMembershipRepository.save(existing);
                return ResponseEntity.ok(saved);
            }
        }
        
        SquadMembership saved = squadMembershipRepository.save(membership);
        return ResponseEntity.ok(saved);
    }
}
