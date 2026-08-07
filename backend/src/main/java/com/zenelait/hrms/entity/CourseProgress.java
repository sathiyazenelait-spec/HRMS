package com.zenelait.hrms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Entity
@Table(name = "course_progress")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseProgress implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String username;

    @Column(name = "course_id", nullable = false)
    private Long courseId;

    @Column(nullable = false)
    private Integer progress; // 0 to 100 percentage

    @Column(nullable = false)
    private String status; // Not Started, In Progress, Completed

    @Column(name = "organization_id", nullable = false)
    private Long organizationId;
}
