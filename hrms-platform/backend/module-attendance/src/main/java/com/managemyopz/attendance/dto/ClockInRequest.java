package com.managemyopz.attendance.dto;

import com.managemyopz.attendance.entity.AttendanceRecord.AttendanceMode;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClockInRequest {
    private AttendanceMode attendanceMode;
    private String ipAddress;
    private String deviceInfo;
    private Double latitude;
    private Double longitude;
    private String selfie; // Base64 selfie
    private String deviceType;
    private String browser;
    private String platform;
}
