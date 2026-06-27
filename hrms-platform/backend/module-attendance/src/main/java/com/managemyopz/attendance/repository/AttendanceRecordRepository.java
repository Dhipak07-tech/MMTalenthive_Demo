package com.managemyopz.attendance.repository;

import com.managemyopz.attendance.entity.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, UUID> {
    Optional<AttendanceRecord> findByEmployeeIdAndAttendanceDate(UUID employeeId, LocalDate attendanceDate);

    List<AttendanceRecord> findByEmployeeIdAndAttendanceDateBetweenOrderByAttendanceDateDesc(UUID employeeId, LocalDate startDate, LocalDate endDate);

    List<AttendanceRecord> findByEmployeeIdOrderByAttendanceDateDesc(UUID employeeId);

    @Query("SELECT r FROM AttendanceRecord r WHERE r.deleted = false AND r.tenantId = :tenantId AND r.attendanceDate = :date")
    List<AttendanceRecord> findAllActiveByTenantAndDate(@Param("tenantId") String tenantId, @Param("date") LocalDate date);

    @Query("SELECT r FROM AttendanceRecord r WHERE r.deleted = false AND r.tenantId = :tenantId AND r.attendanceDate BETWEEN :startDate AND :endDate")
    List<AttendanceRecord> findAllActiveByTenantAndDateRange(@Param("tenantId") String tenantId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
