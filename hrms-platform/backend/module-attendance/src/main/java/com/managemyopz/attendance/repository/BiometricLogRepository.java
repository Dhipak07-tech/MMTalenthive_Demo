package com.managemyopz.attendance.repository;

import com.managemyopz.attendance.entity.BiometricLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BiometricLogRepository extends JpaRepository<BiometricLog, UUID> {

    @Query("SELECT l FROM BiometricLog l WHERE l.deleted = false AND l.tenantId = :tenantId")
    List<BiometricLog> findAllActiveByTenant(@Param("tenantId") String tenantId);
}
