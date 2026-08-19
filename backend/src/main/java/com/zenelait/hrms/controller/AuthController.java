package com.zenelait.hrms.controller;

import com.zenelait.hrms.entity.Organization;
import com.zenelait.hrms.entity.User;
import com.zenelait.hrms.entity.PasswordResetRequest;
import com.zenelait.hrms.entity.SystemNotification;
import com.zenelait.hrms.entity.SubscriptionPlan;
import com.zenelait.hrms.repository.SystemNotificationRepository;
import com.zenelait.hrms.repository.SubscriptionPlanRepository;
import com.zenelait.hrms.entity.Department;
import com.zenelait.hrms.entity.Project;
import com.zenelait.hrms.entity.Sprint;
import com.zenelait.hrms.entity.Ticket;
import com.zenelait.hrms.entity.Course;
import com.zenelait.hrms.entity.OnboardingTask;
import com.zenelait.hrms.repository.OrganizationRepository;
import com.zenelait.hrms.repository.UserRepository;
import com.zenelait.hrms.repository.PasswordResetRequestRepository;
import com.zenelait.hrms.repository.DepartmentRepository;
import com.zenelait.hrms.repository.ProjectRepository;
import com.zenelait.hrms.repository.SprintRepository;
import com.zenelait.hrms.repository.TicketRepository;
import com.zenelait.hrms.repository.CourseRepository;
import com.zenelait.hrms.repository.OnboardingTaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;

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
    private SystemNotificationRepository systemNotificationRepository;

    @Autowired
    private SubscriptionPlanRepository planRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private SprintRepository sprintRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private OnboardingTaskRepository onboardingTaskRepository;

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

    // Trial Registration endpoint
    @PostMapping("/trial-register")
    public ResponseEntity<?> trialRegister(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String gmail = request.get("gmail");
            String mobile = request.get("mobile");
            String password = request.get("password");
            String confirmPassword = request.get("confirmPassword");
            String orgName = request.get("orgName");

            if (username == null || gmail == null || mobile == null || password == null ||
                confirmPassword == null || orgName == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "All fields are required"));
            }

            if (!password.equals(confirmPassword)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Passwords do not match"));
            }

            if (userRepository.existsByUsername(username)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "Username already exists"));
            }

            if (organizationRepository.existsByNameIgnoreCase(orgName)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "Organization name already exists"));
            }

            // Generate Organization Code: HRMS-TRIAL-[5-digit random number]
            int random5Digits = 10000 + new java.util.Random().nextInt(90000);
            String orgCode = "HRMS-TRIAL-" + random5Digits;

            // Create temporary trial Organization
            Organization org = Organization.builder()
                    .name(orgName)
                    .orgType("IT")
                    .orgCode(orgCode)
                    .ownerGmail(gmail)
                    .ownerMobile(mobile)
                    .planType("STANDARD")
                    .otpCode("TRIAL")
                    .isDemo(true)
                    .expiresAt(LocalDateTime.now().plusDays(3))
                    .build();

            Organization savedOrg = organizationRepository.save(org);

            // Create new Admin User for the Organization
            User user = User.builder()
                    .username(username)
                    .gmail(gmail)
                    .mobile(mobile)
                    .password(password)
                    .role("ADMIN") // Trial creator is the organization Admin
                    .organization(savedOrg)
                    .build();

            User savedUser = userRepository.save(user);

            // Seed demo data for the organization to be fully featured
            seedDemoData(savedOrg, username);

            kafkaTemplate.send("authentication-events", savedUser.getUsername(),
                    "New Trial User registered: " + savedUser.getUsername() + " for trial org: " + savedOrg.getName());

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "id", savedUser.getId(),
                    "username", savedUser.getUsername(),
                    "gmail", savedUser.getGmail(),
                    "role", savedUser.getRole(),
                    "organization", savedOrg
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Trial registration error: " + e.getMessage()));
        }
    }

    private void seedDemoData(Organization org, String adminUsername) {
        try {
            // 1. Seed Department
            Department dept = Department.builder()
                    .name("Engineering")
                    .description("Core software engineering team")
                    .managerUsername(adminUsername)
                    .organizationId(org.getId())
                    .build();
            departmentRepository.save(dept);

            // 2. Seed Project
            Project project = Project.builder()
                    .name("Zenelait Integration")
                    .description("Migrate core services to Zenelait Suite")
                    .client("Internal")
                    .status("Active")
                    .budget(50000.0)
                    .startDate(java.time.LocalDate.now())
                    .endDate(java.time.LocalDate.now().plusMonths(3))
                    .organizationId(org.getId())
                    .build();
            projectRepository.save(project);

            // 3. Seed Sprint
            Sprint sprint = Sprint.builder()
                    .name("Sprint 1 - Foundation")
                    .goal("Setup initial configuration and verify environments")
                    .startDate(java.time.LocalDate.now())
                    .endDate(java.time.LocalDate.now().plusDays(14))
                    .status("Active")
                    .organization(org)
                    .build();
            Sprint savedSprint = sprintRepository.save(sprint);

            // 4. Seed Ticket
            Ticket ticket = Ticket.builder()
                    .ticketCode("TSK-101")
                    .title("Verify Organization Settings")
                    .description("Review the modules and setup work mode preferences")
                    .points(5)
                    .priority("High")
                    .assignee(adminUsername)
                    .sprintId(String.valueOf(savedSprint.getId()))
                    .status("To Do")
                    .organization(org)
                    .build();
            ticketRepository.save(ticket);

            // 5. Seed Course
            Course course = Course.builder()
                    .title("Getting Started with Zenelait HRMS")
                    .duration(2)
                    .targetRole("All")
                    .description("Learn how to use Zenelait to manage your work, logs, and profile.")
                    .driveLink("https://drive.google.com/drive/folders/mock-getting-started")
                    .organizationId(org.getId())
                    .build();
            courseRepository.save(course);

            // 6. Seed Standard Onboarding Tasks
            String[] taskNames = {
                "Submit tax declarations",
                "Fill emergency contact info",
                "Setup profile credentials",
                "Explore the interactive modules"
            };
            String[] categories = {"DOCUMENTS", "WELCOME", "WELCOME", "TEAM"};
            for (int i = 0; i < taskNames.length; i++) {
                OnboardingTask task = OnboardingTask.builder()
                        .username(adminUsername)
                        .taskName(taskNames[i])
                        .category(categories[i])
                        .completed(false)
                        .organizationId(org.getId())
                        .build();
                onboardingTaskRepository.save(task);
            }
        } catch (Exception e) {
            System.err.println("Error seeding demo data for org " + org.getId() + ": " + e.getMessage());
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

    // Forgot password request (Generates OTP and notifies Super Admin)
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

            // Generate a 6-digit random OTP
            int randomOtp = 100000 + new java.util.Random().nextInt(900000);
            String otpCode = String.valueOf(randomOtp);

            // Check if request already exists
            Optional<PasswordResetRequest> existingRequest = passwordResetRequestRepository.findByUsername(username);
            PasswordResetRequest resetReq;
            if (existingRequest.isPresent()) {
                resetReq = existingRequest.get();
                resetReq.setStatus("PENDING");
                resetReq.setOtpCode(otpCode);
            } else {
                resetReq = PasswordResetRequest.builder()
                        .username(username)
                        .status("PENDING")
                        .otpCode(otpCode)
                        .organization(user.getOrganization())
                        .build();
            }

            passwordResetRequestRepository.save(resetReq);

            // Create notification for Super Admin or target HR
            Long targetOrgId = null;
            String recipient = "the Super Admin";
            if (!"ADMIN".equalsIgnoreCase(user.getRole())) {
                if (user.getOrganization() != null) {
                    targetOrgId = user.getOrganization().getId();
                    recipient = "your HR";
                }
            }

            SystemNotification notification = SystemNotification.builder()
                    .title("Password Reset OTP for " + username)
                    .content("User '" + username + "' has requested a password reset. OTP Code: " + otpCode)
                    .targetOrgId(targetOrgId)
                    .isRead(false)
                    .createdAt(LocalDateTime.now())
                    .build();
            systemNotificationRepository.save(notification);

            kafkaTemplate.send("authentication-events", username, "Password reset requested by user: " + username + " with OTP: " + otpCode);

            return ResponseEntity.ok(Map.of("message", "Reset request submitted. The OTP has been sent to " + recipient + ". Please consult them to retrieve your OTP."));
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

    // List pending reset requests for Super Admin (where user's role is ADMIN)
    @GetMapping("/superadmin/reset-requests")
    public ResponseEntity<?> getSuperadminResetRequests() {
        try {
            List<PasswordResetRequest> pending = passwordResetRequestRepository.findAll()
                .stream()
                .filter(r -> "PENDING".equals(r.getStatus()))
                .filter(r -> {
                    Optional<User> uOpt = userRepository.findByUsername(r.getUsername());
                    return uOpt.isPresent() && "ADMIN".equalsIgnoreCase(uOpt.get().getRole());
                })
                .collect(java.util.stream.Collectors.toList());
            return ResponseEntity.ok(pending);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error fetching superadmin reset requests: " + e.getMessage()));
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

    // User resets password after OTP verification
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String otpCode = request.get("otp");
            String newPassword = request.get("newPassword");

            if (username == null || otpCode == null || newPassword == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Username, otp, and newPassword are required"));
            }

            Optional<PasswordResetRequest> reqOpt = passwordResetRequestRepository.findByUsernameAndStatus(username, "APPROVED");
            if (reqOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "No approved password reset request found. Please contact your administrator / Super Admin to approve your request first."));
            }

            PasswordResetRequest req = reqOpt.get();
            if (!otpCode.equals(req.getOtpCode())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Invalid OTP code. Please check with your administrator / Super Admin."));
            }

            Optional<User> userOpt = userRepository.findByUsername(username);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "User not found"));
            }

            User user = userOpt.get();
            user.setPassword(newPassword);
            userRepository.save(user);

            req.setStatus("COMPLETED");
            passwordResetRequestRepository.save(req);

            // Create notification for Super Admin
            SystemNotification notification = SystemNotification.builder()
                    .title("Password Changed: " + username)
                    .content("User '" + username + "' has successfully changed their password after verifying their OTP.")
                    .targetOrgId(null) // Global/Superadmin
                    .isRead(false)
                    .createdAt(LocalDateTime.now())
                    .build();
            systemNotificationRepository.save(notification);

            kafkaTemplate.send("authentication-events", username, "Password reset completed successfully for: " + username);

            return ResponseEntity.ok(Map.of("message", "Password reset successfully. You can now login with your new password."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error resetting password: " + e.getMessage()));
        }
    }

    // Upgrade organization plan and lift demo state
    @PostMapping("/upgrade-organization")
    public ResponseEntity<?> upgradeOrganization(@RequestBody Map<String, Object> request) {
        try {
            Number orgIdNum = (Number) request.get("orgId");
            String planName = (String) request.get("planName");

            if (orgIdNum == null || planName == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "orgId and planName are required"));
            }

            Long orgId = orgIdNum.longValue();
            Optional<Organization> orgOpt = organizationRepository.findById(orgId);
            if (orgOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Organization not found"));
            }

            Organization org = orgOpt.get();
            Optional<SubscriptionPlan> planOpt = planRepository.findByNameIgnoreCase(planName);
            if (planOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Subscription plan not found"));
            }

            SubscriptionPlan plan = planOpt.get();
            org.setIsDemo(false);
            org.setPlanType(plan.getName().toUpperCase());
            org.setModulesActive(plan.getAllowedModules());
            org.setExpiresAt(LocalDateTime.now().plusDays(30));
            organizationRepository.save(org);

            kafkaTemplate.send("organization-creation-events", String.valueOf(org.getId()),
                     "Organization UPGRADED: ID=" + org.getId() + ", Plan=" + plan.getName());

            return ResponseEntity.ok(org);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Upgrade error: " + e.getMessage()));
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

    // Update user role
    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            String newRole = request.get("role");
            if (newRole == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Role is required"));
            }

            Optional<User> userOpt = userRepository.findById(id);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
            }

            User user = userOpt.get();
            user.setRole(newRole.toUpperCase());
            User saved = userRepository.save(user);

            kafkaTemplate.send("authentication-events", saved.getUsername(), 
                    "User role updated to: " + saved.getRole() + " for user: " + saved.getUsername());

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error updating role: " + e.getMessage()));
        }
    }

    // Update user profile credentials (gmail and mobile)
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String gmail = request.get("gmail");
            String mobile = request.get("mobile");

            if (username == null || gmail == null || mobile == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Username, gmail, and mobile are required"));
            }

            Optional<User> userOpt = userRepository.findByUsername(username);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
            }

            User user = userOpt.get();
            user.setGmail(gmail);
            user.setMobile(mobile);
            User saved = userRepository.save(user);

            kafkaTemplate.send("authentication-events", saved.getUsername(),
                    "User profile credentials updated: gmail=" + saved.getGmail() + ", mobile=" + saved.getMobile());

            return ResponseEntity.ok(Map.of(
                    "id", saved.getId(),
                    "username", saved.getUsername(),
                    "gmail", saved.getGmail(),
                    "mobile", saved.getMobile(),
                    "role", saved.getRole()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error updating profile details: " + e.getMessage()));
        }
    }
}
