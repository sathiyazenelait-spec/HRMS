package com.zenelait.hrms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Entity
@Table(name = "subscription_plans")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionPlan implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // e.g. STANDARD, MIDLEVEL, ENTERPRISE, CUSTOM

    @Column(nullable = false)
    private Double price;

    @Column(name = "max_users", nullable = false)
    private Integer maxUsers;

    @Column(name = "allowed_modules", nullable = false, length = 1000)
    private String allowedModules; // e.g. "ATTENDANCE,PAYROLL,SPRINTS,TICKETS"
}
