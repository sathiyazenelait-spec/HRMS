package com.zenelait.hrms.repository;

import com.zenelait.hrms.entity.CourseProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CourseProgressRepository extends JpaRepository<CourseProgress, Long> {
    List<CourseProgress> findByOrganizationId(Long organizationId);
    List<CourseProgress> findByUsernameAndOrganizationId(String username, Long organizationId);
    Optional<CourseProgress> findByUsernameAndCourseIdAndOrganizationId(String username, Long courseId, Long organizationId);
}
