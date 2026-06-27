package com.managemyopz.attendance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClockOutRequest {
    private Double latitude;
    private Double longitude;
    private String selfie; // Base64 selfie
    private String deviceType;
    private String browser;
    private String platform;
}
