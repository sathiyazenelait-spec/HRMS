package com.zenelait.hrms.repository;

import com.zenelait.hrms.entity.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByOrganizationId(Long organizationId);
    List<LeaveRequest> findByUsernameAndOrganizationId(String username, Long organizationId);
}
