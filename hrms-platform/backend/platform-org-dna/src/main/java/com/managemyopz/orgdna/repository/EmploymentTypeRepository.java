package com.managemyopz.orgdna.repository;

import com.managemyopz.orgdna.entity.EmploymentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface EmploymentTypeRepository extends JpaRepository<EmploymentType, UUID> {
    List<EmploymentType> findByOrganizationId(UUID organizationId);
}
