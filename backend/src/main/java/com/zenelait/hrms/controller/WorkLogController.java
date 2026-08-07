package com.zenelait.hrms.controller;

import com.zenelait.hrms.entity.WorkLog;
import com.zenelait.hrms.repository.WorkLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/worklogs")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class WorkLogController {

    @Autowired
    private WorkLogRepository workLogRepository;

    @GetMapping
    public ResponseEntity<?> getWorkLogs(@RequestParam Long orgId, @RequestParam(required = false) String username) {
        if (username != null && !username.trim().isEmpty()) {
            List<WorkLog> list = workLogRepository.findByUsernameAndOrganizationId(username, orgId);
            return ResponseEntity.ok(list);
        }
        List<WorkLog> list = workLogRepository.findByOrganizationId(orgId);
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<?> saveWorkLog(@RequestBody WorkLog workLog) {
        if (workLog.getUsername() == null || workLog.getLogDate() == null ||
            workLog.getWhatDone() == null || workLog.getWhatNext() == null ||
            workLog.getHoursSpent() == null || workLog.getOrganizationId() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing required fields: username, logDate, whatDone, whatNext, hoursSpent, organizationId"));
        }
        WorkLog saved = workLogRepository.save(workLog);
        return ResponseEntity.ok(saved);
    }
}
