package com.zenelait.hrms.controller;

import com.zenelait.hrms.entity.Project;
import com.zenelait.hrms.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/projects")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class ProjectController {

    @Autowired
    private ProjectRepository projectRepository;

    @GetMapping
    public ResponseEntity<?> getProjects(@RequestParam Long orgId) {
        List<Project> projects = projectRepository.findByOrganizationId(orgId);
        return ResponseEntity.ok(projects);
    }

    @PostMapping
    public ResponseEntity<?> saveProject(@RequestBody Map<String, Object> payload) {
        Number idNum = (Number) payload.get("id");
        String name = (String) payload.get("name");
        String description = (String) payload.get("description");
        Number budgetNum = (Number) payload.get("budget");
        Number spentNum = (Number) payload.get("spent");
        String owner = (String) payload.get("owner");
        String status = (String) payload.get("status");
        String teamMembers = (String) payload.get("teamMembers");
        String milestones = (String) payload.get("milestones");
        Number orgIdNum = (Number) payload.get("organizationId");

        if (name == null || budgetNum == null || spentNum == null || owner == null || status == null || orgIdNum == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Required fields: name, budget, spent, owner, status, organizationId"));
        }

        Project project;
        if (idNum != null) {
            Optional<Project> existing = projectRepository.findById(idNum.longValue());
            if (existing.isPresent()) {
                project = existing.get();
            } else {
                project = new Project();
            }
        } else {
            project = new Project();
        }

        project.setName(name);
        project.setDescription(description != null ? description : "");
        project.setBudget(budgetNum.doubleValue());
        project.setSpent(spentNum.doubleValue());
        project.setOwner(owner);
        project.setStatus(status.toUpperCase());
        project.setTeamMembers(teamMembers != null ? teamMembers : "");
        project.setMilestones(milestones != null ? milestones : "");
        project.setOrganizationId(orgIdNum.longValue());

        projectRepository.save(project);
        return ResponseEntity.ok(project);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProject(@PathVariable Long id) {
        if (!projectRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Project not found"));
        }
        projectRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Project deleted successfully"));
    }
}
