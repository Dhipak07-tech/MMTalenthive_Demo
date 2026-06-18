package com.managemyopz.orgdna.repository;

import com.managemyopz.orgdna.entity.Band;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface BandRepository extends JpaRepository<Band, UUID> {
    List<Band> findByOrganizationId(UUID organizationId);
}
