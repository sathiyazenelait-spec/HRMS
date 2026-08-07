package com.zenelait.hrms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.time.LocalDate;

@Entity
@Table(name = "travel_requests")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TravelRequest implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String destination;

    @Column(nullable = false, length = 4000)
    private String purpose;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "estimated_cost", nullable = false)
    private Double estimatedCost;

    @Column(nullable = false)
    private String status; // Pending, Approved, Rejected, Settled

    @Column(name = "advance_disbursement", nullable = false)
    private Double advanceDisbursement;

    @Column(name = "organization_id", nullable = false)
    private Long organizationId;
}
