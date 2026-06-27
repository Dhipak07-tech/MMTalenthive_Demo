package com.managemyopz.attendance.dto;

import lombok.Data;

@Data
public class QrScanRequest {
    private String qrId;
    private Double latitude;
    private Double longitude;
}
