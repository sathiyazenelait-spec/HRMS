package com.zenelait.hrms.controller;

import com.zenelait.hrms.entity.Invoice;
import com.zenelait.hrms.entity.Organization;
import com.zenelait.hrms.entity.Project;
import com.zenelait.hrms.repository.InvoiceRepository;
import com.zenelait.hrms.repository.OrganizationRepository;
import com.zenelait.hrms.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

@RestController
@RequestMapping("/invoices")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class InvoiceController {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @GetMapping
    public ResponseEntity<?> getInvoices(@RequestParam(required = false) Long orgId) {
        if (orgId == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Parameter 'orgId' is required"));
        }
        List<Invoice> invoices = invoiceRepository.findByOrganizationId(orgId);
        return ResponseEntity.ok(invoices);
    }

    @PostMapping("/create")
    public ResponseEntity<?> createInvoice(@RequestParam(required = false) Long orgId, @RequestBody Map<String, Object> payload) {
        if (orgId == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Parameter 'orgId' is required"));
        }
        String client = (String) payload.get("client");
        Number amountNum = (Number) payload.get("amount");
        String dueDateStr = (String) payload.get("dueDate");

        if (client == null || amountNum == null || dueDateStr == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing required fields: client, amount, dueDate"));
        }

        Optional<Organization> orgOpt = organizationRepository.findById(orgId);
        if (!orgOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Organization not found"));
        }

        try {
            double amount = amountNum.doubleValue();
            LocalDate dueDate = LocalDate.parse(dueDateStr);
            String code = "INV-" + (1000 + new Random().nextInt(9000));

            Invoice invoice = Invoice.builder()
                    .invoiceCode(code)
                    .client(client)
                    .amount(amount)
                    .dueDate(dueDate)
                    .status("Unpaid")
                    .organization(orgOpt.get())
                    .build();

            invoiceRepository.save(invoice);
            return ResponseEntity.ok(invoice);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid request format: " + e.getMessage()));
        }
    }

    @PostMapping("/status")
    public ResponseEntity<?> updateInvoiceStatus(@RequestParam(required = false) Long orgId, @RequestBody Map<String, Object> payload) {
        if (orgId == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Parameter 'orgId' is required"));
        }
        Number invIdNum = (Number) payload.get("invoiceId");
        String status = (String) payload.get("status");

        if (invIdNum == null || status == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing required fields: invoiceId, status"));
        }

        Long invId = invIdNum.longValue();
        Optional<Invoice> invOpt = invoiceRepository.findById(invId);
        if (!invOpt.isPresent() || !invOpt.get().getOrganization().getId().equals(orgId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Invoice not found under organization"));
        }

        Invoice invoice = invOpt.get();
        invoice.setStatus(status);
        invoiceRepository.save(invoice);

        return ResponseEntity.ok(invoice);
    }

    @PostMapping("/auto-generate")
    public ResponseEntity<?> autoGenerateInvoices(@RequestParam(required = false) Long orgId) {
        if (orgId == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Parameter 'orgId' is required"));
        }
        Optional<Organization> orgOpt = organizationRepository.findById(orgId);
        if (!orgOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Organization not found"));
        }

        List<Project> projects = projectRepository.findByOrganizationId(orgId);
        List<Invoice> existingInvoices = invoiceRepository.findByOrganizationId(orgId);

        List<Invoice> generated = new java.util.ArrayList<>();
        for (Project project : projects) {
            if (project.getSpent() == null || project.getSpent() <= 0) {
                continue;
            }
            String clientName = "Client of " + project.getName();

            // Check if an unpaid invoice already exists for this client and amount
            boolean exists = existingInvoices.stream()
                    .anyMatch(inv -> inv.getClient().equalsIgnoreCase(clientName)
                            && Math.abs(inv.getAmount() - project.getSpent()) < 0.01
                            && "Unpaid".equalsIgnoreCase(inv.getStatus()));

            if (!exists) {
                String code = "INV-" + (1000 + new Random().nextInt(9000));
                Invoice invoice = Invoice.builder()
                        .invoiceCode(code)
                        .client(clientName)
                        .amount(project.getSpent())
                        .dueDate(LocalDate.now().plusDays(14))
                        .status("Unpaid")
                        .organization(orgOpt.get())
                        .build();

                invoiceRepository.save(invoice);
                generated.add(invoice);
            }
        }

        return ResponseEntity.ok(Map.of(
            "message", "Auto-generated client invoices successfully",
            "count", generated.size(),
            "invoices", generated
        ));
    }
}
