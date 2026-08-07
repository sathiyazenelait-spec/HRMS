package com.zenelait.hrms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Entity
@Table(name = "onboarding_tasks")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OnboardingTask implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String username;

    @Column(name = "task_name", nullable = false)
    private String taskName;

    @Column(nullable = false)
    private String category; // DOCUMENTS, PROVISIONING, ASSETS, PAYROLL, TEAM, WELCOME

    @Column(nullable = false)
    private Boolean completed;

    @Column(name = "organization_id", nullable = false)
    private Long organizationId;
}
