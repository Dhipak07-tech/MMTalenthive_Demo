package com.managemyopz.attendance.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "payroll_attendance_summary")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayrollAttendanceSummary extends BaseEntity {

    @Column(name = "employee_id", nullable = false)
    private UUID employeeId;

    @Column(name = "year_month", nullable = false)
    private String yearMonth; // format: "yyyy-MM"

    @Column(name = "working_days", nullable = false)
    private Double workingDays = 0.0;

    @Column(name = "payable_days", nullable = false)
    private Double payableDays = 0.0;

    @Column(name = "overtime_hours", nullable = false)
    private Double overtimeHours = 0.0;

    @Column(name = "lop_days", nullable = false)
    private Double lopDays = 0.0;

    @Column(name = "status", nullable = false)
    private String status = "DRAFT"; // DRAFT, LOCKED, EXPORTED
}
