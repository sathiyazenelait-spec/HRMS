package com.zenelait.hrms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Entity
@Table(name = "projects")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Project implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private Double budget;

    @Column(nullable = false)
    private Double spent;

    @Column(nullable = false)
    private String owner; // Username of the project owner

    @Column(nullable = false)
    private String status; // GREEN, AMBER, RED

    @Column(name = "team_members", length = 2000)
    private String teamMembers; // Comma-separated usernames

    @Column(length = 2000)
    private String milestones; // Comma-separated milestones

    @Column(name = "organization_id", nullable = false)
    private Long organizationId;
}
