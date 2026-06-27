package com.managemyopz.attendance.repository;

import com.managemyopz.attendance.entity.AttendanceNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AttendanceNotificationRepository extends JpaRepository<AttendanceNotification, UUID> {

    @Query("SELECT n FROM AttendanceNotification n WHERE n.deleted = false AND n.tenantId = :tenantId AND n.employeeId = :employeeId ORDER BY n.sentAt DESC")
    List<AttendanceNotification> findByEmployee(@Param("tenantId") String tenantId, @Param("employeeId") UUID employeeId);
}
