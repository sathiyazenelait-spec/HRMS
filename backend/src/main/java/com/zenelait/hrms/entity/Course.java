package com.zenelait.hrms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Entity
@Table(name = "courses")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Course implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private Integer duration;

    @Column(name = "target_role", nullable = false)
    private String targetRole; // e.g. IT, HR, All

    @Column(length = 2000)
    private String description;

    @Column(name = "drive_link", length = 1000)
    private String driveLink;

    @Column(name = "organization_id", nullable = false)
    private Long organizationId;
}
