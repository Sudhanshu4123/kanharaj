package com.luxeestates.controller;

import com.luxeestates.model.Feedback;
import com.luxeestates.repository.FeedbackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/feedbacks")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackRepository feedbackRepository;

    @PostMapping
    public ResponseEntity<Feedback> createFeedback(@RequestBody Feedback feedback) {
        if (feedback.getCreatedAt() == null) {
            feedback.setCreatedAt(LocalDateTime.now());
        }
        Feedback saved = feedbackRepository.save(feedback);
        return ResponseEntity.ok(saved);
    }

    /** Public testimonials for homepage — no email/phone exposed */
    @GetMapping("/public")
    public ResponseEntity<List<Feedback>> getPublicFeedbacks() {
        List<Feedback> all = feedbackRepository.findAll();
        List<Feedback> safe = all.stream()
                .filter(f -> f.getRating() != null && f.getRating() >= 4)
                .filter(f -> f.getComment() != null && !f.getComment().isBlank())
                .sorted((a, b) -> {
                    if (a.getCreatedAt() == null) return 1;
                    if (b.getCreatedAt() == null) return -1;
                    return b.getCreatedAt().compareTo(a.getCreatedAt());
                })
                .limit(20)
                .map(f -> {
                    Feedback copy = new Feedback();
                    copy.setId(f.getId());
                    copy.setName(f.getName());
                    copy.setCategory(f.getCategory());
                    copy.setComment(f.getComment());
                    copy.setRating(f.getRating());
                    copy.setCreatedAt(f.getCreatedAt());
                    return copy;
                })
                .toList();
        return ResponseEntity.ok(safe);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Feedback>> getAllFeedbacks() {
        return ResponseEntity.ok(feedbackRepository.findAll());
    }
}
