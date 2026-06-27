package com.managemyopz.attendance.repository;

import com.managemyopz.attendance.entity.BiometricDevice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BiometricDeviceRepository extends JpaRepository<BiometricDevice, UUID> {

    @Query("SELECT d FROM BiometricDevice d WHERE d.deleted = false AND d.tenantId = :tenantId")
    List<BiometricDevice> findAllActiveByTenant(@Param("tenantId") String tenantId);
}
