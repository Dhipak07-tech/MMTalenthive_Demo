package com.managemyopz.security.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

/**
 * Permission — Granular permission supporting module, feature, field, and record levels.
 *
 * Examples:
 * - module:employee-twin, action:READ  → Can view employee data
 * - module:leave, action:APPROVE       → Can approve leave requests
 * - module:payroll, field:salary        → Can see salary field
 */
@Entity @Table(name = "permissions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Permission extends BaseEntity {

    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @Column(name = "display_name")
    private String displayName;

    @Column(name = "module_code", nullable = false)
    private String moduleCode; // e.g., "employee-twin", "leave", "payroll"

    @Column(name = "module")
    private String module;

    @Column(name = "permission_key")
    private String permissionKey;

    @Column(name = "action", nullable = false)
    @Enumerated(EnumType.STRING)
    private PermissionAction action;

    @Column(name = "resource_type")
    private String resourceType; // e.g., "employee", "leave-request"

    @Column(name = "field_name")
    private String fieldName; // For field-level permissions

    @Column(name = "description")
    private String description;

    public enum PermissionAction {
        CREATE, READ, UPDATE, DELETE, APPROVE, REJECT, EXPORT, IMPORT, MANAGE
    }
}
