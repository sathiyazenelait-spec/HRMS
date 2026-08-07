package com.zenelait.hrms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.time.LocalDate;

@Entity
@Table(name = "announcements")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Announcement implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 4000)
    private String content;

    @Column(name = "target_audience", nullable = false)
    private String targetAudience; // e.g. All, IT, HR, Sales

    @Column(nullable = false)
    private String category; // News, Event, Holiday, Policy

    @Column(name = "publish_date", nullable = false)
    private LocalDate publishDate;

    @Column(nullable = false)
    private String author;

    @Column(name = "organization_id", nullable = false)
    private Long organizationId;
}
