package com.managemyopz.attendance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceDashboardDto {
    private long presentCount;
    private long absentCount;
    private long lateCount;
    private long wfhCount;
    private long pendingRequests;
    private List<Map<String, Object>> dailyTrends;
    private double monthlyPercentage;
    private List<Map<String, Object>> departmentStats;
}
