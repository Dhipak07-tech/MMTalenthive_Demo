package com.managemyopz.attendance.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "attendance_heatmaps")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceHeatmap extends BaseEntity {

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "department_id")
    private UUID departmentId;

    @Column(name = "location_id")
    private UUID locationId;

    @Column(name = "total_present", nullable = false)
    private Integer totalPresent = 0;

    @Column(name = "total_absent", nullable = false)
    private Integer totalAbsent = 0;

    @Column(name = "total_late", nullable = false)
    private Integer totalLate = 0;
}
