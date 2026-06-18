package com.managemyopz.security.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.HashSet;
import java.util.Set;

/**
 * Role — Defines a role in the RBAC hierarchy.
 *
 * Hierarchy: ULTRA_SUPER_ADMIN > SUPER_ADMIN > ADMIN > EMPLOYEE
 * Each role can have module, feature, field, and record level permissions.
 * Designed for future ABAC extension via the metadata JSON column.
 */
@Entity @Table(name = "roles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Role extends BaseEntity {

    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @Column(name = "code", nullable = false, unique = true)
    private String code;

    @Column(name = "priority", nullable = false)
    private int priority;

    @Column(name = "display_name")
    private String displayName;

    @Column(name = "description")
    private String description;

    @Column(name = "hierarchy_level", nullable = false)
    private int hierarchyLevel; // Lower = more powerful. ULTRA_SUPER_ADMIN=0, EMPLOYEE=100

    @Column(name = "system_role", nullable = false)
    private boolean systemRole = false; // System roles cannot be deleted

    @Column(name = "active", nullable = false)
    private boolean active = true;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "role_permissions",
        joinColumns = @JoinColumn(name = "role_id"),
        inverseJoinColumns = @JoinColumn(name = "permission_id")
    )
    private Set<Permission> permissions = new HashSet<>();
}
