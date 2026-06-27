package com.managemyopz.attendance.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "attendance_selfies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceSelfie extends BaseEntity {

    @Column(name = "attendance_id", nullable = false)
    private UUID attendanceId;

    @Column(name = "employee_id", nullable = false)
    private UUID employeeId;

    @Column(name = "image_path", nullable = false, columnDefinition = "TEXT")
    private String imagePath;

    @Column(name = "type", nullable = false)
    private String type; // CLOCK_IN, CLOCK_OUT

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;
}
