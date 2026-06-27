package com.managemyopz.attendance.repository;

import com.managemyopz.attendance.entity.AttendanceSelfie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttendanceSelfieRepository extends JpaRepository<AttendanceSelfie, UUID> {

    @Query("SELECT s FROM AttendanceSelfie s WHERE s.deleted = false AND s.tenantId = :tenantId")
    List<AttendanceSelfie> findAllActiveByTenant(@Param("tenantId") String tenantId);

    Optional<AttendanceSelfie> findByAttendanceIdAndType(UUID attendanceId, String type);
}
