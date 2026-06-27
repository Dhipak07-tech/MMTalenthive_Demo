package com.managemyopz.attendance.repository;

import com.managemyopz.attendance.entity.AttendanceSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttendanceSettingsRepository extends JpaRepository<AttendanceSettings, UUID> {
    Optional<AttendanceSettings> findByTenantId(String tenantId);
}
