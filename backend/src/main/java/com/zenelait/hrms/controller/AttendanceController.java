package com.zenelait.hrms.controller;

import com.zenelait.hrms.entity.Attendance;
import com.zenelait.hrms.entity.Organization;
import com.zenelait.hrms.repository.AttendanceRepository;
import com.zenelait.hrms.repository.OrganizationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/attendance")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AttendanceController {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @GetMapping
    public ResponseEntity<?> getAttendance(@RequestParam(required = false) Long orgId) {
        if (orgId == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Parameter 'orgId' is required"));
        }
        List<Attendance> records = attendanceRepository.findByOrganizationId(orgId);
        return ResponseEntity.ok(records);
    }

    @PostMapping("/save")
    public ResponseEntity<?> saveBulkAttendance(@RequestParam(required = false) Long orgId, @RequestBody List<Map<String, Object>> payload) {
        if (payload == null || payload.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Payload cannot be empty"));
        }

        try {
            Long targetOrgId = (orgId != null) ? orgId : 1L;
            Optional<Organization> orgOpt = organizationRepository.findById(targetOrgId);
            if (!orgOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Organization not found"));
            }

            for (Map<String, Object> recordMap : payload) {
                String username = (String) recordMap.get("username");
                String dateStr = (String) recordMap.get("date");
                String status = (String) recordMap.get("status");

                if (username == null || dateStr == null || status == null) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Missing required fields: username, date, status"));
                }

                LocalDate date = LocalDate.parse(dateStr);
                Optional<Attendance> existing = attendanceRepository.findByUsernameAndDateAndOrganizationId(username, date, targetOrgId);
                Attendance record;
                if (existing.isPresent()) {
                    record = existing.get();
                    record.setStatus(status);
                } else {
                    record = Attendance.builder()
                            .username(username)
                            .date(date)
                            .status(status)
                            .organization(orgOpt.get())
                            .build();
                }
                attendanceRepository.save(record);
            }
            return ResponseEntity.ok(Map.of("message", "Attendance records saved successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid format: " + e.getMessage()));
        }
    }

    @PostMapping("/clock")
    public ResponseEntity<?> clockInOut(@RequestBody Map<String, Object> request) {
        String username = (String) request.get("username");
        String status = (String) request.get("status"); // IN or OUT
        Number orgIdNum = (Number) request.get("organizationId");

        if (username == null || status == null || orgIdNum == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing required parameters: username, status, organizationId"));
        }

        Long orgId = orgIdNum.longValue();
        Optional<Organization> orgOpt = organizationRepository.findById(orgId);
        if (!orgOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Organization not found"));
        }

        LocalDate today = LocalDate.now();
        String timeStr = LocalTime.now().format(DateTimeFormatter.ofPattern("hh:mm a"));

        Optional<Attendance> existing = attendanceRepository.findByUsernameAndDateAndOrganizationId(username, today, orgId);
        Attendance record;

        if (status.equalsIgnoreCase("IN")) {
            if (existing.isPresent()) {
                record = existing.get();
                record.setStatus("Present");
                record.setTimeIn(timeStr);
            } else {
                record = Attendance.builder()
                        .username(username)
                        .date(today)
                        .status("Present")
                        .timeIn(timeStr)
                        .organization(orgOpt.get())
                        .build();
            }
        } else {
            // OUT
            if (existing.isPresent()) {
                record = existing.get();
                record.setStatus("Left");
                record.setTimeOut(timeStr);
            } else {
                record = Attendance.builder()
                        .username(username)
                        .date(today)
                        .status("Left")
                        .timeOut(timeStr)
                        .organization(orgOpt.get())
                        .build();
            }
        }

        attendanceRepository.save(record);
        return ResponseEntity.ok(record);
    }
}
