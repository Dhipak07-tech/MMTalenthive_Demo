package com.managemyopz.attendance.dto;

import com.managemyopz.attendance.entity.AttendanceRegularization.RegularizationStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegularizationActionRequest {
    private RegularizationStatus status;
}
