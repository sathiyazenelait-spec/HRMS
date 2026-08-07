package com.zenelait.hrms.repository;

import com.zenelait.hrms.entity.RolePermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RolePermissionRepository extends JpaRepository<RolePermission, Long> {
    List<RolePermission> findByOrganizationId(Long organizationId);
    Optional<RolePermission> findByRoleNameAndModuleNameAndOrganizationId(String roleName, String moduleName, Long organizationId);
}
