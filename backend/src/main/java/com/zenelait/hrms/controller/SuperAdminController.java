package com.zenelait.hrms.controller;

import com.zenelait.hrms.entity.Organization;
import com.zenelait.hrms.entity.User;
import com.zenelait.hrms.repository.OrganizationRepository;
import com.zenelait.hrms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.Year;
import java.util.List;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/superadmin")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class SuperAdminController {

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    // List all organizations. Uses Redis cache.
    @GetMapping("/organizations")
    @Cacheable(value = "organizations")
    public List<Organization> getOrganizations() {
        System.out.println("Fetching organizations from database (Cache Miss)...");
        return organizationRepository.findAll();
    }

    // Create a new organization. Clears Redis cache.
    @PostMapping("/organization")
    @CacheEvict(value = "organizations", allEntries = true)
    public ResponseEntity<?> createOrganization(@RequestBody Map<String, String> request) {
        try {
            String name = request.get("name");
            String orgType = request.get("orgType");
            String ownerGmail = request.get("ownerGmail");
            String ownerMobile = request.get("ownerMobile");
            String planType = request.get("planType");

            if (name == null || orgType == null || ownerGmail == null || ownerMobile == null || planType == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "All fields are required"));
            }

            if (organizationRepository.existsByNameIgnoreCase(name)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "Organization name already exists"));
            }

            // Generate Organization Code: HRMS[Year][5-digit random number]
            int currentYear = Year.now().getValue();
            int random5Digits = 10000 + new Random().nextInt(90000);
            String orgCode = "HRMS" + currentYear + random5Digits;

            // Generate 6-digit OTP
            int randomOtp = 100000 + new Random().nextInt(900000);
            String otpCode = String.valueOf(randomOtp);

            Organization org = Organization.builder()
                    .name(name)
                    .orgType(orgType.toUpperCase())
                    .orgCode(orgCode)
                    .ownerGmail(ownerGmail)
                    .ownerMobile(ownerMobile)
                    .planType(planType.toUpperCase())
                    .otpCode(otpCode)
                    .expiresAt(java.time.LocalDateTime.now().plusDays(30))
                    .build();

            Organization savedOrg = organizationRepository.save(org);

            // Publish creation event to Kafka topic (asynchronous task stream)
            String eventMessage = String.format("Organization Created: ID=%d, Name=%s, Code=%s, OTP=%s",
                    savedOrg.getId(), savedOrg.getName(), savedOrg.getOrgCode(), savedOrg.getOtpCode());
            kafkaTemplate.send("organization-creation-events", String.valueOf(savedOrg.getId()), eventMessage);

            return ResponseEntity.ok(savedOrg);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An error occurred: " + e.getMessage()));
        }
    }

    // Edit organization details. Clears Redis cache.
    @PutMapping("/organization/{id}")
    @CacheEvict(value = "organizations", allEntries = true)
    public ResponseEntity<?> updateOrganization(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            java.util.Optional<Organization> optionalOrg = organizationRepository.findById(id);
            if (optionalOrg.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Organization not found"));
            }
            Organization org = optionalOrg.get();
            if (request.containsKey("name")) org.setName(request.get("name"));
            if (request.containsKey("orgType")) org.setOrgType(request.get("orgType").toUpperCase());
            if (request.containsKey("ownerGmail")) org.setOwnerGmail(request.get("ownerGmail"));
            if (request.containsKey("ownerMobile")) org.setOwnerMobile(request.get("ownerMobile"));
            if (request.containsKey("planType")) org.setPlanType(request.get("planType").toUpperCase());
            if (request.containsKey("otpCode")) org.setOtpCode(request.get("otpCode"));

            Organization updatedOrg = organizationRepository.save(org);
            
            // Publish event to Kafka topic
            String msg = String.format("Organization Updated: ID=%d, Name=%s, Plan=%s, OTP=%s",
                    updatedOrg.getId(), updatedOrg.getName(), updatedOrg.getPlanType(), updatedOrg.getOtpCode());
            kafkaTemplate.send("organization-creation-events", String.valueOf(id), msg);

            return ResponseEntity.ok(updatedOrg);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An error occurred: " + e.getMessage()));
        }
    }

    // Delete organization. Clears Redis cache.
    @DeleteMapping("/organization/{id}")
    @CacheEvict(value = "organizations", allEntries = true)
    public ResponseEntity<?> deleteOrganization(@PathVariable Long id) {
        try {
            if (!organizationRepository.existsById(id)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Organization not found"));
            }
            organizationRepository.deleteById(id);
            // Publish event to Kafka topic
            kafkaTemplate.send("organization-creation-events", String.valueOf(id), "Organization Deleted: ID=" + id);
            return ResponseEntity.ok(Map.of("message", "Organization deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An error occurred: " + e.getMessage()));
        }
    }

    // Get all HR users
    @GetMapping("/hrs")
    public ResponseEntity<?> getHRs() {
        try {
            List<User> hrs = userRepository.findByRole("ADMIN");
            return ResponseEntity.ok(hrs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error fetching HRs: " + e.getMessage()));
        }
    }

    // Create a new HR user for an organization
    @PostMapping("/hr")
    public ResponseEntity<?> createHR(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String gmail = request.get("gmail");
            String mobile = request.get("mobile");
            String password = request.get("password");
            String orgIdStr = request.get("orgId");

            if (username == null || gmail == null || mobile == null || password == null || orgIdStr == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "All fields are required"));
            }

            if (userRepository.existsByUsername(username)) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Username already exists"));
            }

            java.util.Optional<Organization> orgOpt = organizationRepository.findById(Long.parseLong(orgIdStr));
            if (orgOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Organization not found"));
            }

            User user = User.builder()
                    .username(username)
                    .gmail(gmail)
                    .mobile(mobile)
                    .password(password)
                    .role("ADMIN")
                    .organization(orgOpt.get())
                    .build();

            User saved = userRepository.save(user);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error creating HR: " + e.getMessage()));
        }
    }

    // Update HR details
    @PutMapping("/hr/{id}")
    public ResponseEntity<?> updateHR(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            java.util.Optional<User> userOpt = userRepository.findById(id);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "HR user not found"));
            }

            User user = userOpt.get();
            if (request.containsKey("username")) user.setUsername(request.get("username"));
            if (request.containsKey("gmail")) user.setGmail(request.get("gmail"));
            if (request.containsKey("mobile")) user.setMobile(request.get("mobile"));
            if (request.containsKey("password") && !request.get("password").isEmpty()) {
                user.setPassword(request.get("password"));
            }

            User updated = userRepository.save(user);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error updating HR: " + e.getMessage()));
        }
    }

    // Delete HR user
    @DeleteMapping("/hr/{id}")
    public ResponseEntity<?> deleteHR(@PathVariable Long id) {
        try {
            if (!userRepository.existsById(id)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "HR user not found"));
            }
            userRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "HR deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error deleting HR: " + e.getMessage()));
        }
    }
}
