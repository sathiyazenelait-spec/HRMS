package com.zenelait.hrms.repository;

import com.zenelait.hrms.entity.ContactQuery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ContactQueryRepository extends JpaRepository<ContactQuery, Long> {
    List<ContactQuery> findByOrderByCreatedAtDesc();
}
