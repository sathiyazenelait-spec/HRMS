package com.zenelait.hrms.repository;

import com.zenelait.hrms.entity.OnboardingTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OnboardingTaskRepository extends JpaRepository<OnboardingTask, Long> {
    List<OnboardingTask> findByOrganizationId(Long organizationId);
    List<OnboardingTask> findByUsernameAndOrganizationId(String username, Long organizationId);
}
