package com.managemyopz.attendance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceSettingsDto {
    private String shiftStartTime; // e.g. "09:00:00"
    private String shiftEndTime; // e.g. "18:00:00"
    private int gracePeriodMinutes;
    private double minHoursPresent;
    private double minHoursHalfDay;
    private boolean geofencingEnabled;
    private String selfieVerificationMode;
    private boolean faceRecognitionEnabled;
}
