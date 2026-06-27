package com.managemyopz.attendance.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

import java.time.LocalTime;

@Entity
@Table(name = "attendance_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceSettings extends BaseEntity {

    @Column(name = "shift_start_time", nullable = false)
    private LocalTime shiftStartTime;

    @Column(name = "shift_end_time", nullable = false)
    private LocalTime shiftEndTime;

    @Column(name = "grace_period_minutes", nullable = false)
    private int gracePeriodMinutes;

    @Column(name = "min_hours_present", nullable = false)
    private double minHoursPresent;

    @Column(name = "min_hours_half_day", nullable = false)
    private double minHoursHalfDay;

    @Column(name = "geofencing_enabled", nullable = false)
    private boolean geofencingEnabled;

    @Column(name = "selfie_verification_mode", nullable = false)
    @jakarta.persistence.Enumerated(jakarta.persistence.EnumType.STRING)
    private SelfieVerificationMode selfieVerificationMode;

    @Column(name = "face_recognition_enabled", nullable = false)
    private boolean faceRecognitionEnabled = false;

    public enum SelfieVerificationMode {
        DISABLED, CLOCK_IN_ONLY, CLOCK_OUT_ONLY, BOTH
    }
}
