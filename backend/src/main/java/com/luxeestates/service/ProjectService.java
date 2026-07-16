package com.luxeestates.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.luxeestates.dto.PropertyDto;
import com.luxeestates.model.Project;
import com.luxeestates.model.User;
import com.luxeestates.repository.ProjectRepository;
import com.luxeestates.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final NotificationService notificationService;

    public Page<PropertyDto> getAllProjects(
            String search,
            String city,
            String state,
            List<String> propertyTypes,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Boolean verified,
            List<String> constructionStatus,
            Pageable pageable
    ) {
        List<Project.PropertyType> mappedEnumTypes = new ArrayList<>();
        if (propertyTypes != null) {
            for (String typeStr : propertyTypes) {
                if (typeStr != null && !typeStr.trim().isEmpty()) {
                    try {
                        mappedEnumTypes.add(Project.PropertyType.valueOf(typeStr.toUpperCase().trim()));
                    } catch (IllegalArgumentException e) {
                        // ignore
                    }
                }
            }
        }

        Specification<Project> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Always filter by status = ACTIVE for public queries
            predicates.add(cb.equal(root.get("status"), Project.Status.ACTIVE));

            // 1. Search Query
            if (search != null && !search.trim().isEmpty()) {
                String searchPattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("title")), searchPattern),
                    cb.like(cb.lower(root.get("description")), searchPattern),
                    cb.like(cb.lower(root.get("address")), searchPattern),
                    cb.like(cb.lower(root.get("city")), searchPattern),
                    cb.like(cb.lower(root.get("state")), searchPattern),
                    cb.like(cb.lower(root.get("developer")), searchPattern)
                ));
            }

            // 2. City
            if (city != null && !city.trim().isEmpty()) {
                predicates.add(cb.equal(cb.lower(root.get("city")), city.trim().toLowerCase()));
            }

            // 3. State
            if (state != null && !state.trim().isEmpty()) {
                predicates.add(cb.equal(cb.lower(root.get("state")), state.trim().toLowerCase()));
            }

            // 4. Property Types
            if (!mappedEnumTypes.isEmpty()) {
                predicates.add(root.get("propertyType").in(mappedEnumTypes));
            }

            // 5. Price Min & Max
            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), minPrice));
            }
            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), maxPrice));
            }

            // 6. Verified
            if (verified != null && verified) {
                predicates.add(cb.equal(root.get("verified"), true));
            }

            // 7. Construction Status
            if (constructionStatus != null && !constructionStatus.isEmpty()) {
                predicates.add(root.get("constructionStatus").in(constructionStatus));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Sort sort = Sort.by(Sort.Order.desc("verified"))
                .and(Sort.by(Sort.Order.desc("featured")));
        if (pageable.getSort().isSorted()) {
            sort = sort.and(pageable.getSort());
        } else {
            sort = sort.and(Sort.by(Sort.Order.desc("createdAt")));
        }
        Pageable customPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);
        return projectRepository.findAll(spec, customPageable).map(PropertyDto::fromProjectEntity);
    }

    public List<PropertyDto> getFeaturedProjects() {
        return projectRepository.findByFeaturedTrueAndStatus(Project.Status.ACTIVE, PageRequest.of(0, 6))
                .map(PropertyDto::fromProjectEntity)
                .getContent();
    }

    public PropertyDto getProjectById(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        return PropertyDto.fromProjectEntity(project);
    }

    @Transactional
    public PropertyDto createProject(PropertyDto dto, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Project.PropertyType pType = Project.PropertyType.RESIDENTIAL_PROJECT;
        if (dto.getPropertyType() != null) {
            try {
                pType = Project.PropertyType.valueOf(dto.getPropertyType().name());
            } catch (Exception e) {}
        }

        Project project = Project.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .price(dto.getPrice())
                .propertyType(pType)
                .address(dto.getAddress())
                .city(dto.getCity())
                .state(dto.getState())
                .pincode(dto.getPincode())
                .amenities(toJson(dto.getAmenities()))
                .images(toJson(dto.getImages()))
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .status(Project.Status.ACTIVE)
                .featured(dto.getFeatured() != null ? dto.getFeatured() : false)
                .views(0)
                .developer(dto.getDeveloper())
                .reraId(dto.getReraId())
                .constructionStatus(dto.getConstructionStatus())
                .possessionDate(dto.getPossessionDate())
                .projectUnits(dto.getProjectUnits())
                .areaUnit(dto.getAreaUnit())
                .projectArea(dto.getProjectArea())
                .sizes(dto.getSizes())
                .configurations(dto.getConfigurations())
                .projectSize(dto.getProjectSize())
                .launchDate(dto.getLaunchDate())
                .avgPrice(dto.getAvgPrice())
                .brochureUrl(dto.getBrochureUrl())
                .user(user)
                .build();

        Project savedProject = projectRepository.save(project);

        try {
            notificationService.sendNotification(
                    user.getId(),
                    "Project Listed Successfully",
                    "Your developer project '" + savedProject.getTitle() + "' has been listed successfully!",
                    "PROPERTY_LISTED",
                    "/projects"
            );
        } catch (Exception e) {
            System.err.println("Failed to send project listing notification: " + e.getMessage());
        }

        return PropertyDto.fromProjectEntity(savedProject);
    }

    @Transactional
    public PropertyDto updateProject(Long id, PropertyDto dto, Long userId) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        boolean isAdmin = currentUser.getRole() == User.Role.ADMIN;

        if (!project.getUser().getId().equals(userId) && !isAdmin) {
            throw new RuntimeException("Unauthorized to update this project");
        }

        Project.PropertyType pType = Project.PropertyType.RESIDENTIAL_PROJECT;
        if (dto.getPropertyType() != null) {
            try {
                pType = Project.PropertyType.valueOf(dto.getPropertyType().name());
            } catch (Exception e) {}
        }

        project.setTitle(dto.getTitle());
        project.setDescription(dto.getDescription());
        project.setPrice(dto.getPrice());
        project.setPropertyType(pType);
        project.setAddress(dto.getAddress());
        project.setCity(dto.getCity());
        project.setState(dto.getState());
        project.setPincode(dto.getPincode());
        project.setAmenities(toJson(dto.getAmenities()));
        project.setImages(toJson(dto.getImages()));
        project.setDeveloper(dto.getDeveloper());
        project.setReraId(dto.getReraId());
        project.setConstructionStatus(dto.getConstructionStatus());
        project.setPossessionDate(dto.getPossessionDate());
        project.setProjectUnits(dto.getProjectUnits());
        project.setAreaUnit(dto.getAreaUnit());
        project.setProjectArea(dto.getProjectArea());
        project.setSizes(dto.getSizes());
        project.setConfigurations(dto.getConfigurations());
        project.setProjectSize(dto.getProjectSize());
        project.setLaunchDate(dto.getLaunchDate());
        project.setAvgPrice(dto.getAvgPrice());
        project.setBrochureUrl(dto.getBrochureUrl());
        project.setLatitude(dto.getLatitude());
        project.setLongitude(dto.getLongitude());

        return PropertyDto.fromProjectEntity(projectRepository.save(project));
    }

    @Transactional
    public void deleteProject(Long id, Long userId) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        boolean isAdmin = currentUser.getRole() == User.Role.ADMIN;

        if (!project.getUser().getId().equals(userId) && !isAdmin) {
            throw new RuntimeException("Unauthorized to delete this project");
        }

        projectRepository.deleteById(id);
    }

    public List<PropertyDto> getProjectsByUserId(Long userId) {
        return projectRepository.findByUserIdAndStatus(userId, Project.Status.ACTIVE)
                .stream()
                .map(PropertyDto::fromProjectEntity)
                .collect(Collectors.toList());
    }

    public List<PropertyDto> getActiveProjects() {
        return projectRepository.findByStatus(Project.Status.ACTIVE)
                .stream()
                .map(PropertyDto::fromProjectEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public void incrementViews(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        project.setViews(project.getViews() != null ? project.getViews() + 1 : 1);
        projectRepository.save(project);
    }

    public Long getTotalProjects() {
        return projectRepository.count();
    }

    public Long getActiveProjectsCount() {
        return projectRepository.countByStatus(Project.Status.ACTIVE);
    }

    public Long getFeaturedProjectsCount() {
        return projectRepository.countByFeaturedTrueAndStatus(Project.Status.ACTIVE);
    }

    private String toJson(List<String> list) {
        if (list == null) return "[]";
        try {
            return objectMapper.writeValueAsString(list);
        } catch (Exception e) {
            return "[]";
        }
    }
}
