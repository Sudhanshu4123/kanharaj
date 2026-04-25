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
            @RequestParam("files") List<MultipartFile> files
    ) {
        List<String> urls = new ArrayList<>();
        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;
            try {
                String url = cloudinaryService.uploadImage(file);
                urls.add(url);
            } catch (IOException e) {
                return ResponseEntity.internalServerError()
                        .body(Map.of("error", List.of("Failed to upload: " + file.getOriginalFilename())));
            }
        }
        return ResponseEntity.ok(Map.of("urls", urls));
    }
}
