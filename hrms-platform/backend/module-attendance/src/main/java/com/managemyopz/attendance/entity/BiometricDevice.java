package com.managemyopz.attendance.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "biometric_devices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BiometricDevice extends BaseEntity {

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "device_type", nullable = false)
    private String deviceType;

    @Column(name = "ip_address", nullable = false)
    private String ipAddress;

    @Column(name = "port", nullable = false)
    private int port;

    @Column(name = "location")
    private String location;

    @Column(name = "status", nullable = false)
    private String status = "ACTIVE";
}
