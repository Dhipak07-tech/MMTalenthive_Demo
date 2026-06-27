package com.managemyopz.attendance.repository;

import com.managemyopz.attendance.entity.FaceVerificationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FaceVerificationLogRepository extends JpaRepository<FaceVerificationLog, UUID> {

    @Query("SELECT v FROM FaceVerificationLog v WHERE v.deleted = false AND v.tenantId = :tenantId AND v.employeeId = :employeeId ORDER BY v.timestamp DESC")
    List<FaceVerificationLog> findByEmployee(@Param("tenantId") String tenantId, @Param("employeeId") UUID employeeId);

    @Query("SELECT v FROM FaceVerificationLog v WHERE v.deleted = false AND v.tenantId = :tenantId ORDER BY v.timestamp DESC")
    List<FaceVerificationLog> findAllActiveByTenant(@Param("tenantId") String tenantId);
}
