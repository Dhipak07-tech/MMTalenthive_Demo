package com.managemyopz.attendance.repository;

import com.managemyopz.attendance.entity.AttendanceAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AttendanceAuditLogRepository extends JpaRepository<AttendanceAuditLog, UUID> {

    @Query("SELECT a FROM AttendanceAuditLog a WHERE a.deleted = false AND a.tenantId = :tenantId ORDER BY a.timestamp DESC")
    List<AttendanceAuditLog> findAllActiveByTenant(@Param("tenantId") String tenantId);
}
