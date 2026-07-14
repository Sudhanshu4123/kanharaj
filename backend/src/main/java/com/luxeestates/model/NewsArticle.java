package com.luxeestates.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "news_articles")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NewsArticle {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 200)
    private String title;
    
    @Column(nullable = false, unique = true, length = 250)
    private String slug;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String summary;
    
    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String content;
    
    @Column(length = 500)
    private String imageUrl;
    
    @Column(nullable = false, length = 100)
    @Builder.Default
    private String author = "Kanharaj Admin";
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
