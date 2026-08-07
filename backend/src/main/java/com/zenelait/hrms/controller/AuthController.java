package com.zenelait.hrms.controller;

import com.zenelait.hrms.entity.Organization;
import com.zenelait.hrms.entity.User;
import com.zenelait.hrms.entity.PasswordResetRequest;
import com.zenelait.hrms.repository.OrganizationRepository;
import com.zenelait.hrms.repository.UserRepository;
import com.zenelait.hrms.repository.PasswordResetRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.*;

import org.springframework.core.env.Environment;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AuthController {

    @Autowired
    private Environment environment;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private PasswordResetRequestRepository passwordResetRequestRepository;

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    // Login endpoint
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");

        if (username == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username and Password are required"));
        }

        // Check for static Superadmin credentials
        if (username.equals("superadmin") && password.equals("superadmin123")) {
            // Log authentication event to Kafka
            kafkaTemplate.send("authentication-events", "superadmin", "Superadmin Logged In");
            return ResponseEntity.ok(Map.of(
                    "username", "superadmin",
                    "role", "SUPERADMIN",
                    "gmail", "superadmin@zenelait.com"
            ));
        }

        // Query database for normal users
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty() || !userOpt.get().getPassword().equals(password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid username or password"));
        }

        User user = userOpt.get();
        kafkaTemplate.send("authentication-events", user.getUsername(), "User logged in: " + user.getUsername());

        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "gmail", user.getGmail(),
                "mobile", user.getMobile(),
                "role", user.getRole(),
                "organization", user.getOrganization() != null ? user.getOrganization() : Map.of()
        ));
    }

    // Registration endpoint
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String gmail = request.get("gmail");
            String mobile = request.get("mobile");
            String password = request.get("password");
            String confirmPassword = request.get("confirmPassword");
            String orgName = request.get("orgName");
            String orgCode = request.get("orgCode");
            String otp = request.get("otp");

            if (username == null || gmail == null || mobile == null || password == null ||
                confirmPassword == null || orgName == null || orgCode == null || otp == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "All fields are required"));
            }

            if (!password.equals(confirmPassword)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Passwords do not match"));
            }

            if (userRepository.existsByUsername(username)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "Username already exists"));
            }

            // Find organization by name (case-insensitive)
            Optional<Organization> orgOpt = organizationRepository.findByNameIgnoreCase(orgName);
            if (orgOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Organization name not found"));
            }

            Organization org = orgOpt.get();

            // Validate Organization Code (exact match)
            if (!org.getOrgCode().equalsIgnoreCase(orgCode)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid organization code"));
            }

            // Validate OTP
            if (!org.getOtpCode().equals(otp)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid registration OTP code"));
            }

            // Create new Admin User for the Organization
            User user = User.builder()
                    .username(username)
                    .gmail(gmail)
                    .mobile(mobile)
                    .password(password)
                    .role("ADMIN") // New registration user defaults to Admin of their org
                    .organization(org)
                    .build();

            User savedUser = userRepository.save(user);

            kafkaTemplate.send("authentication-events", savedUser.getUsername(),
                    "New User registered: " + savedUser.getUsername() + " for org: " + org.getName());

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "id", savedUser.getId(),
                    "username", savedUser.getUsername(),
                    "gmail", savedUser.getGmail(),
                    "role", savedUser.getRole(),
                    "organization", org
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Registration error: " + e.getMessage()));
        }
    }

    // List all users in organization (Admin view)
    @GetMapping("/users")
    public ResponseEntity<?> getUsers(@RequestParam Long orgId) {
        try {
            List<User> orgUsers = userRepository.findAll().stream()
                    .filter(u -> u.getOrganization() != null && u.getOrganization().getId().equals(orgId))
                    .toList();
            return ResponseEntity.ok(orgUsers);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error fetching users: " + e.getMessage()));
        }
    }

    // HR Create Employee account
    @PostMapping("/create-user")
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String gmail = request.get("gmail");
            String password = request.get("password");
            String mobile = request.get("mobile");
            String role = request.get("role"); // ADMIN or EMPLOYEE
            String orgIdStr = request.get("orgId");

            if (username == null || gmail == null || password == null || orgIdStr == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Username, Gmail, Password and OrgId are required"));
            }

            if (userRepository.existsByUsername(username)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "Username already exists"));
            }

            Long orgId = Long.parseLong(orgIdStr);
            Optional<Organization> orgOpt = organizationRepository.findById(orgId);
            if (orgOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Organization not found"));
            }

            User user = User.builder()
                    .username(username)
                    .gmail(gmail)
                    .password(password)
                    .mobile(mobile != null ? mobile : "")
                    .role(role != null ? role.toUpperCase() : "EMPLOYEE")
                    .organization(orgOpt.get())
                    .build();

            User savedUser = userRepository.save(user);

            kafkaTemplate.send("authentication-events", savedUser.getUsername(),
                    "New User account created by HR: " + savedUser.getUsername() + " for org: " + orgOpt.get().getName());

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "id", savedUser.getId(),
                    "username", savedUser.getUsername(),
                    "gmail", savedUser.getGmail(),
                    "role", savedUser.getRole()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error creating user: " + e.getMessage()));
        }
    }

    // Forgot password request
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            if (username == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Username is required"));
            }

            Optional<User> userOpt = userRepository.findByUsername(username);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Username not found"));
            }

            User user = userOpt.get();

            // Check if request already exists
            Optional<PasswordResetRequest> existingRequest = passwordResetRequestRepository.findByUsername(username);
            PasswordResetRequest resetReq;
            if (existingRequest.isPresent()) {
                resetReq = existingRequest.get();
                resetReq.setStatus("PENDING");
            } else {
                resetReq = PasswordResetRequest.builder()
                        .username(username)
                        .status("PENDING")
                        .organization(user.getOrganization())
                        .build();
            }

            passwordResetRequestRepository.save(resetReq);

            kafkaTemplate.send("authentication-events", username, "Password reset requested by user: " + username);

            return ResponseEntity.ok(Map.of("message", "Reset request submitted to HR"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error submitting request: " + e.getMessage()));
        }
    }

    // List pending reset requests for HR
    @GetMapping("/reset-requests")
    public ResponseEntity<?> getResetRequests(@RequestParam Long orgId) {
        try {
            List<PasswordResetRequest> requests = passwordResetRequestRepository.findByOrganizationIdAndStatus(orgId, "PENDING");
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error fetching reset requests: " + e.getMessage()));
        }
    }

    // HR approves reset request
    @PostMapping("/approve-reset/{id}")
    public ResponseEntity<?> approveReset(@PathVariable Long id) {
        try {
            Optional<PasswordResetRequest> reqOpt = passwordResetRequestRepository.findById(id);
            if (reqOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Reset request not found"));
            }

            PasswordResetRequest req = reqOpt.get();
            req.setStatus("APPROVED");
            passwordResetRequestRepository.save(req);

            kafkaTemplate.send("authentication-events", req.getUsername(), "Password reset request APPROVED by HR for: " + req.getUsername());

            return ResponseEntity.ok(Map.of("message", "Reset request approved"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error approving reset: " + e.getMessage()));
        }
    }

    // User resets password after approval
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String newPassword = request.get("newPassword");

            if (username == null || newPassword == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Username and newPassword are required"));
            }

            Optional<PasswordResetRequest> reqOpt = passwordResetRequestRepository.findByUsernameAndStatus(username, "APPROVED");
            if (reqOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "No approved password reset request found. Please contact your HR."));
            }

            Optional<User> userOpt = userRepository.findByUsername(username);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "User not found"));
            }

            User user = userOpt.get();
            user.setPassword(newPassword);
            userRepository.save(user);

            PasswordResetRequest req = reqOpt.get();
            req.setStatus("COMPLETED");
            passwordResetRequestRepository.save(req);

            kafkaTemplate.send("authentication-events", username, "Password reset completed successfully for: " + username);

            return ResponseEntity.ok(Map.of("message", "Password reset successfully. You can now login with your new password."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error resetting password: " + e.getMessage()));
        }
    }

    @GetMapping("/system-status")
    public ResponseEntity<?> getSystemStatus() {
        try {
            boolean isMock = java.util.Arrays.asList(environment.getActiveProfiles()).contains("mock-services");
            Map<String, Object> status = new java.util.HashMap<>();
            status.put("javaVersion", System.getProperty("java.version"));
            status.put("processors", Runtime.getRuntime().availableProcessors());
            status.put("freeMemory", Runtime.getRuntime().freeMemory() / (1024 * 1024) + " MB");
            status.put("totalMemory", Runtime.getRuntime().totalMemory() / (1024 * 1024) + " MB");
            status.put("activeProfile", String.join(", ", environment.getActiveProfiles()));
            status.put("redisCache", !isMock ? "Connected (Port 6379)" : "Disabled/Mocked (Simple Cache)");
            status.put("kafkaBroker", !isMock ? "Connected (Port 9092)" : "Disabled/Mocked (Console Logger)");
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error loading status: " + e.getMessage()));
        }
    }

    @PostMapping("/organization/settings")
    public ResponseEntity<?> updateSettings(@RequestBody Map<String, String> request) {
        try {
            Long orgId = Long.parseLong(request.get("orgId"));
            String workMode = request.get("workMode");
            String attendanceMode = request.get("attendanceMode");

            Optional<Organization> orgOpt = organizationRepository.findById(orgId);
            if (orgOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Organization not found"));
            }

            Organization org = orgOpt.get();
            if (workMode != null) org.setWorkMode(workMode);
            if (attendanceMode != null) org.setAttendanceMode(attendanceMode);
            organizationRepository.save(org);

            return ResponseEntity.ok(org);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error updating settings: " + e.getMessage()));
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String currentPassword = request.get("currentPassword");
            String newPassword = request.get("newPassword");

            if (username == null || currentPassword == null || newPassword == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Username, current password and new password are required"));
            }

            Optional<User> userOpt = userRepository.findByUsername(username);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
            }

            User user = userOpt.get();
            if (!user.getPassword().equals(currentPassword)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Incorrect current password"));
            }

            user.setPassword(newPassword);
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error updating password: " + e.getMessage()));
        }
    }
}
