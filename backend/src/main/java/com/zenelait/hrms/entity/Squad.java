package com.zenelait.hrms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Entity
@Table(name = "squads")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Squad implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "department_id", nullable = false)
    private Long departmentId;

    @Column(name = "lead_username")
    private String leadUsername;

    @Column(name = "skills_matrix")
    private String skillsMatrix; // Comma separated list of skills

    @Column(name = "organization_id", nullable = false)
    private Long organizationId;
}
