package com.zenelait.hrms.repository;

import com.zenelait.hrms.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByOrganizationId(Long organizationId);
    Optional<Ticket> findByTicketCodeAndOrganizationId(String ticketCode, Long organizationId);
}
