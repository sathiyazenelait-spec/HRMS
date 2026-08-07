package com.zenelait.hrms.repository;

import com.zenelait.hrms.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByOrganizationId(Long organizationId);
    Optional<Attendance> findByUsernameAndDateAndOrganizationId(String username, LocalDate date, Long organizationId);
}
