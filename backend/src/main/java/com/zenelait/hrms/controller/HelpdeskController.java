package com.zenelait.hrms.controller;

import com.zenelait.hrms.entity.HelpdeskTicket;
import com.zenelait.hrms.repository.HelpdeskTicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/helpdesk")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class HelpdeskController {

    @Autowired
    private HelpdeskTicketRepository helpdeskTicketRepository;

    @GetMapping
    public ResponseEntity<?> getHelpdeskTickets(@RequestParam Long orgId) {
        List<HelpdeskTicket> list = helpdeskTicketRepository.findByOrganizationId(orgId);
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<?> saveHelpdeskTicket(@RequestBody HelpdeskTicket req) {
        if (req.getUsername() == null || req.getTitle() == null ||
            req.getDescription() == null || req.getCategory() == null ||
            req.getPriority() == null || req.getOrganizationId() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing required fields: username, title, description, category, priority, organizationId"));
        }
        
        if (req.getId() != null) {
            Optional<HelpdeskTicket> opt = helpdeskTicketRepository.findById(req.getId());
            if (opt.isPresent()) {
                HelpdeskTicket existing = opt.get();
                if (req.getStatus() != null) {
                    existing.setStatus(req.getStatus());
                }
                HelpdeskTicket saved = helpdeskTicketRepository.save(existing);
                return ResponseEntity.ok(saved);
            }
        }
        
        if (req.getStatus() == null) {
            req.setStatus("Open");
        }
        
        HelpdeskTicket saved = helpdeskTicketRepository.save(req);
        return ResponseEntity.ok(saved);
    }
}
