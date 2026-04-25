package com.luxeestates.repository;

import com.luxeestates.model.Inquiry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InquiryRepository extends JpaRepository<Inquiry, Long> {
    
    Page<Inquiry> findByPropertyId(Long propertyId, Pageable pageable);
    
    List<Inquiry> findByUserId(Long userId);
    
    Long countByStatus(Inquiry.InquiryStatus status);
    
    Long countByPropertyId(Long propertyId);
}