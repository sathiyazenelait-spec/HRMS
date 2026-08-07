package com.zenelait.hrms.repository;

import com.zenelait.hrms.entity.WorkLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WorkLogRepository extends JpaRepository<WorkLog, Long> {
    List<WorkLog> findByOrganizationId(Long organizationId);
    List<WorkLog> findByUsernameAndOrganizationId(String username, Long organizationId);
}
