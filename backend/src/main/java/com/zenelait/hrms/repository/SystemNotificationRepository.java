package com.zenelait.hrms.repository;

import com.zenelait.hrms.entity.SystemNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SystemNotificationRepository extends JpaRepository<SystemNotification, Long> {
    
    @Query("SELECT s FROM SystemNotification s WHERE s.targetOrgId IS NULL OR s.targetOrgId = :orgId ORDER BY s.createdAt DESC")
    List<SystemNotification> findActiveNotifications(@Param("orgId") Long orgId);
    
    List<SystemNotification> findByTargetOrgIdIsNullOrderByCreatedAtDesc();
}
