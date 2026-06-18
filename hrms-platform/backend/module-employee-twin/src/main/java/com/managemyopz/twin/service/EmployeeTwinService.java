package com.managemyopz.twin.service;

import com.managemyopz.twin.entity.EmployeeTwin;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface EmployeeTwinService {

    EmployeeTwin createEmployee(EmployeeTwin employee, String triggeredBy);

    EmployeeTwin updateEmployee(UUID id, EmployeeTwin employeeDetails, String triggeredBy);

    EmployeeTwin transferEmployee(UUID id, UUID newDepartmentId, UUID newLocationId, String triggeredBy);

    EmployeeTwin promoteEmployee(UUID id, UUID newDesignationId, UUID newGradeId, String triggeredBy);

    EmployeeTwin changeManager(UUID id, UUID newManagerId, String triggeredBy);

    EmployeeTwin terminateEmployee(UUID id, LocalDate exitDate, String reason, String triggeredBy);

    void deleteEmployee(UUID id, String triggeredBy);

    EmployeeTwin getById(UUID id);

    List<EmployeeTwin> getAllActive();

    int calculateProfileCompletion(UUID id);

    String previewNextEmployeeCode(UUID organizationId);
}
