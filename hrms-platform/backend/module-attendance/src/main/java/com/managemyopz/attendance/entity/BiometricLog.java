package com.managemyopz.attendance.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "biometric_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BiometricLog extends BaseEntity {

    @Column(name = "employee_id", nullable = false)
    private UUID employeeId;

    @Column(name = "device_id", nullable = false)
    private UUID deviceId;

    @Column(name = "punch_time", nullable = false)
    private LocalDateTime punchTime;

    @Column(name = "punch_type", nullable = false)
    private String punchType;

    @Column(name = "sync_status", nullable = false)
    private String syncStatus = "PENDING";
}
