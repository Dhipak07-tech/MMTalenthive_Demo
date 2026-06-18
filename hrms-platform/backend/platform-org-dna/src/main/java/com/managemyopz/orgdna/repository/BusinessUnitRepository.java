package com.managemyopz.orgdna.repository;

import com.managemyopz.orgdna.entity.BusinessUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface BusinessUnitRepository extends JpaRepository<BusinessUnit, UUID> {
    List<BusinessUnit> findByOrganizationId(UUID organizationId);
}
