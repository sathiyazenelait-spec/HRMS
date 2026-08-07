package com.zenelait.hrms.repository;

import com.zenelait.hrms.entity.ExitRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExitRequestRepository extends JpaRepository<ExitRequest, Long> {
    List<ExitRequest> findByOrganizationId(Long organizationId);
    Optional<ExitRequest> findByUsernameAndOrganizationId(String username, Long organizationId);
}
