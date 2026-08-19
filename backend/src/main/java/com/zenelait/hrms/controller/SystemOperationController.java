package com.zenelait.hrms.controller;

import com.zenelait.hrms.entity.SubscriptionPlan;
import com.zenelait.hrms.entity.ContactQuery;
import com.zenelait.hrms.entity.SystemNotification;
import com.zenelait.hrms.entity.Organization;
import com.zenelait.hrms.entity.LandingPageBlock;
import com.zenelait.hrms.repository.SubscriptionPlanRepository;
import com.zenelait.hrms.repository.ContactQueryRepository;
import com.zenelait.hrms.repository.SystemNotificationRepository;
import com.zenelait.hrms.repository.OrganizationRepository;
import com.zenelait.hrms.repository.LandingPageBlockRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/system-ops")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class SystemOperationController {

    @Autowired
    private SubscriptionPlanRepository planRepository;

    @Autowired
    private ContactQueryRepository contactQueryRepository;

    @Autowired
    private SystemNotificationRepository notificationRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private LandingPageBlockRepository landingPageBlockRepository;

    @jakarta.annotation.PostConstruct
    public void seedDefaultPlans() {
        try {
            if (planRepository.count() == 0) {
                System.out.println("Seeding default subscription plans...");
                planRepository.save(SubscriptionPlan.builder()
                        .name("STANDARD")
                        .price(0.0)
                        .maxUsers(150)
                        .allowedModules("ATTENDANCE,PAYROLL,SPRINTS,TICKETS")
                        .build());
                planRepository.save(SubscriptionPlan.builder()
                        .name("MIDLEVEL")
                        .price(0.0)
                        .maxUsers(500)
                        .allowedModules("ATTENDANCE,PAYROLL,SPRINTS,TICKETS")
                        .build());
                planRepository.save(SubscriptionPlan.builder()
                        .name("ENTERPRISE")
                        .price(0.0)
                        .maxUsers(9999)
                        .allowedModules("ATTENDANCE,PAYROLL,SPRINTS,TICKETS")
                        .build());
            }
        } catch (Exception e) {
            System.err.println("Error seeding default plans: " + e.getMessage());
        }
    }

    // Create a pricing plan
    @PostMapping("/plan")
    public ResponseEntity<?> createPlan(@RequestBody Map<String, Object> payload) {
        String name = (String) payload.get("name");
        Number priceNum = (Number) payload.get("price");
        Number maxUsersNum = (Number) payload.get("maxUsers");
        String allowedModules = (String) payload.get("allowedModules");

        if (name == null || priceNum == null || maxUsersNum == null || allowedModules == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "All parameters: name, price, maxUsers, allowedModules are required"));
        }

        if (planRepository.findByNameIgnoreCase(name).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Plan name already exists"));
        }

        SubscriptionPlan plan = SubscriptionPlan.builder()
                .name(name.toUpperCase())
                .price(priceNum.doubleValue())
                .maxUsers(maxUsersNum.intValue())
                .allowedModules(allowedModules)
                .build();

        planRepository.save(plan);
        return ResponseEntity.ok(plan);
    }

    // List pricing plans
    @GetMapping("/plans")
    public ResponseEntity<?> getPlans() {
        List<SubscriptionPlan> plans = planRepository.findAll();
        return ResponseEntity.ok(plans);
    }

    // Update subscription plan
    @PutMapping("/plan/{id}")
    public ResponseEntity<?> updatePlan(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        try {
            Optional<SubscriptionPlan> planOpt = planRepository.findById(id);
            if (planOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Plan not found"));
            }

            SubscriptionPlan plan = planOpt.get();
            if (payload.containsKey("name")) {
                plan.setName(((String) payload.get("name")).toUpperCase());
            }
            if (payload.containsKey("price")) {
                plan.setPrice(((Number) payload.get("price")).doubleValue());
            }
            if (payload.containsKey("maxUsers")) {
                plan.setMaxUsers(((Number) payload.get("maxUsers")).intValue());
            }
            if (payload.containsKey("allowedModules")) {
                plan.setAllowedModules((String) payload.get("allowedModules"));
            }

            planRepository.save(plan);
            return ResponseEntity.ok(plan);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error updating plan: " + e.getMessage()));
        }
    }

    // Toggle active organization features
    @PostMapping("/modules/toggle")
    public ResponseEntity<?> toggleOrgModules(@RequestBody Map<String, Object> payload) {
        Number orgIdNum = (Number) payload.get("orgId");
        String modulesActive = (String) payload.get("modulesActive");

        if (orgIdNum == null || modulesActive == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Parameters 'orgId' and 'modulesActive' are required"));
        }

        Long orgId = orgIdNum.longValue();
        Optional<Organization> orgOpt = organizationRepository.findById(orgId);
        if (orgOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Organization not found"));
        }

        Organization org = orgOpt.get();
        org.setModulesActive(modulesActive);
        organizationRepository.save(org);

        return ResponseEntity.ok(org);
    }

    // Submit a public visitor query
    @PostMapping("/contact")
    public ResponseEntity<?> submitContactQuery(@RequestBody Map<String, String> payload) {
        String name = payload.get("name");
        String email = payload.get("email");
        String message = payload.get("message");

        if (name == null || email == null || message == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "All fields name, email, and message are required"));
        }

        ContactQuery query = ContactQuery.builder()
                .name(name)
                .email(email)
                .message(message)
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();

        contactQueryRepository.save(query);
        return ResponseEntity.ok(query);
    }

    // Fetch visitor queries (Superadmin review)
    @GetMapping("/contact")
    public ResponseEntity<?> getContactQueries() {
        List<ContactQuery> queries = contactQueryRepository.findByOrderByCreatedAtDesc();
        return ResponseEntity.ok(queries);
    }

    // Send warning notification warning alerts to HRs
    @PostMapping("/notify")
    public ResponseEntity<?> createNotification(@RequestBody Map<String, Object> payload) {
        String title = (String) payload.get("title");
        String content = (String) payload.get("content");
        Number targetOrgIdNum = (Number) payload.get("targetOrgId"); // Can be null

        if (title == null || content == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Parameters 'title' and 'content' are required"));
        }

        SystemNotification notification = SystemNotification.builder()
                .title(title)
                .content(content)
                .targetOrgId(targetOrgIdNum != null ? targetOrgIdNum.longValue() : null)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        notificationRepository.save(notification);
        return ResponseEntity.ok(notification);
    }

    // Retrieve active notifications for target HR
    @GetMapping("/notifications")
    public ResponseEntity<?> getNotifications(@RequestParam Long orgId) {
        List<SystemNotification> notifications = notificationRepository.findActiveNotifications(orgId);
        return ResponseEntity.ok(notifications);
    }

    // Retrieve landing page layout schema blocks
    @GetMapping("/landing-schema")
    public ResponseEntity<?> getLandingSchema() {
        List<LandingPageBlock> list = landingPageBlockRepository.findAllByOrderByDisplayOrderAsc();
        return ResponseEntity.ok(list);
    }

    // Save/Update landing page schema layout
    @PostMapping("/landing-schema")
    public ResponseEntity<?> saveLandingSchema(@RequestBody List<LandingPageBlock> blocks) {
        if (blocks == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Schema block list is required"));
        }
        for (int i = 0; i < blocks.size(); i++) {
            LandingPageBlock req = blocks.get(i);
            req.setDisplayOrder(i);
            
            Optional<LandingPageBlock> opt = landingPageBlockRepository.findByBlockId(req.getBlockId());
            LandingPageBlock target;
            if (opt.isPresent()) {
                target = opt.get();
                target.setTitle(req.getTitle());
                target.setSubtitle(req.getSubtitle());
                target.setCtaText(req.getCtaText());
                target.setVisible(req.getVisible());
                target.setContentList(req.getContentList());
                target.setImageUrl(req.getImageUrl());
                target.setDisplayOrder(i);
            } else {
                target = req;
            }
            landingPageBlockRepository.save(target);
        }
        return ResponseEntity.ok(Map.of("message", "Landing page schema layout successfully saved"));
    }
}
