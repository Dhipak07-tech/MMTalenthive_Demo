package com.managemyopz.attendance.repository;

import com.managemyopz.attendance.entity.QrAttendanceSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface QrAttendanceSessionRepository extends JpaRepository<QrAttendanceSession, UUID> {

    @Query("SELECT q FROM QrAttendanceSession q WHERE q.deleted = false AND q.tenantId = :tenantId AND q.qrId = :qrId AND q.isActive = true")
    Optional<QrAttendanceSession> findActiveByQrId(@Param("tenantId") String tenantId, @Param("qrId") String qrId);

    @Query("SELECT q FROM QrAttendanceSession q WHERE q.deleted = false AND q.tenantId = :tenantId ORDER BY q.scanTime DESC")
    List<QrAttendanceSession> findAllActiveByTenant(@Param("tenantId") String tenantId);
}
