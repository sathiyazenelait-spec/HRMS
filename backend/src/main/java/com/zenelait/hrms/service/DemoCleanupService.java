package com.zenelait.hrms.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class DemoCleanupService {

    @Autowired
    private EntityManager entityManager;

    // Runs every minute to check for expired demo organizations
    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void purgeExpiredDemoOrganizations() {
        try {
            LocalDateTime now = LocalDateTime.now();
            
            // Find expired demo organizations
            Query selectQuery = entityManager.createQuery(
                "SELECT o.id FROM Organization o WHERE o.isDemo = true AND o.expiresAt <= :now"
            );
            selectQuery.setParameter("now", now);
            @SuppressWarnings("unchecked")
            List<Long> expiredOrgIds = selectQuery.getResultList();

            if (expiredOrgIds.isEmpty()) {
                return;
            }

            System.out.println("[DemoCleanupService] Found " + expiredOrgIds.size() + " expired demo organizations to purge: " + expiredOrgIds);

            for (Long orgId : expiredOrgIds) {
                purgeOrganization(orgId);
            }
        } catch (Exception e) {
            System.err.println("[DemoCleanupService] Error checking for expired demo organizations: " + e.getMessage());
        }
    }

    @Transactional
    public void purgeOrganization(Long orgId) {
        System.out.println("[DemoCleanupService] Starting complete purge for organization ID: " + orgId);

        // Delete from all cascade-related tables in correct dependency order (child tables first, parent tables later)
        String[] deleteQueries = {
            "DELETE FROM PasswordResetRequest p WHERE p.organization.id = :orgId",
            "DELETE FROM User u WHERE u.organization.id = :orgId",
            "DELETE FROM Timesheet t WHERE t.organizationId = :orgId",
            "DELETE FROM WorkLog w WHERE w.organizationId = :orgId",
            "DELETE FROM TravelRequest tr WHERE tr.organizationId = :orgId",
            "DELETE FROM ExpenseClaim ec WHERE ec.organizationId = :orgId",
            "DELETE FROM Announcement a WHERE a.organizationId = :orgId",
            "DELETE FROM ExitRequest er WHERE er.organizationId = :orgId",
            "DELETE FROM HelpdeskTicket ht WHERE ht.organizationId = :orgId",
            "DELETE FROM RolePermission rp WHERE rp.organizationId = :orgId",
            "DELETE FROM RoleAuditLog ral WHERE ral.organizationId = :orgId",
            "DELETE FROM SystemNotification sn WHERE sn.targetOrgId = :orgId",
            "DELETE FROM OnboardingTask ot WHERE ot.organizationId = :orgId",
            "DELETE FROM Asset ast WHERE ast.organizationId = :orgId",
            "DELETE FROM PerformanceReview pr WHERE pr.organizationId = :orgId",
            "DELETE FROM CourseProgress cp WHERE cp.organizationId = :orgId",
            "DELETE FROM Course c WHERE c.organizationId = :orgId",
            "DELETE FROM SquadMembership sm WHERE sm.organizationId = :orgId",
            "DELETE FROM Squad s WHERE s.organizationId = :orgId",
            "DELETE FROM Department d WHERE d.organizationId = :orgId",
            "DELETE FROM LeaveRequest lr WHERE lr.organizationId = :orgId",
            "DELETE FROM Candidate cand WHERE cand.organizationId = :orgId",
            "DELETE FROM JobRequisition jr WHERE jr.organizationId = :orgId",
            "DELETE FROM Payroll p WHERE p.organization.id = :orgId",
            "DELETE FROM Invoice i WHERE i.organization.id = :orgId",
            "DELETE FROM Attendance att WHERE att.organization.id = :orgId",
            "DELETE FROM Ticket t WHERE t.organization.id = :orgId",
            "DELETE FROM Sprint s WHERE s.organization.id = :orgId",
            "DELETE FROM Project p WHERE p.organizationId = :orgId",
            "DELETE FROM Organization o WHERE o.id = :orgId"
        };

        for (String jpql : deleteQueries) {
            try {
                Query query = entityManager.createQuery(jpql);
                query.setParameter("orgId", orgId);
                int deletedCount = query.executeUpdate();
                if (deletedCount > 0) {
                    System.out.println("[DemoCleanupService] Executed purge query: [" + jpql + "] -> deleted " + deletedCount + " rows");
                }
            } catch (Exception e) {
                System.err.println("[DemoCleanupService] Error executing purge query [" + jpql + "] for org " + orgId + ": " + e.getMessage());
            }
        }
        System.out.println("[DemoCleanupService] Successfully purged organization ID: " + orgId);
    }
}
