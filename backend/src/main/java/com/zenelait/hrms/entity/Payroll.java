package com.zenelait.hrms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Entity
@Table(name = "payroll_records")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Payroll implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private Double basic;

    @Column(nullable = false)
    private Double allowance;

    @Column(nullable = false)
    private Double deductions;

    @Column(nullable = false)
    private String status; // Processed, Draft

    @ManyToOne
    @JoinColumn(name = "organization_id")
    private Organization organization;
}
