package com.zenelait.hrms.repository;

import com.zenelait.hrms.entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, Long> {
    Optional<Organization> findByOrgCode(String orgCode);
    Optional<Organization> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);
}
