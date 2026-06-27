package com.managemyopz.attendance.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "attendance_insights")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceInsight extends BaseEntity {

    @Column(name = "employee_id")
    private UUID employeeId;

    @Column(name = "department_id")
    private UUID departmentId;

    @Column(name = "insight_type", nullable = false)
    private String insightType;

    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "severity", nullable = false)
    private String severity = "INFO";

    @Column(name = "risk_score", nullable = false)
    private Double riskScore = 0.0;

    @Column(name = "burnout_risk")
    private String burnoutRisk;

    @Column(name = "productivity_trend")
    private String productivityTrend;
}
