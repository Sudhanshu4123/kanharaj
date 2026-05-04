package com.luxeestates.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${upload.path:uploads}")
    private String uploadPath;


    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Map /uploads/** to the physical directory where images are saved
        Path path = Paths.get(uploadPath).toAbsolutePath().normalize();
        
        // Ensure directory exists
        File uploadDir = path.toFile();
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }
        
        String absolutePath = path.toUri().toString();
        if (!absolutePath.endsWith("/")) {
            absolutePath += "/";
        }
        
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(absolutePath);
    }


}
