package com.managemyopz.attendance.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class QrGenerationRequest {
    private UUID locationId;
    private UUID departmentId;
    private int expiryMinutes = 10;
}
