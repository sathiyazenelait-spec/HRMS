package com.zenelait.hrms.controller;

import com.zenelait.hrms.entity.ExpenseClaim;
import com.zenelait.hrms.repository.ExpenseClaimRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/expenses")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class ExpenseController {

    @Autowired
    private ExpenseClaimRepository expenseClaimRepository;

    @GetMapping
    public ResponseEntity<?> getExpenseClaims(@RequestParam Long orgId, @RequestParam(required = false) String username) {
        if (username != null && !username.trim().isEmpty()) {
            List<ExpenseClaim> list = expenseClaimRepository.findByUsernameAndOrganizationId(username, orgId);
            return ResponseEntity.ok(list);
        }
        List<ExpenseClaim> list = expenseClaimRepository.findByOrganizationId(orgId);
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<?> saveExpenseClaim(@RequestBody ExpenseClaim claim) {
        if (claim.getUsername() == null || claim.getTitle() == null ||
            claim.getCategory() == null || claim.getAmount() == null ||
            claim.getMerchant() == null || claim.getClaimDate() == null ||
            claim.getOrganizationId() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing required fields: username, title, category, amount, merchant, claimDate, organizationId"));
        }
        
        // Handle editing status / details
        if (claim.getId() != null) {
            Optional<ExpenseClaim> opt = expenseClaimRepository.findById(claim.getId());
            if (opt.isPresent()) {
                ExpenseClaim existing = opt.get();
                if (claim.getStatus() != null) {
                    existing.setStatus(claim.getStatus());
                }
                ExpenseClaim saved = expenseClaimRepository.save(existing);
                return ResponseEntity.ok(saved);
            }
        }
        
        if (claim.getStatus() == null) {
            claim.setStatus("Pending");
        }
        if (claim.getCurrency() == null) {
            claim.setCurrency("USD");
        }
        
        ExpenseClaim saved = expenseClaimRepository.save(claim);
        return ResponseEntity.ok(saved);
    }
}
