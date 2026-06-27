package com.managemyopz.attendance.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "qr_attendance_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QrAttendanceSession extends BaseEntity {

    @Column(name = "qr_id", nullable = false)
    private String qrId;

    @Column(name = "employee_id")
    private UUID employeeId;

    @Column(name = "scan_time", nullable = false)
    private LocalDateTime scanTime = LocalDateTime.now();

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "office_location_id")
    private UUID officeLocationId;

    @Column(name = "department_id")
    private UUID departmentId;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;
}
