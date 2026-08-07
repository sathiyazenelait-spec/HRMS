package com.zenelait.hrms.repository;

import com.zenelait.hrms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    List<User> findByOrganizationId(Long organizationId);
    long countByOrganizationIdAndRoleNot(Long organizationId, String role);
}
