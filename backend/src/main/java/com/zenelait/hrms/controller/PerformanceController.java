package com.zenelait.hrms.controller;

import com.zenelait.hrms.entity.PerformanceReview;
import com.zenelait.hrms.repository.PerformanceReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/performance")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class PerformanceController {

    @Autowired
    private PerformanceReviewRepository performanceReviewRepository;

    @GetMapping
    public ResponseEntity<?> getReviews(@RequestParam Long orgId, @RequestParam(required = false) String username) {
        if (username != null && !username.trim().isEmpty()) {
            List<PerformanceReview> list = performanceReviewRepository.findByUsernameAndOrganizationId(username, orgId);
            return ResponseEntity.ok(list);
        }
        List<PerformanceReview> list = performanceReviewRepository.findByOrganizationId(orgId);
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<?> saveReview(@RequestBody PerformanceReview review) {
        if (review.getUsername() == null || review.getPeriod() == null ||
            review.getGoalsScore() == null || review.getSprintScore() == null ||
            review.getAttendanceScore() == null || review.getOrganizationId() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing required fields: username, period, goalsScore, sprintScore, attendanceScore, organizationId"));
        }

        // Calculate overall score automatically as average
        double avg = (review.getGoalsScore() + review.getSprintScore() + review.getAttendanceScore()) / 3.0;
        // round to 1 decimal place
        double overall = Math.round(avg * 10.0) / 10.0;
        review.setOverallScore(overall);

        // Edit vs Create check
        if (review.getId() != null) {
            Optional<PerformanceReview> existingOpt = performanceReviewRepository.findById(review.getId());
            if (existingOpt.isPresent()) {
                PerformanceReview existing = existingOpt.get();
                existing.setPeriod(review.getPeriod());
                existing.setGoalsScore(review.getGoalsScore());
                existing.setSprintScore(review.getSprintScore());
                existing.setAttendanceScore(review.getAttendanceScore());
                existing.setOverallScore(review.getOverallScore());
                existing.setFeedback(review.getFeedback());
                PerformanceReview saved = performanceReviewRepository.save(existing);
                return ResponseEntity.ok(saved);
            }
        }

        PerformanceReview saved = performanceReviewRepository.save(review);
        return ResponseEntity.ok(saved);
    }
}
