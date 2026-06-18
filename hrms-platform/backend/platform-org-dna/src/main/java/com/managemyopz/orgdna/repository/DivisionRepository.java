package com.managemyopz.orgdna.repository;

import com.managemyopz.orgdna.entity.Division;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface DivisionRepository extends JpaRepository<Division, UUID> {
    List<Division> findByBusinessUnitId(UUID businessUnitId);
}
