package com.managemyopz.twin.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "employee_code_sequences")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class EmployeeCodeSequence {

    @Id
    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(name = "last_sequence", nullable = false)
    private int lastSequence;
}
