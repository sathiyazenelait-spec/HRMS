package com.zenelait.hrms.repository;

import com.zenelait.hrms.entity.Squad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SquadRepository extends JpaRepository<Squad, Long> {
    List<Squad> findByOrganizationId(Long organizationId);
    List<Squad> findByDepartmentIdAndOrganizationId(Long departmentId, Long organizationId);
}
