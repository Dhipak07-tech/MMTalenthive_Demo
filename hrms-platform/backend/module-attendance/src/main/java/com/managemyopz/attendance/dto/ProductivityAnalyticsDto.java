package com.managemyopz.attendance.dto;

import lombok.*;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductivityAnalyticsDto {
    private double averageWorkingHours;
    private double attendancePercentage;
    private double lateArrivalPercentage;
    private double absenteeRate;
    private double teamProductivityScore;

    // Charts
    private List<TrendDataPoint> employeeProductivityTrend;
    private List<TrendDataPoint> departmentProductivityTrend;
    private List<TrendDataPoint> locationProductivityTrend;
    private List<TrendDataPoint> overtimeTrends;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrendDataPoint {
        private String label; // e.g. Date, Department Name, Location Name
        private double value;
    }
}
