package com.zenelait.hrms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Entity
@Table(name = "helpdesk_tickets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HelpdeskTicket implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 4000)
    private String description;

    @Column(nullable = false)
    private String category; // HR, IT, Finance

    @Column(nullable = false)
    private String priority; // Low, Medium, High

    @Column(nullable = false)
    private String status; // Open, In Progress, Resolved

    @Column(name = "organization_id", nullable = false)
    private Long organizationId;
}
