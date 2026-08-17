package com.zenelait.hrms.repository;

import com.zenelait.hrms.entity.LandingPageBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface LandingPageBlockRepository extends JpaRepository<LandingPageBlock, Long> {
    List<LandingPageBlock> findAllByOrderByDisplayOrderAsc();
    Optional<LandingPageBlock> findByBlockId(String blockId);
}
