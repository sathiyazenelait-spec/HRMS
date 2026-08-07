package com.zenelait.hrms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "contact_queries")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContactQuery implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false, length = 2000)
    private String message;

    @Column(name = "status", nullable = false)
    private String status; // PENDING, RESOLVED

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
