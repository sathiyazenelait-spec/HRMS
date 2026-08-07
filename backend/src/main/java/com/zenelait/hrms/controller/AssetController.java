package com.zenelait.hrms.controller;

import com.zenelait.hrms.entity.Asset;
import com.zenelait.hrms.repository.AssetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/assets")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AssetController {

    @Autowired
    private AssetRepository assetRepository;

    @GetMapping
    public ResponseEntity<?> getAssets(@RequestParam Long orgId, @RequestParam(required = false) String username) {
        if (username != null && !username.trim().isEmpty()) {
            List<Asset> list = assetRepository.findByAssigneeAndOrganizationId(username, orgId);
            return ResponseEntity.ok(list);
        }
        List<Asset> list = assetRepository.findByOrganizationId(orgId);
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<?> saveAsset(@RequestBody Asset asset) {
        if (asset.getAssetTag() == null || asset.getName() == null || asset.getOrganizationId() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing required fields: assetTag, name, organizationId"));
        }
        if (asset.getAssignee() == null) {
            asset.setAssignee("Unassigned");
        }
        if (asset.getStatus() == null) {
            asset.setStatus("In Stock");
        }
        
        // Handle edit vs create
        if (asset.getId() != null) {
            Optional<Asset> existingOpt = assetRepository.findById(asset.getId());
            if (existingOpt.isPresent()) {
                Asset existing = existingOpt.get();
                existing.setName(asset.getName());
                existing.setStatus(asset.getStatus());
                existing.setAssignee(asset.getAssignee());
                Asset saved = assetRepository.save(existing);
                return ResponseEntity.ok(saved);
            }
        }
        
        Asset saved = assetRepository.save(asset);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/assign")
    public ResponseEntity<?> assignAsset(@RequestBody Map<String, Object> request) {
        Number assetIdNum = (Number) request.get("assetId");
        String assignee = (String) request.get("assignee");
        String status = (String) request.get("status");

        if (assetIdNum == null || assignee == null || status == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing parameters: assetId, assignee, status"));
        }

        Optional<Asset> assetOpt = assetRepository.findById(assetIdNum.longValue());
        if (!assetOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Asset asset = assetOpt.get();
        asset.setAssignee(assignee);
        asset.setStatus(status);
        assetRepository.save(asset);
        return ResponseEntity.ok(asset);
    }
}
