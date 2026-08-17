package com.zenelait.hrms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "role_audit_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleAuditLog implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "target_user", nullable = false)
    private String targetUser;

    @Column(nullable = false)
    private String actor;

    @Column(name = "old_role", nullable = false)
    private String oldRole;

    @Column(name = "new_role", nullable = false)
    private String newRole;

    @Column(name = "organization_id", nullable = false)
    private Long organizationId;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
