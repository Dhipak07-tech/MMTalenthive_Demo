package com.managemyopz.attendance.repository;

import com.managemyopz.attendance.entity.EmployeeFaceData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmployeeFaceDataRepository extends JpaRepository<EmployeeFaceData, UUID> {

    @Query("SELECT f FROM EmployeeFaceData f WHERE f.deleted = false AND f.tenantId = :tenantId AND f.employeeId = :employeeId")
    Optional<EmployeeFaceData> findActiveByEmployee(@Param("tenantId") String tenantId, @Param("employeeId") UUID employeeId);

    @Query("SELECT f FROM EmployeeFaceData f WHERE f.deleted = false AND f.tenantId = :tenantId")
    List<EmployeeFaceData> findAllActiveByTenant(@Param("tenantId") String tenantId);
}
