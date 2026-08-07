package com.zenelait.hrms.controller;

import com.zenelait.hrms.entity.Course;
import com.zenelait.hrms.entity.CourseProgress;
import com.zenelait.hrms.repository.CourseProgressRepository;
import com.zenelait.hrms.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/learning")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class LearningController {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CourseProgressRepository courseProgressRepository;

    @GetMapping("/courses")
    public ResponseEntity<?> getCourses(@RequestParam Long orgId) {
        List<Course> list = courseRepository.findByOrganizationId(orgId);
        return ResponseEntity.ok(list);
    }

    @PostMapping("/courses")
    public ResponseEntity<?> saveCourse(@RequestBody Course course) {
        if (course.getTitle() == null || course.getDuration() == null ||
            course.getTargetRole() == null || course.getOrganizationId() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing required fields: title, duration, targetRole, organizationId"));
        }
        Course saved = courseRepository.save(course);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/progress")
    public ResponseEntity<?> getProgress(@RequestParam Long orgId, @RequestParam String username) {
        List<CourseProgress> list = courseProgressRepository.findByUsernameAndOrganizationId(username, orgId);
        return ResponseEntity.ok(list);
    }

    @PostMapping("/progress/update")
    public ResponseEntity<?> updateProgress(@RequestBody Map<String, Object> request) {
        String username = (String) request.get("username");
        Number courseIdNum = (Number) request.get("courseId");
        Number progressNum = (Number) request.get("progress"); // percentage
        Number orgIdNum = (Number) request.get("organizationId");

        if (username == null || courseIdNum == null || progressNum == null || orgIdNum == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing parameters: username, courseId, progress, organizationId"));
        }

        Long courseId = courseIdNum.longValue();
        int progress = progressNum.intValue();
        Long orgId = orgIdNum.longValue();

        String status = "In Progress";
        if (progress >= 100) {
            progress = 100;
            status = "Completed";
        } else if (progress <= 0) {
            progress = 0;
            status = "Not Started";
        }

        Optional<CourseProgress> opt = courseProgressRepository.findByUsernameAndCourseIdAndOrganizationId(username, courseId, orgId);
        CourseProgress cp;
        if (opt.isPresent()) {
            cp = opt.get();
            cp.setProgress(progress);
            cp.setStatus(status);
        } else {
            cp = CourseProgress.builder()
                    .username(username)
                    .courseId(courseId)
                    .progress(progress)
                    .status(status)
                    .organizationId(orgId)
                    .build();
        }

        CourseProgress saved = courseProgressRepository.save(cp);
        return ResponseEntity.ok(saved);
    }
}
