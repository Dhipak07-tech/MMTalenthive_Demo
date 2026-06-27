package com.managemyopz.attendance.repository;

import com.managemyopz.attendance.entity.AttendanceInsight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AttendanceInsightRepository extends JpaRepository<AttendanceInsight, UUID> {

    @Query("SELECT i FROM AttendanceInsight i WHERE i.deleted = false AND i.tenantId = :tenantId")
    List<AttendanceInsight> findAllActiveByTenant(@Param("tenantId") String tenantId);

    @Query("SELECT i FROM AttendanceInsight i WHERE i.deleted = false AND i.tenantId = :tenantId AND i.employeeId = :employeeId")
    List<AttendanceInsight> findByEmployee(@Param("tenantId") String tenantId, @Param("employeeId") UUID employeeId);
}
