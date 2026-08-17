package com.zenelait.hrms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Entity
@Table(name = "landing_page_blocks")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LandingPageBlock implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "block_id", nullable = false, unique = true)
    private String blockId;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 1000)
    private String subtitle;

    @Column(name = "cta_text")
    private String ctaText;

    @Column(nullable = false)
    private Boolean visible;

    @Column(name = "content_list", length = 2000)
    private String contentList;

    @Column(name = "image_url", length = 1000)
    private String imageUrl;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;
}
