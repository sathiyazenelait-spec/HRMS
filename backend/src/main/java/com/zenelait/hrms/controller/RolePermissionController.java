package com.zenelait.hrms.controller;

import com.zenelait.hrms.entity.RolePermission;
import com.zenelait.hrms.repository.RolePermissionRepository;
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

    @GetMapping("/permissions")
    public ResponseEntity<?> getPermissions(@RequestParam Long orgId) {
        List<RolePermission> list = rolePermissionRepository.findByOrganizationId(orgId);
        return ResponseEntity.ok(list);
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
