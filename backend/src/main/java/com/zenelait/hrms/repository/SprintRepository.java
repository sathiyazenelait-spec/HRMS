package com.zenelait.hrms.repository;

import com.zenelait.hrms.entity.Sprint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SprintRepository extends JpaRepository<Sprint, Long> {
    List<Sprint> findByOrganizationId(Long organizationId);
}
