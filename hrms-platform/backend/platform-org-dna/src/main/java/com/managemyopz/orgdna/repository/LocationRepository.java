package com.managemyopz.orgdna.repository;

import com.managemyopz.orgdna.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface LocationRepository extends JpaRepository<Location, UUID> {
    List<Location> findByOrganizationId(UUID organizationId);
}
