package com.managemyopz.attendance.repository;

import com.managemyopz.attendance.entity.AttendanceHeatmap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface AttendanceHeatmapRepository extends JpaRepository<AttendanceHeatmap, UUID> {

    @Query("SELECT h FROM AttendanceHeatmap h WHERE h.deleted = false AND h.tenantId = :tenantId AND h.date BETWEEN :startDate AND :endDate")
    List<AttendanceHeatmap> findByDateRange(@Param("tenantId") String tenantId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
