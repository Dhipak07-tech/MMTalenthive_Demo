package com.managemyopz.orgdna.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity @Table(name = "business_units")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class BusinessUnit extends BaseEntity {

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "code", nullable = false)
    private String code;

    @Column(name = "description")
    private String description;

    @Column(name = "head_employee_id")
    private UUID headEmployeeId;

    @Column(name = "active", nullable = false)
    private boolean active = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    @JsonIgnore
    private Organization organization;

    @OneToMany(mappedBy = "businessUnit", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Division> divisions = new ArrayList<>();
}
