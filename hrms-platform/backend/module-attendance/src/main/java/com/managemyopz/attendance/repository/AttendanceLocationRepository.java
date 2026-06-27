package com.managemyopz.attendance.repository;

import com.managemyopz.attendance.entity.AttendanceLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttendanceLocationRepository extends JpaRepository<AttendanceLocation, UUID> {

    @Query("SELECT al FROM AttendanceLocation al WHERE al.deleted = false AND al.tenantId = :tenantId")
    List<AttendanceLocation> findAllActiveByTenant(@Param("tenantId") String tenantId);

    Optional<AttendanceLocation> findByAttendanceId(UUID attendanceId);
}
