package com.zenelait.hrms.controller;

import com.zenelait.hrms.entity.RolePermission;
import com.zenelait.hrms.entity.RoleAuditLog;
import com.zenelait.hrms.repository.RolePermissionRepository;
import com.zenelait.hrms.repository.RoleAuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/rbac")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class RolePermissionController {

    @Autowired
    private RolePermissionRepository rolePermissionRepository;

    @Autowired
    private RoleAuditLogRepository roleAuditLogRepository;

    @GetMapping("/permissions")
    public ResponseEntity<?> getPermissions(@RequestParam Long orgId) {
        List<RolePermission> list = rolePermissionRepository.findByOrganizationId(orgId);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<?> getAuditLogs(@RequestParam Long orgId) {
        List<RoleAuditLog> list = roleAuditLogRepository.findByOrganizationIdOrderByCreatedAtDesc(orgId);
        return ResponseEntity.ok(list);
    }

    @PostMapping("/audit-logs")
    public ResponseEntity<?> saveAuditLog(@RequestBody RoleAuditLog log) {
        if (log.getTargetUser() == null || log.getActor() == null ||
            log.getOldRole() == null || log.getNewRole() == null ||
            log.getOrganizationId() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing required audit log parameters"));
        }
        RoleAuditLog saved = roleAuditLogRepository.save(log);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/permissions")
    public ResponseEntity<?> savePermission(@RequestBody RolePermission req) {
        if (req.getRoleName() == null || req.getModuleName() == null ||
            req.getCanRead() == null || req.getCanWrite() == null ||
            req.getCanDelete() == null || req.getOrganizationId() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing required fields: roleName, moduleName, canRead, canWrite, canDelete, organizationId"));
        }
        
        Optional<RolePermission> opt = rolePermissionRepository.findByRoleNameAndModuleNameAndOrganizationId(
            req.getRoleName(), req.getModuleName(), req.getOrganizationId()
        );
        
        RolePermission target;
        if (opt.isPresent()) {
            target = opt.get();
            target.setCanRead(req.getCanRead());
            target.setCanWrite(req.getCanWrite());
            target.setCanDelete(req.getCanDelete());
        } else {
            target = req;
        }
        
        RolePermission saved = rolePermissionRepository.save(target);
        return ResponseEntity.ok(saved);
    }
}
