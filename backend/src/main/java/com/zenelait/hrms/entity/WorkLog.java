package com.zenelait.hrms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.time.LocalDate;

@Entity
@Table(name = "work_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkLog implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String username;

    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;

    @Column(name = "what_done", nullable = false, length = 4000)
    private String whatDone;

    @Column(name = "what_next", nullable = false, length = 4000)
    private String whatNext;

    @Column(length = 2000)
    private String blockers;

    @Column(name = "hours_spent", nullable = false)
    private Double hoursSpent;

    @Column(name = "organization_id", nullable = false)
    private Long organizationId;
}
