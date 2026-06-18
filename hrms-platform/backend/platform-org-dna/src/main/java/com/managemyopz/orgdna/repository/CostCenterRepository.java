package com.managemyopz.orgdna.repository;

import com.managemyopz.orgdna.entity.CostCenter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface CostCenterRepository extends JpaRepository<CostCenter, UUID> {
    List<CostCenter> findByOrganizationId(UUID organizationId);
}
