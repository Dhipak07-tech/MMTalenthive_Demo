package com.managemyopz.attendance.repository;

import com.managemyopz.attendance.entity.AttendanceRegularization;
import com.managemyopz.attendance.entity.AttendanceRegularization.RegularizationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AttendanceRegularizationRepository extends JpaRepository<AttendanceRegularization, UUID> {
    List<AttendanceRegularization> findByEmployeeIdOrderByCreatedAtDesc(UUID employeeId);

    @Query("SELECT r FROM AttendanceRegularization r WHERE r.deleted = false AND r.tenantId = :tenantId")
    List<AttendanceRegularization> findAllActiveByTenant(@Param("tenantId") String tenantId);

    @Query("SELECT r FROM AttendanceRegularization r WHERE r.deleted = false AND r.tenantId = :tenantId AND r.status = :status")
    List<AttendanceRegularization> findAllActiveByTenantAndStatus(@Param("tenantId") String tenantId, @Param("status") RegularizationStatus status);
}
