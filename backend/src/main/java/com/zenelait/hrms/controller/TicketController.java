package com.zenelait.hrms.controller;

import com.zenelait.hrms.entity.Ticket;
import com.zenelait.hrms.entity.Organization;
import com.zenelait.hrms.repository.TicketRepository;
import com.zenelait.hrms.repository.OrganizationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

@RestController
@RequestMapping("/tickets")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class TicketController {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @GetMapping
    public ResponseEntity<?> getTickets(@RequestParam(required = false) Long orgId) {
        if (orgId == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Parameter 'orgId' is required"));
        }
        List<Ticket> tickets = ticketRepository.findByOrganizationId(orgId);
        return ResponseEntity.ok(tickets);
    }

    @PostMapping("/create")
    public ResponseEntity<?> createTicket(@RequestParam(required = false) Long orgId, @RequestBody Map<String, Object> payload) {
        if (orgId == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Parameter 'orgId' is required"));
        }
        String title = (String) payload.get("title");
        String desc = (String) payload.get("desc");
        Number pointsNum = (Number) payload.get("points");
        String priority = (String) payload.get("priority");
        String assignee = (String) payload.get("assignee");
        String sprintId = (String) payload.get("sprintId");

        if (title == null || desc == null || pointsNum == null || priority == null || assignee == null || sprintId == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing required fields: title, desc, points, priority, assignee, sprintId"));
        }

        Optional<Organization> orgOpt = organizationRepository.findById(orgId);
        if (!orgOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Organization not found"));
        }

        try {
            int points = pointsNum.intValue();
            String code = "TICK-" + (1000 + new Random().nextInt(9000));

            Ticket ticket = Ticket.builder()
                    .ticketCode(code)
                    .title(title)
                    .description(desc)
                    .points(points)
                    .priority(priority)
                    .assignee(assignee)
                    .sprintId(sprintId)
                    .status("To Do")
                    .organization(orgOpt.get())
                    .build();

            ticketRepository.save(ticket);
            return ResponseEntity.ok(ticket);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid format: " + e.getMessage()));
        }
    }

    @PostMapping("/status")
    public ResponseEntity<?> updateTicketStatus(@RequestParam(required = false) Long orgId, @RequestBody Map<String, Object> payload) {
        if (orgId == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Parameter 'orgId' is required"));
        }
        Number ticketIdNum = (Number) payload.get("ticketId");
        String status = (String) payload.get("status");

        if (ticketIdNum == null || status == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing required fields: ticketId, status"));
        }

        Long ticketId = ticketIdNum.longValue();
        Optional<Ticket> ticketOpt = ticketRepository.findById(ticketId);
        if (!ticketOpt.isPresent() || !ticketOpt.get().getOrganization().getId().equals(orgId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Ticket not found under organization"));
        }

        Ticket ticket = ticketOpt.get();
        ticket.setStatus(status);
        ticketRepository.save(ticket);

        return ResponseEntity.ok(ticket);
    }
}
