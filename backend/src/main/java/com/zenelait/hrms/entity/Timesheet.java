package com.zenelait.hrms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.time.LocalDate;

@Entity
@Table(name = "timesheets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Timesheet implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String username;

    @Column(name = "project_name", nullable = false)
    private String projectName;

    @Column(name = "task_description", nullable = false)
    private String taskDescription;

    @Column(name = "hours_logged", nullable = false)
    private Double hoursLogged;

    @Column(nullable = false)
    private Boolean billable;

    @Column(name = "week_start_date", nullable = false)
    private LocalDate weekStartDate;

    @Column(nullable = false)
    private String status; // Pending, Approved, Rejected

    @Column(name = "organization_id", nullable = false)
    private Long organizationId;
}
