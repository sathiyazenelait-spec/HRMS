package com.zenelait.hrms.repository;

import com.zenelait.hrms.entity.SquadMembership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SquadMembershipRepository extends JpaRepository<SquadMembership, Long> {
    List<SquadMembership> findByOrganizationId(Long organizationId);
    List<SquadMembership> findBySquadIdAndOrganizationId(Long squadId, Long organizationId);
    List<SquadMembership> findByUsernameAndOrganizationId(String username, Long organizationId);
}
