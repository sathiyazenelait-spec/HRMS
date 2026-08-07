package com.zenelait.hrms.repository;

import com.zenelait.hrms.entity.PasswordResetRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PasswordResetRequestRepository extends JpaRepository<PasswordResetRequest, Long> {
    Optional<PasswordResetRequest> findByUsernameAndStatus(String username, String status);
    List<PasswordResetRequest> findByOrganizationIdAndStatus(Long orgId, String status);
    Optional<PasswordResetRequest> findByUsername(String username);
}
