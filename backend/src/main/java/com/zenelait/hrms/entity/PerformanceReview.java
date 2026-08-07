package com.zenelait.hrms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Entity
@Table(name = "performance_reviews")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceReview implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String period; // e.g., H1 2026, Q2 2026, Annual 2026

    @Column(name = "goals_score", nullable = false)
    private Double goalsScore;

    @Column(name = "sprint_score", nullable = false)
    private Double sprintScore;

    @Column(name = "attendance_score", nullable = false)
    private Double attendanceScore;

    @Column(name = "overall_score", nullable = false)
    private Double overallScore;

    @Column(length = 2000)
    private String feedback;

    @Column(name = "organization_id", nullable = false)
    private Long organizationId;
}
