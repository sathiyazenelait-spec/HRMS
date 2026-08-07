package com.zenelait.hrms.controller;

import com.zenelait.hrms.entity.Candidate;
import com.zenelait.hrms.entity.JobRequisition;
import com.zenelait.hrms.repository.CandidateRepository;
import com.zenelait.hrms.repository.JobRequisitionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/recruitment")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class RecruitmentController {

    @Autowired
    private JobRequisitionRepository jobRequisitionRepository;

    @Autowired
    private CandidateRepository candidateRepository;

    @GetMapping("/jobs")
    public ResponseEntity<?> getJobs(@RequestParam Long orgId) {
        List<JobRequisition> jobs = jobRequisitionRepository.findByOrganizationId(orgId);
        return ResponseEntity.ok(jobs);
    }

    @PostMapping("/jobs")
    public ResponseEntity<?> createJob(@RequestBody JobRequisition job) {
        if (job.getTitle() == null || job.getDepartment() == null || job.getOrganizationId() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing required fields: title, department, organizationId"));
        }
        if (job.getStatus() == null) {
            job.setStatus("Open");
        }
        JobRequisition saved = jobRequisitionRepository.save(job);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/candidates")
    public ResponseEntity<?> getCandidates(@RequestParam Long orgId) {
        List<Candidate> candidates = candidateRepository.findByOrganizationId(orgId);
        return ResponseEntity.ok(candidates);
    }

    @PostMapping("/candidates")
    public ResponseEntity<?> createCandidate(@RequestBody Candidate candidate) {
        if (candidate.getName() == null || candidate.getEmail() == null || 
            candidate.getJobRequisitionId() == null || candidate.getOrganizationId() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing required fields: name, email, jobRequisitionId, organizationId"));
        }
        if (candidate.getStage() == null) {
            candidate.setStage("Applied");
        }
        Candidate saved = candidateRepository.save(candidate);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/candidates/stage")
    public ResponseEntity<?> updateCandidateStage(@RequestBody Map<String, Object> request) {
        Number candidateIdNum = (Number) request.get("candidateId");
        String newStage = (String) request.get("stage");

        if (candidateIdNum == null || newStage == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing parameters: candidateId, stage"));
        }

        Optional<Candidate> candidateOpt = candidateRepository.findById(candidateIdNum.longValue());
        if (!candidateOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Candidate candidate = candidateOpt.get();
        candidate.setStage(newStage);
        candidateRepository.save(candidate);
        return ResponseEntity.ok(candidate);
    }
}
