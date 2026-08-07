package com.zenelait.hrms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.time.LocalDate;

@Entity
@Table(name = "exit_requests")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExitRequest implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false, length = 4000)
    private String reason;

    @Column(name = "resignation_date", nullable = false)
    private LocalDate resignationDate;

    @Column(name = "last_working_day", nullable = false)
    private LocalDate lastWorkingDay;

    @Column(nullable = false)
    private String status; // Pending, Approved, Rejected, Completed

    @Column(name = "department_clearance", nullable = false)
    private String departmentClearance; // Pending, Cleared

    @Column(name = "it_clearance", nullable = false)
    private String itClearance; // Pending, Cleared

    @Column(name = "finance_clearance", nullable = false)
    private String financeClearance; // Pending, Cleared

    @Column(name = "organization_id", nullable = false)
    private Long organizationId;
}
