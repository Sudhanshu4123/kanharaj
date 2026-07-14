package com.luxeestates.controller;

import com.luxeestates.model.NewsArticle;
import com.luxeestates.repository.NewsArticleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/news")
@RequiredArgsConstructor
public class NewsArticleController {

    private final NewsArticleRepository newsArticleRepository;

    @GetMapping
    public ResponseEntity<List<NewsArticle>> getAllNews() {
        List<NewsArticle> all = newsArticleRepository.findAll();
        // Sort by createdAt descending
        List<NewsArticle> sorted = all.stream()
                .sorted((a, b) -> {
                    if (a.getCreatedAt() == null) return 1;
                    if (b.getCreatedAt() == null) return -1;
                    return b.getCreatedAt().compareTo(a.getCreatedAt());
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(sorted);
    }

    @GetMapping("/{idOrSlug}")
    public ResponseEntity<NewsArticle> getNewsBySlugOrId(@PathVariable String idOrSlug) {
        Optional<NewsArticle> article = Optional.empty();
        
        // Try parsing as ID first
        try {
            Long id = Long.parseLong(idOrSlug);
            article = newsArticleRepository.findById(id);
        } catch (NumberFormatException e) {
            // Treat as slug
        }
        
        if (article.isEmpty()) {
            article = newsArticleRepository.findBySlug(idOrSlug);
        }
        
        return article.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<NewsArticle> createNews(@RequestBody NewsArticle newsArticle) {
        if (newsArticle.getTitle() == null || newsArticle.getTitle().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        
        String baseSlug = newsArticle.getSlug();
        if (baseSlug == null || baseSlug.isBlank()) {
            baseSlug = generateSlug(newsArticle.getTitle());
        }
        newsArticle.setSlug(makeSlugUnique(baseSlug, null));
        
        if (newsArticle.getCreatedAt() == null) {
            newsArticle.setCreatedAt(LocalDateTime.now());
        }
        newsArticle.setUpdatedAt(LocalDateTime.now());
        
        NewsArticle saved = newsArticleRepository.save(newsArticle);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<NewsArticle> updateNews(@PathVariable Long id, @RequestBody NewsArticle details) {
        return newsArticleRepository.findById(id).map(article -> {
            article.setTitle(details.getTitle());
            article.setSummary(details.getSummary());
            article.setContent(details.getContent());
            article.setImageUrl(details.getImageUrl());
            if (details.getAuthor() != null && !details.getAuthor().isBlank()) {
                article.setAuthor(details.getAuthor());
            }
            
            String baseSlug = details.getSlug();
            if (baseSlug == null || baseSlug.isBlank()) {
                baseSlug = generateSlug(details.getTitle());
            }
            article.setSlug(makeSlugUnique(baseSlug, id));
            
            article.setUpdatedAt(LocalDateTime.now());
            
            NewsArticle updated = newsArticleRepository.save(article);
            return ResponseEntity.ok(updated);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteNews(@PathVariable Long id) {
        if (newsArticleRepository.existsById(id)) {
            newsArticleRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    private String generateSlug(String title) {
        if (title == null) return "";
        return title.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "") // remove special chars
                .replaceAll("\\s+", "-")       // replace spaces with -
                .replaceAll("-+", "-")          // collapse duplicate -
                .trim();
    }

    private String makeSlugUnique(String baseSlug, Long excludeId) {
        String slug = baseSlug;
        int count = 1;
        while (true) {
            Optional<NewsArticle> existing = newsArticleRepository.findBySlug(slug);
            if (existing.isEmpty() || (excludeId != null && existing.get().getId().equals(excludeId))) {
                break;
            }
            slug = baseSlug + "-" + count++;
        }
        return slug;
    }
}
