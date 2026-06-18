package com.managemyopz.orgdna.repository;

import com.managemyopz.orgdna.entity.SubDepartment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface SubDepartmentRepository extends JpaRepository<SubDepartment, UUID> {
    List<SubDepartment> findByDepartmentId(UUID departmentId);
}
