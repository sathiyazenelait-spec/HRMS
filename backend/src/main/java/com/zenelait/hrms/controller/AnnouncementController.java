package com.zenelait.hrms.controller;

import com.zenelait.hrms.entity.Announcement;
import com.zenelait.hrms.repository.AnnouncementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/announcements")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AnnouncementController {

    @Autowired
    private AnnouncementRepository announcementRepository;

    @GetMapping
    public ResponseEntity<?> getAnnouncements(@RequestParam Long orgId) {
        List<Announcement> list = announcementRepository.findByOrganizationId(orgId);
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<?> saveAnnouncement(@RequestBody Announcement ann) {
        if (ann.getTitle() == null || ann.getContent() == null ||
            ann.getTargetAudience() == null || ann.getCategory() == null ||
            ann.getPublishDate() == null || ann.getAuthor() == null ||
            ann.getOrganizationId() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing required fields: title, content, targetAudience, category, publishDate, author, organizationId"));
        }
        Announcement saved = announcementRepository.save(ann);
        return ResponseEntity.ok(saved);
    }
}
