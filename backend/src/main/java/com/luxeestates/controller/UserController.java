package com.luxeestates.controller;

import com.luxeestates.dto.UserDto;
import com.luxeestates.model.User;
import com.luxeestates.repository.UserRepository;
import com.luxeestates.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserRepository userRepository;

    @PutMapping("/profile")
    public ResponseEntity<UserDto> updateProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, String> request
    ) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.containsKey("profileImage")) {
            user.setProfileImage(request.get("profileImage"));
        }
        if (request.containsKey("description")) {
            user.setDescription(request.get("description"));
        }
        if (request.containsKey("experienceYears")) {
            user.setExperienceYears(request.get("experienceYears"));
        }
        if (request.containsKey("name")) {
            user.setName(request.get("name"));
        }
        if (request.containsKey("phone")) {
            user.setPhone(request.get("phone"));
        }

        userRepository.save(user);

        return ResponseEntity.ok(UserDto.fromEntity(user));
    }
}
