package com.luxeestates.controller;

import com.luxeestates.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class UploadController {

    private final CloudinaryService cloudinaryService;

    /**
     * Uploads one or multiple images to Cloudinary.
     * Returns a list of secure image URLs.
     * Requires authentication (any logged-in user).
     */
    @PostMapping("/images")
    public ResponseEntity<Map<String, List<String>>> uploadImages(
            @RequestParam("files") MultipartFile[] files
    ) {
        List<String> urls = new ArrayList<>();
        if (files != null) {
            for (MultipartFile file : files) {
                if (file.isEmpty()) continue;
                
                // File Type Validation — Only images allowed (No PDF, No Video)
                String contentType = file.getContentType();
                if (contentType == null || (!contentType.equals("image/jpeg") &&
                    !contentType.equals("image/png") &&
                    !contentType.equals("image/webp") &&
                    !contentType.equals("image/jpg") &&
                    !contentType.equals("image/gif"))) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", List.of("Only image files are allowed (JPG, PNG, WEBP). Videos and PDFs are not permitted.")));
                }

                try {
                    String url = cloudinaryService.uploadImage(file);
                    urls.add(url);
                } catch (Exception e) {
                    return ResponseEntity.internalServerError()
                            .body(Map.of("error", List.of("Failed to upload: " + e.getMessage())));
                }
            }
        }
        return ResponseEntity.ok(Map.of("urls", urls));
    }

    @PostMapping("/document")
    public ResponseEntity<Map<String, String>> uploadDocument(
            @RequestParam("file") MultipartFile file
    ) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
        }

        String contentType = file.getContentType();
        if (contentType == null || (!contentType.equals("application/pdf") &&
            !contentType.equals("image/jpeg") &&
            !contentType.equals("image/png") &&
            !contentType.equals("image/jpg") &&
            !contentType.equals("image/webp"))) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Only PDF and image files are allowed."));
        }

        try {
            String url = cloudinaryService.uploadDocument(file);
            return ResponseEntity.ok(Map.of("url", url));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to upload document: " + e.getMessage()));
        }
    }
}
