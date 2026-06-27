package com.managemyopz.attendance.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "attendance_locations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceLocation extends BaseEntity {

    @Column(name = "attendance_id", nullable = false)
    private UUID attendanceId;

    @Column(name = "employee_id", nullable = false)
    private UUID employeeId;

    @Column(name = "latitude", nullable = false)
    private Double latitude;

    @Column(name = "longitude", nullable = false)
    private Double longitude;

    @Column(name = "distance", nullable = false)
    private Double distance;

    @Column(name = "inside_radius", nullable = false)
    private boolean insideRadius;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;
}
