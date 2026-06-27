package com.managemyopz.attendance.dto;

import lombok.Data;

@Data
public class FaceRegistrationRequest {
    private String faceTemplate;
    private String imagePath;
}
