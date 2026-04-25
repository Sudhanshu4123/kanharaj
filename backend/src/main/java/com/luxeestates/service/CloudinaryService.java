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

    /**
     * Uploads a single image file to Cloudinary under the "shrishyam" folder.
     * @param file the multipart image file
     * @return the secure HTTPS URL of the uploaded image
     */
    public String uploadImage(MultipartFile file) throws IOException {
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
    }

    /**
     * Deletes an image from Cloudinary using its public_id.
     * @param publicId the public_id of the image on Cloudinary
     */
    public void deleteImage(String publicId) throws IOException {
        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }
}
