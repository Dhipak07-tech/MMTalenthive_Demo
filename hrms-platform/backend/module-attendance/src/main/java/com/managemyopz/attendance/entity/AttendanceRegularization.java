package com.managemyopz.attendance.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "attendance_regularizations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceRegularization extends BaseEntity {

    @Column(name = "employee_id", nullable = false)
    private UUID employeeId;

    @Column(name = "attendance_id")
    private UUID attendanceId;

    @Column(name = "request_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private RequestType requestType;

    @Column(name = "requested_check_in")
    private LocalDateTime requestedCheckIn;

    @Column(name = "requested_check_out")
    private LocalDateTime requestedCheckOut;

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private RegularizationStatus status;

    @Column(name = "approved_by")
    private String approvedBy;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    public enum RequestType {
        MISSING_CHECK_IN, MISSING_CHECK_OUT, WRONG_TIMING, ON_DUTY
    }

    public enum RegularizationStatus {
        PENDING, APPROVED, REJECTED
    }
}
