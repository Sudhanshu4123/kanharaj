package com.luxeestates.repository;

import com.luxeestates.model.Property;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long>, JpaSpecificationExecutor<Property> {
    
    Page<Property> findByStatus(Property.Status status, Pageable pageable);

    List<Property> findByProjectIdAndStatus(Long projectId, Property.Status status);

    Page<Property> findByStatusAndPropertyTypeNotIn(Property.Status status, List<Property.PropertyType> types, Pageable pageable);

    List<Property> findByPropertyTypeInAndStatus(List<Property.PropertyType> types, Property.Status status);
    
    Page<Property> findByFeaturedTrueAndStatus(Property.Status status, Pageable pageable);
    
    List<Property> findByUserIdAndStatus(Long userId, Property.Status status);
    
    @Query("SELECT p FROM Property p WHERE p.status = :status AND " +
           "(:city IS NULL OR p.city = :city) AND " +
           "((:propertyType IS NULL AND p.propertyType NOT IN ('RESIDENTIAL_PROJECT', 'COMMERCIAL_PROJECT')) OR (:propertyType IS NOT NULL AND p.propertyType = :propertyType)) AND " +
           "(:listingType IS NULL OR p.listingType = :listingType) AND " +
           "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.price <= :maxPrice)")
    Page<Property> searchProperties(
            Property.Status status,
            String city,
            Property.PropertyType propertyType,
            Property.ListingType listingType,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Pageable pageable
    );
    
    Long countByStatus(Property.Status status);
    
    Long countByStatusAndPropertyTypeNotIn(Property.Status status, List<Property.PropertyType> types);
    
    Long countByFeaturedTrueAndStatus(Property.Status status);
    
    @Query("SELECT COUNT(DISTINCT p.city) FROM Property p WHERE p.status = :status")
    Long countDistinctCityByStatus(Property.Status status);
}