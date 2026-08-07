package com.zenelait.hrms.repository;

import com.zenelait.hrms.entity.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PayrollRepository extends JpaRepository<Payroll, Long> {
    List<Payroll> findByOrganizationId(Long organizationId);
    Optional<Payroll> findByUsernameAndOrganizationId(String username, Long organizationId);
}
