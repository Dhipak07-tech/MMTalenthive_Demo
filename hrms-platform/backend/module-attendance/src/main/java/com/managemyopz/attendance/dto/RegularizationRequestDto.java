package com.managemyopz.attendance.dto;

import com.managemyopz.attendance.entity.AttendanceRegularization.RequestType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegularizationRequestDto {
    private UUID attendanceId;
    private RequestType requestType;
    private LocalDateTime requestedCheckIn;
    private LocalDateTime requestedCheckOut;
    private String reason;
    private LocalDate attendanceDate;
}
