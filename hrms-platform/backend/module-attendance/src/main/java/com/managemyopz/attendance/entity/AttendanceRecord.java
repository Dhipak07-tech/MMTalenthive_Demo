package com.managemyopz.attendance.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "attendance_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceRecord extends BaseEntity {

    @Column(name = "employee_id", nullable = false)
    private UUID employeeId;

    @Column(name = "attendance_date", nullable = false)
    private LocalDate attendanceDate;

    @Column(name = "check_in")
    private LocalDateTime checkIn;

    @Column(name = "check_out")
    private LocalDateTime checkOut;

    @Column(name = "working_hours")
    private Double workingHours;

    @Column(name = "late_minutes")
    private int lateMinutes;

    @Column(name = "early_logout_minutes")
    private int earlyLogoutMinutes;

    @Column(name = "attendance_mode")
    @Enumerated(EnumType.STRING)
    private AttendanceMode attendanceMode;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private AttendanceStatus status;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "device_info")
    private String deviceInfo;

    @Column(name = "device_type")
    private String deviceType;

    @Column(name = "browser")
    private String browser;

    @Column(name = "platform")
    private String platform;

    public enum AttendanceMode {
        OFFICE, WFH, REMOTE, CLIENT_SITE, FIELD
    }

    public enum AttendanceStatus {
        PRESENT, ABSENT, LATE, HALF_DAY, EARLY_LOGOUT
    }
}
