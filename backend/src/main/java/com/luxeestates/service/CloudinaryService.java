package com.luxeestates.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;
    
    @org.springframework.beans.factory.annotation.Value("${upload.path:uploads}")
    private String uploadPath;


    @org.springframework.beans.factory.annotation.Value("${cloudinary.cloud-name:your_cloud_name}")
    private String cloudName;

    /**
     * Uploads a single image file to Cloudinary under the "shrishyam" folder.
     * @param file the multipart image file
     * @return the secure HTTPS URL of the uploaded image
     */
    public String uploadImage(MultipartFile file) throws IOException {
        // Only attempt Cloudinary if configured with something other than placeholders
        boolean isCloudinaryConfigured = cloudName != null && 
                                       !cloudName.trim().isEmpty() && 
                                       !"your_cloud_name".equals(cloudName) &&
                                       !"Root".equals(cloudName);

        if (isCloudinaryConfigured) {
            try {
                Map<?, ?> uploadResult = cloudinary.uploader().upload(
                        file.getBytes(),
                        ObjectUtils.asMap(
                                "folder", "shrishyam",
                                "resource_type", "image",
                                "quality", "auto",
                                "fetch_format", "auto"
                        )
                );
                return (String) uploadResult.get("secure_url");
            } catch (Exception e) {
                // If the user explicitly wants Cloudinary but it fails, we should let them know
                throw new IOException("Cloudinary upload failed: " + e.getMessage() + ". Please check your API keys.");
            }
        }

        // Fallback to local storage (only if Cloudinary is not configured)
        String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename().replaceAll("[^a-zA-Z0-9.-]", "_");
        java.nio.file.Path path = java.nio.file.Paths.get(uploadPath, filename).toAbsolutePath().normalize();
        java.nio.file.Files.createDirectories(path.getParent());
        java.nio.file.Files.copy(file.getInputStream(), path, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
        return "/uploads/" + filename;

    }

    /**
     * Deletes an image from Cloudinary using its public_id.
     * @param publicId the public_id of the image on Cloudinary
     */
    public void deleteImage(String publicId) throws IOException {
        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }
}
