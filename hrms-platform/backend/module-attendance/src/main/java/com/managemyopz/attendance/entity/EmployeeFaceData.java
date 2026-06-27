package com.managemyopz.attendance.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "employee_face_data")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeFaceData extends BaseEntity {

    @Column(name = "employee_id", nullable = false)
    private UUID employeeId;

    @Column(name = "face_template", columnDefinition = "TEXT")
    private String faceTemplate;

    @Column(name = "image_path")
    private String imagePath;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;
}
