package com.zenelait.hrms.repository;

import com.zenelait.hrms.entity.PerformanceReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PerformanceReviewRepository extends JpaRepository<PerformanceReview, Long> {
    List<PerformanceReview> findByOrganizationId(Long organizationId);
    List<PerformanceReview> findByUsernameAndOrganizationId(String username, Long organizationId);
}
