package com.managemyopz.attendance.repository;

import com.managemyopz.attendance.entity.OfficeLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OfficeLocationRepository extends JpaRepository<OfficeLocation, UUID> {

    @Query("SELECT o FROM OfficeLocation o WHERE o.deleted = false AND o.tenantId = :tenantId")
    List<OfficeLocation> findAllActiveByTenant(@Param("tenantId") String tenantId);
}
