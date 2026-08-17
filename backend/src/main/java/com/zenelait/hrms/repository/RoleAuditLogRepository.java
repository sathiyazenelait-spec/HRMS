package com.zenelait.hrms.repository;

import com.zenelait.hrms.entity.RoleAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RoleAuditLogRepository extends JpaRepository<RoleAuditLog, Long> {
    List<RoleAuditLog> findByOrganizationIdOrderByCreatedAtDesc(Long organizationId);
}
