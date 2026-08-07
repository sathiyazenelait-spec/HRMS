package com.zenelait.hrms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Entity
@Table(name = "squad_memberships")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SquadMembership implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "squad_id", nullable = false)
    private Long squadId;

    @Column(nullable = false)
    private String username;

    @Column(name = "role_title", nullable = false)
    private String roleTitle;

    @Column(name = "allocation_percentage", nullable = false)
    private Integer allocationPercentage; // 0 to 100 percentage

    @Column(name = "organization_id", nullable = false)
    private Long organizationId;
}
