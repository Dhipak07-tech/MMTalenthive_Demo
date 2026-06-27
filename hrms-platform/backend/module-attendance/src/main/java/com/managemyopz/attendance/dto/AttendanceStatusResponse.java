package com.managemyopz.attendance.dto;

import com.managemyopz.attendance.entity.AttendanceRecord;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceStatusResponse {
    private AttendanceRecord todayRecord;
    private String status; // NOT_CHECKED_IN, CHECKED_IN, CHECKED_OUT
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
    private Double workingHours;
    private Long activeTimerSeconds;
}
