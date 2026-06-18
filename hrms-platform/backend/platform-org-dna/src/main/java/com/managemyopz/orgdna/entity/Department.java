package com.managemyopz.orgdna.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity @Table(name = "departments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Department extends BaseEntity {
    @Column(name = "name", nullable = false) private String name;
    @Column(name = "code", nullable = false) private String code;
    @Column(name = "description") private String description;
    @Column(name = "head_employee_id") private UUID headEmployeeId;
    @Column(name = "active", nullable = false) private boolean active = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "division_id", nullable = false)
    @JsonIgnore
    private Division division;

    @OneToMany(mappedBy = "department", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SubDepartment> subDepartments = new ArrayList<>();
}
