package com.zenelait.hrms.controller;

import com.zenelait.hrms.entity.OnboardingTask;
import com.zenelait.hrms.repository.OnboardingTaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/onboarding")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class OnboardingController {

    @Autowired
    private OnboardingTaskRepository onboardingTaskRepository;

    @GetMapping
    public ResponseEntity<?> getOnboardingTasks(@RequestParam Long orgId, @RequestParam(required = false) String username) {
        if (username != null && !username.isEmpty()) {
            List<OnboardingTask> tasks = onboardingTaskRepository.findByUsernameAndOrganizationId(username, orgId);
            return ResponseEntity.ok(tasks);
        }
        List<OnboardingTask> tasks = onboardingTaskRepository.findByOrganizationId(orgId);
        return ResponseEntity.ok(tasks);
    }

    @PostMapping
    public ResponseEntity<?> createOnboardingTask(@RequestBody OnboardingTask task) {
        if (task.getUsername() == null || task.getTaskName() == null || 
            task.getCategory() == null || task.getOrganizationId() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing required fields: username, taskName, category, organizationId"));
        }
        if (task.getCompleted() == null) {
            task.setCompleted(false);
        }
        OnboardingTask saved = onboardingTaskRepository.save(task);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/toggle")
    public ResponseEntity<?> toggleOnboardingTask(@RequestBody Map<String, Object> request) {
        Number taskIdNum = (Number) request.get("taskId");
        Boolean completed = (Boolean) request.get("completed");

        if (taskIdNum == null || completed == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing parameters: taskId, completed"));
        }

        Optional<OnboardingTask> taskOpt = onboardingTaskRepository.findById(taskIdNum.longValue());
        if (!taskOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        OnboardingTask task = taskOpt.get();
        task.setCompleted(completed);
        onboardingTaskRepository.save(task);
        return ResponseEntity.ok(task);
    }

    @PostMapping("/seed")
    public ResponseEntity<?> seedOnboardingChecklist(@RequestBody Map<String, Object> request) {
        String username = (String) request.get("username");
        Number orgIdNum = (Number) request.get("organizationId");

        if (username == null || orgIdNum == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing parameters: username, organizationId"));
        }

        Long orgId = orgIdNum.longValue();

        // Check if there are already tasks for this user to avoid double seeding
        List<OnboardingTask> existing = onboardingTaskRepository.findByUsernameAndOrganizationId(username, orgId);
        if (!existing.isEmpty()) {
            return ResponseEntity.ok(existing);
        }

        List<OnboardingTask> seeded = new ArrayList<>();
        String[][] defaultTasks = {
            {"Submit W-4 tax declaration documents", "DOCUMENTS"},
            {"Provision corporate GSuite routing email", "PROVISIONING"},
            {"Assign company development laptop (MacBook Pro)", "ASSETS"},
            {"Register direct deposit bank details", "PAYROLL"},
            {"Meet team lead & review project sprint boards", "TEAM"},
            {"Day 1 onboarding welcome buddy coffee sync", "WELCOME"}
        };

        for (String[] def : defaultTasks) {
            OnboardingTask t = OnboardingTask.builder()
                    .username(username)
                    .taskName(def[0])
                    .category(def[1])
                    .completed(false)
                    .organizationId(orgId)
                    .build();
            seeded.add(onboardingTaskRepository.save(t));
        }

        return ResponseEntity.ok(seeded);
    }
}
