package com.zenelait.hrms.controller;

import com.zenelait.hrms.entity.Payroll;
import com.zenelait.hrms.entity.Organization;
import com.zenelait.hrms.entity.User;
import com.zenelait.hrms.entity.Attendance;
import com.zenelait.hrms.repository.PayrollRepository;
import com.zenelait.hrms.repository.OrganizationRepository;
import com.zenelait.hrms.repository.UserRepository;
import com.zenelait.hrms.repository.AttendanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/payroll")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class PayrollController {

    @Autowired
    private PayrollRepository payrollRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @GetMapping
    public ResponseEntity<?> getPayroll(@RequestParam(required = false) Long orgId) {
        if (orgId == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Parameter 'orgId' is required"));
        }
        List<Payroll> sheets = payrollRepository.findByOrganizationId(orgId);
        return ResponseEntity.ok(sheets);
    }

    @PostMapping("/process")
    public ResponseEntity<?> processPayroll(@RequestParam(required = false) Long orgId, @RequestBody List<Map<String, Object>> payload) {
        if (orgId == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Parameter 'orgId' is required"));
        }
        if (payload == null || payload.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Payload cannot be empty"));
        }

        Optional<Organization> orgOpt = organizationRepository.findById(orgId);
        if (!orgOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Organization not found"));
        }

        try {
            for (Map<String, Object> item : payload) {
                String username = (String) item.get("username");
                Number basicNum = (Number) item.get("basic");
                Number allowanceNum = (Number) item.get("allowance");
                Number deductionsNum = (Number) item.get("deductions");
                String status = (String) item.get("status");

                if (username == null || basicNum == null || allowanceNum == null || deductionsNum == null || status == null) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Missing required fields on payload items"));
                }

                double basic = basicNum.doubleValue();
                double allowance = allowanceNum.doubleValue();
                double deductions = deductionsNum.doubleValue();

                Optional<Payroll> existing = payrollRepository.findByUsernameAndOrganizationId(username, orgId);
                Payroll record;
                if (existing.isPresent()) {
                    record = existing.get();
                    record.setBasic(basic);
                    record.setAllowance(allowance);
                    record.setDeductions(deductions);
                    record.setStatus(status);
                } else {
                    record = Payroll.builder()
                            .username(username)
                            .basic(basic)
                            .allowance(allowance)
                            .deductions(deductions)
                            .status(status)
                            .organization(orgOpt.get())
                            .build();
                }
                payrollRepository.save(record);
            }
            return ResponseEntity.ok(Map.of("message", "Payroll stubs processed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to process payroll: " + e.getMessage()));
        }
    }

    @GetMapping("/calculate")
    public ResponseEntity<?> calculatePayroll(@RequestParam(required = false) Long orgId) {
        if (orgId == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Parameter 'orgId' is required"));
        }
        Optional<Organization> orgOpt = organizationRepository.findById(orgId);
        if (!orgOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Organization not found"));
        }

        List<User> users = userRepository.findByOrganizationId(orgId);
        List<Attendance> attendances = attendanceRepository.findByOrganizationId(orgId);

        List<Map<String, Object>> proposedPayroll = new java.util.ArrayList<>();

        for (User user : users) {
            if ("SUPERADMIN".equalsIgnoreCase(user.getRole())) {
                continue;
            }
            double baseBasic = "ADMIN".equalsIgnoreCase(user.getRole()) ? 50000.0 : 25000.0;
            double baseAllowance = "ADMIN".equalsIgnoreCase(user.getRole()) ? 10000.0 : 5000.0;

            // Count absent days
            long absentCount = attendances.stream()
                    .filter(a -> a.getUsername().equals(user.getUsername()))
                    .filter(a -> "Absent".equalsIgnoreCase(a.getStatus()))
                    .count();

            double deductions = Math.round((baseBasic / 30.0) * absentCount);

            proposedPayroll.add(Map.of(
                "username", user.getUsername(),
                "basic", baseBasic,
                "allowance", baseAllowance,
                "deductions", deductions,
                "status", "Processed"
            ));
        }

        return ResponseEntity.ok(proposedPayroll);
    }
}
