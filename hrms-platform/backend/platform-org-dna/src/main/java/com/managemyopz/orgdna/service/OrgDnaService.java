package com.managemyopz.orgdna.service;

import com.managemyopz.orgdna.entity.*;
import java.util.List;
import java.util.UUID;

public interface OrgDnaService {

    // Organizations
    Organization createOrganization(Organization org);
    Organization updateOrganization(UUID id, Organization org);
    Organization getOrganizationById(UUID id);
    List<Organization> getAllOrganizations();

    // Business Units
    BusinessUnit createBusinessUnit(BusinessUnit bu, UUID organizationId);
    BusinessUnit updateBusinessUnit(UUID id, BusinessUnit bu);
    List<BusinessUnit> getBusinessUnitsByOrg(UUID organizationId);
    void deleteBusinessUnit(UUID id);

    // Divisions
    Division createDivision(Division div, UUID businessUnitId);
    Division updateDivision(UUID id, Division div);
    List<Division> getDivisionsByBU(UUID businessUnitId);
    void deleteDivision(UUID id);

    // Departments
    Department createDepartment(Department dept, UUID divisionId);
    Department updateDepartment(UUID id, Department dept);
    List<Department> getDepartmentsByDivision(UUID divisionId);
    void deleteDepartment(UUID id);

    // Sub Departments
    SubDepartment createSubDepartment(SubDepartment sdept, UUID departmentId);
    SubDepartment updateSubDepartment(UUID id, SubDepartment sdept);
    List<SubDepartment> getSubDepartmentsByDept(UUID departmentId);
    void deleteSubDepartment(UUID id);

    // Locations
    Location createLocation(Location loc, UUID organizationId);
    Location updateLocation(UUID id, Location loc);
    List<Location> getLocationsByOrg(UUID organizationId);
    void deleteLocation(UUID id);

    // Grades
    Grade createGrade(Grade gr, UUID organizationId);
    Grade updateGrade(UUID id, Grade gr);
    List<Grade> getGradesByOrg(UUID organizationId);
    void deleteGrade(UUID id);

    // Bands
    Band createBand(Band bd, UUID organizationId);
    Band updateBand(UUID id, Band bd);
    List<Band> getBandsByOrg(UUID organizationId);
    void deleteBand(UUID id);

    // Designations
    Designation createDesignation(Designation desig, UUID organizationId);
    Designation updateDesignation(UUID id, Designation desig);
    List<Designation> getDesignationsByOrg(UUID organizationId);
    void deleteDesignation(UUID id);

    // Employment Types
    EmploymentType createEmploymentType(EmploymentType type, UUID organizationId);
    EmploymentType updateEmploymentType(UUID id, EmploymentType type);
    List<EmploymentType> getEmploymentTypesByOrg(UUID organizationId);
    void deleteEmploymentType(UUID id);

    // Cost Centers
    CostCenter createCostCenter(CostCenter cc, UUID organizationId);
    CostCenter updateCostCenter(UUID id, CostCenter cc);
    List<CostCenter> getCostCentersByOrg(UUID organizationId);
    void deleteCostCenter(UUID id);
}
