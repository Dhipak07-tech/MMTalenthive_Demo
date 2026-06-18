package com.managemyopz.orgdna.repository;

import com.managemyopz.orgdna.entity.Designation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface DesignationRepository extends JpaRepository<Designation, UUID> {
    List<Designation> findByOrganizationId(UUID organizationId);
}
