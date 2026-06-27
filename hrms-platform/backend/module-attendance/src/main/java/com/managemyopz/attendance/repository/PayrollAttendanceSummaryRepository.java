package com.managemyopz.attendance.repository;

import com.managemyopz.attendance.entity.PayrollAttendanceSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PayrollAttendanceSummaryRepository extends JpaRepository<PayrollAttendanceSummary, UUID> {

    @Query("SELECT p FROM PayrollAttendanceSummary p WHERE p.deleted = false AND p.tenantId = :tenantId AND p.yearMonth = :yearMonth")
    List<PayrollAttendanceSummary> findAllByPeriod(@Param("tenantId") String tenantId, @Param("yearMonth") String yearMonth);

    @Query("SELECT p FROM PayrollAttendanceSummary p WHERE p.deleted = false AND p.tenantId = :tenantId AND p.employeeId = :employeeId AND p.yearMonth = :yearMonth")
    Optional<PayrollAttendanceSummary> findByEmployeeAndPeriod(@Param("tenantId") String tenantId, @Param("employeeId") UUID employeeId, @Param("yearMonth") String yearMonth);
}
