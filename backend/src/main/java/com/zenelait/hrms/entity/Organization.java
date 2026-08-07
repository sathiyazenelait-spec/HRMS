package com.zenelait.hrms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "organizations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Organization implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(name = "org_type", nullable = false)
    private String orgType; // IT, MARKETING, SALES, CORPORATE, MANUFACTURING

    @Column(name = "org_code", nullable = false, unique = true)
    private String orgCode; // Format: HRMS[Year][5 random digits]

    @Column(name = "owner_gmail", nullable = false)
    private String ownerGmail;

    @Column(name = "owner_mobile", nullable = false)
    private String ownerMobile;

    @Column(name = "plan_type", nullable = false)
    private String planType; // STANDARD, MIDLEVEL, ENTERPRISE

    @Column(name = "otp_code", nullable = false)
    private String otpCode; // Generated OTP for registration validation

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "work_mode", nullable = false, columnDefinition = "varchar(255) default 'TASK_BASED'")
    @Builder.Default
    private String workMode = "TASK_BASED"; // TASK_BASED, SPRINT_BASED

    @Column(name = "attendance_mode", nullable = false, columnDefinition = "varchar(255) default 'CLOCK_IN_OUT'")
    @Builder.Default
    private String attendanceMode = "CLOCK_IN_OUT"; // CLOCK_IN_OUT, EXCEL_GRID

    @Column(name = "modules_active", nullable = false, columnDefinition = "varchar(255) default 'ATTENDANCE,PAYROLL,SPRINTS,TICKETS'")
    @Builder.Default
    private String modulesActive = "ATTENDANCE,PAYROLL,SPRINTS,TICKETS";
}
