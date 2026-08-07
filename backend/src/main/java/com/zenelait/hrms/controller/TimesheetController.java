package com.zenelait.hrms.controller;

import com.zenelait.hrms.entity.Timesheet;
import com.zenelait.hrms.repository.TimesheetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/timesheets")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class TimesheetController {

    @Autowired
    private TimesheetRepository timesheetRepository;

    @GetMapping
    public ResponseEntity<?> getTimesheets(@RequestParam Long orgId) {
        List<Timesheet> list = timesheetRepository.findByOrganizationId(orgId);
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<?> saveTimesheet(@RequestBody Timesheet req) {
        if (req.getUsername() == null || req.getProjectName() == null ||
            req.getTaskDescription() == null || req.getHoursLogged() == null ||
            req.getWeekStartDate() == null || req.getOrganizationId() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing required fields: username, projectName, taskDescription, hoursLogged, weekStartDate, organizationId"));
        }
        
        if (req.getId() != null) {
            Optional<Timesheet> opt = timesheetRepository.findById(req.getId());
            if (opt.isPresent()) {
                Timesheet existing = opt.get();
                if (req.getStatus() != null) {
                    existing.setStatus(req.getStatus());
                }
                Timesheet saved = timesheetRepository.save(existing);
                return ResponseEntity.ok(saved);
            }
        }
        
        if (req.getStatus() == null) {
            req.setStatus("Pending");
        }
        if (req.getBillable() == null) {
            req.setBillable(true);
        }
        
        Timesheet saved = timesheetRepository.save(req);
        return ResponseEntity.ok(saved);
    }
}
