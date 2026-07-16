package com.luxeestates.repository;

import com.luxeestates.model.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long>, JpaSpecificationExecutor<Project> {
    
    Page<Project> findByStatus(Project.Status status, Pageable pageable);

    List<Project> findByStatus(Project.Status status);

    Page<Project> findByFeaturedTrueAndStatus(Project.Status status, Pageable pageable);

    List<Project> findByUserIdAndStatus(Long userId, Project.Status status);

    Long countByStatus(Project.Status status);

    Long countByFeaturedTrueAndStatus(Project.Status status);
}
