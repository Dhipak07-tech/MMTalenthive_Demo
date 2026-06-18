package com.managemyopz.orgdna.service;

import com.managemyopz.orgdna.entity.*;
import com.managemyopz.orgdna.repository.*;
import com.managemyopz.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class OrgDnaServiceImpl implements OrgDnaService {

    private final OrganizationRepository organizationRepository;
    private final BusinessUnitRepository businessUnitRepository;
    private final DivisionRepository divisionRepository;
    private final DepartmentRepository departmentRepository;
    private final SubDepartmentRepository subDepartmentRepository;
    private final LocationRepository locationRepository;
    private final GradeRepository gradeRepository;
    private final BandRepository bandRepository;
    private final DesignationRepository designationRepository;
    private final EmploymentTypeRepository employmentTypeRepository;
    private final CostCenterRepository costCenterRepository;

    // ── Organizations ──────────────────────────────────────────
    @Override
    public Organization createOrganization(Organization org) {
        return organizationRepository.save(org);
    }

    @Override
    public Organization updateOrganization(UUID id, Organization org) {
        Organization existing = getOrganizationById(id);
        existing.setName(org.getName());
        existing.setCode(org.getCode());
        existing.setLegalName(org.getLegalName());
        existing.setIndustry(org.getIndustry());
        existing.setWebsite(org.getWebsite());
        existing.setPrimaryEmail(org.getPrimaryEmail());
        existing.setPrimaryPhone(org.getPrimaryPhone());
        existing.setAddress(org.getAddress());
        existing.setCountry(org.getCountry());
        existing.setCurrency(org.getCurrency());
        existing.setTimezone(org.getTimezone());
        return organizationRepository.save(existing);
    }

    @Override
    @Transactional(readOnly = true)
    public Organization getOrganizationById(UUID id) {
        return organizationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Organization> getAllOrganizations() {
        return organizationRepository.findAll();
    }

    // ── Business Units ──────────────────────────────────────────
    @Override
    public BusinessUnit createBusinessUnit(BusinessUnit bu, UUID organizationId) {
        Organization org = getOrganizationById(organizationId);
        bu.setOrganization(org);
        return businessUnitRepository.save(bu);
    }

    @Override
    public BusinessUnit updateBusinessUnit(UUID id, BusinessUnit buDetails) {
        BusinessUnit existing = businessUnitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BusinessUnit", id));
        existing.setName(buDetails.getName());
        existing.setCode(buDetails.getCode());
        existing.setDescription(buDetails.getDescription());
        existing.setHeadEmployeeId(buDetails.getHeadEmployeeId());
        existing.setActive(buDetails.isActive());
        return businessUnitRepository.save(existing);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BusinessUnit> getBusinessUnitsByOrg(UUID organizationId) {
        return businessUnitRepository.findByOrganizationId(organizationId);
    }

    @Override
    public void deleteBusinessUnit(UUID id) {
        businessUnitRepository.deleteById(id);
    }

    // ── Divisions ──────────────────────────────────────────
    @Override
    public Division createDivision(Division div, UUID businessUnitId) {
        BusinessUnit bu = businessUnitRepository.findById(businessUnitId)
                .orElseThrow(() -> new ResourceNotFoundException("BusinessUnit", businessUnitId));
        div.setBusinessUnit(bu);
        return divisionRepository.save(div);
    }

    @Override
    public Division updateDivision(UUID id, Division details) {
        Division existing = divisionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Division", id));
        existing.setName(details.getName());
        existing.setCode(details.getCode());
        existing.setDescription(details.getDescription());
        existing.setHeadEmployeeId(details.getHeadEmployeeId());
        existing.setActive(details.isActive());
        return divisionRepository.save(existing);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Division> getDivisionsByBU(UUID businessUnitId) {
        return divisionRepository.findByBusinessUnitId(businessUnitId);
    }

    @Override
    public void deleteDivision(UUID id) {
        divisionRepository.deleteById(id);
    }

    // ── Departments ──────────────────────────────────────────
    @Override
    public Department createDepartment(Department dept, UUID divisionId) {
        Division div = divisionRepository.findById(divisionId)
                .orElseThrow(() -> new ResourceNotFoundException("Division", divisionId));
        dept.setDivision(div);
        return departmentRepository.save(dept);
    }

    @Override
    public Department updateDepartment(UUID id, Department details) {
        Department existing = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", id));
        existing.setName(details.getName());
        existing.setCode(details.getCode());
        existing.setHeadEmployeeId(details.getHeadEmployeeId());
        existing.setActive(details.isActive());
        return departmentRepository.save(existing);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Department> getDepartmentsByDivision(UUID divisionId) {
        return departmentRepository.findByDivisionId(divisionId);
    }

    @Override
    public void deleteDepartment(UUID id) {
        departmentRepository.deleteById(id);
    }

    // ── Sub Departments ──────────────────────────────────────────
    @Override
    public SubDepartment createSubDepartment(SubDepartment sdept, UUID departmentId) {
        Department dept = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department", departmentId));
        sdept.setDepartment(dept);
        return subDepartmentRepository.save(sdept);
    }

    @Override
    public SubDepartment updateSubDepartment(UUID id, SubDepartment details) {
        SubDepartment existing = subDepartmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SubDepartment", id));
        existing.setName(details.getName());
        existing.setCode(details.getCode());
        existing.setActive(details.isActive());
        return subDepartmentRepository.save(existing);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubDepartment> getSubDepartmentsByDept(UUID departmentId) {
        return subDepartmentRepository.findByDepartmentId(departmentId);
    }

    @Override
    public void deleteSubDepartment(UUID id) {
        subDepartmentRepository.deleteById(id);
    }

    // ── Locations ──────────────────────────────────────────
    @Override
    public Location createLocation(Location loc, UUID organizationId) {
        Organization org = getOrganizationById(organizationId);
        loc.setOrganization(org);
        return locationRepository.save(loc);
    }

    @Override
    public Location updateLocation(UUID id, Location details) {
        Location existing = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location", id));
        existing.setName(details.getName());
        existing.setCode(details.getCode());
        existing.setLocationType(details.getLocationType());
        existing.setAddress(details.getAddress());
        existing.setCity(details.getCity());
        existing.setCountry(details.getCountry());
        existing.setTimezone(details.getTimezone());
        existing.setActive(details.isActive());
        return locationRepository.save(existing);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Location> getLocationsByOrg(UUID organizationId) {
        return locationRepository.findByOrganizationId(organizationId);
    }

    @Override
    public void deleteLocation(UUID id) {
        locationRepository.deleteById(id);
    }

    // ── Grades ──────────────────────────────────────────
    @Override
    public Grade createGrade(Grade gr, UUID organizationId) {
        Organization org = getOrganizationById(organizationId);
        gr.setOrganization(org);
        return gradeRepository.save(gr);
    }

    @Override
    public Grade updateGrade(UUID id, Grade details) {
        Grade existing = gradeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grade", id));
        existing.setName(details.getName());
        existing.setCode(details.getCode());
        existing.setLevel(details.getLevel());
        existing.setActive(details.isActive());
        return gradeRepository.save(existing);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Grade> getGradesByOrg(UUID organizationId) {
        return gradeRepository.findByOrganizationId(organizationId);
    }

    @Override
    public void deleteGrade(UUID id) {
        gradeRepository.deleteById(id);
    }

    // ── Bands ──────────────────────────────────────────
    @Override
    public Band createBand(Band bd, UUID organizationId) {
        Organization org = getOrganizationById(organizationId);
        bd.setOrganization(org);
        return bandRepository.save(bd);
    }

    @Override
    public Band updateBand(UUID id, Band details) {
        Band existing = bandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Band", id));
        existing.setName(details.getName());
        existing.setMinSalary(details.getMinSalary());
        existing.setMaxSalary(details.getMaxSalary());
        existing.setCurrency(details.getCurrency());
        existing.setActive(details.isActive());
        return bandRepository.save(existing);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Band> getBandsByOrg(UUID organizationId) {
        return bandRepository.findByOrganizationId(organizationId);
    }

    @Override
    public void deleteBand(UUID id) {
        bandRepository.deleteById(id);
    }

    // ── Designations ──────────────────────────────────────────
    @Override
    public Designation createDesignation(Designation desig, UUID organizationId) {
        Organization org = getOrganizationById(organizationId);
        desig.setOrganization(org);
        return designationRepository.save(desig);
    }

    @Override
    public Designation updateDesignation(UUID id, Designation details) {
        Designation existing = designationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Designation", id));
        existing.setName(details.getName());
        existing.setCode(details.getCode());
        existing.setDescription(details.getDescription());
        existing.setActive(details.isActive());
        return designationRepository.save(existing);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Designation> getDesignationsByOrg(UUID organizationId) {
        return designationRepository.findByOrganizationId(organizationId);
    }

    @Override
    public void deleteDesignation(UUID id) {
        designationRepository.deleteById(id);
    }

    // ── Employment Types ──────────────────────────────────────────
    @Override
    public EmploymentType createEmploymentType(EmploymentType type, UUID organizationId) {
        Organization org = getOrganizationById(organizationId);
        type.setOrganization(org);
        return employmentTypeRepository.save(type);
    }

    @Override
    public EmploymentType updateEmploymentType(UUID id, EmploymentType details) {
        EmploymentType existing = employmentTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("EmploymentType", id));
        existing.setName(details.getName());
        existing.setCode(details.getCode());
        existing.setActive(details.isActive());
        return employmentTypeRepository.save(existing);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmploymentType> getEmploymentTypesByOrg(UUID organizationId) {
        return employmentTypeRepository.findByOrganizationId(organizationId);
    }

    @Override
    public void deleteEmploymentType(UUID id) {
        employmentTypeRepository.deleteById(id);
    }

    // ── Cost Centers ──────────────────────────────────────────
    @Override
    public CostCenter createCostCenter(CostCenter cc, UUID organizationId) {
        Organization org = getOrganizationById(organizationId);
        cc.setOrganization(org);
        return costCenterRepository.save(cc);
    }

    @Override
    public CostCenter updateCostCenter(UUID id, CostCenter details) {
        CostCenter existing = costCenterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CostCenter", id));
        existing.setName(details.getName());
        existing.setCode(details.getCode());
        existing.setActive(details.isActive());
        return costCenterRepository.save(existing);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CostCenter> getCostCentersByOrg(UUID organizationId) {
        return costCenterRepository.findByOrganizationId(organizationId);
    }

    @Override
    public void deleteCostCenter(UUID id) {
        costCenterRepository.deleteById(id);
    }
}
