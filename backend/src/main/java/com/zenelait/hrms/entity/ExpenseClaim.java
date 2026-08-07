package com.zenelait.hrms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.time.LocalDate;

@Entity
@Table(name = "expense_claims")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseClaim implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String category; // e.g. Travel, Meals, Software, Hardware, Marketing, Other

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private String currency; // USD, EUR, INR

    @Column(nullable = false)
    private String status; // Pending, Approved, Rejected, Reimbursed

    @Column(nullable = false)
    private String merchant;

    @Column(name = "claim_date", nullable = false)
    private LocalDate claimDate;

    @Column(name = "organization_id", nullable = false)
    private Long organizationId;
}
