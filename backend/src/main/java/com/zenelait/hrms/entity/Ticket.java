package com.zenelait.hrms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Entity
@Table(name = "tickets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Ticket implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ticket_code", nullable = false, unique = true)
    private String ticketCode;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private Integer points;

    @Column(nullable = false)
    private String priority; // Low, Medium, High

    @Column(nullable = false)
    private String assignee;

    @Column(name = "sprint_id")
    private String sprintId; // e.g. sprint-2 or backlog

    @Column(nullable = false)
    private String status; // To Do, In Progress, Review, QA, Done

    @ManyToOne
    @JoinColumn(name = "organization_id")
    private Organization organization;
}
