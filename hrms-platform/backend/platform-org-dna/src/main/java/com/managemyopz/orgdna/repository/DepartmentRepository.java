package com.managemyopz.orgdna.repository;

import com.managemyopz.orgdna.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, UUID> {
    List<Department> findByDivisionId(UUID divisionId);
}
