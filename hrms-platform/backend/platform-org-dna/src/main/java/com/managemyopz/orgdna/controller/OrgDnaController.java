package com.managemyopz.orgdna.controller;

import com.managemyopz.orgdna.entity.*;
import com.managemyopz.orgdna.service.OrgDnaService;
import com.managemyopz.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/org-dna")
@RequiredArgsConstructor
public class OrgDnaController {

    private final OrgDnaService orgDnaService;

    // ── Organizations ──────────────────────────────────────────
    @PostMapping("/organizations")
    public ResponseEntity<ApiResponse<Organization>> createOrganization(@RequestBody Organization org) {
        Organization created = orgDnaService.createOrganization(org);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(created, "Organization created successfully"));
    }

    @PutMapping("/organizations/{id}")
    public ResponseEntity<ApiResponse<Organization>> updateOrganization(@PathVariable UUID id, @RequestBody Organization org) {
        Organization updated = orgDnaService.updateOrganization(id, org);
        return ResponseEntity.ok(ApiResponse.success(updated, "Organization updated successfully"));
    }

    @GetMapping("/organizations/{id}")
    public ResponseEntity<ApiResponse<Organization>> getOrganization(@PathVariable UUID id) {
        Organization org = orgDnaService.getOrganizationById(id);
        return ResponseEntity.ok(ApiResponse.success(org, "Organization retrieved successfully"));
    }

    @GetMapping("/organizations")
    public ResponseEntity<ApiResponse<List<Organization>>> getAllOrganizations() {
        List<Organization> orgs = orgDnaService.getAllOrganizations();
        return ResponseEntity.ok(ApiResponse.success(orgs, "Organizations retrieved successfully"));
    }

    // ── Business Units ──────────────────────────────────────────
    @PostMapping("/organizations/{orgId}/business-units")
    public ResponseEntity<ApiResponse<BusinessUnit>> createBusinessUnit(@PathVariable UUID orgId, @RequestBody BusinessUnit bu) {
        BusinessUnit created = orgDnaService.createBusinessUnit(bu, orgId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(created, "Business Unit created successfully"));
    }

    @PutMapping("/business-units/{id}")
    public ResponseEntity<ApiResponse<BusinessUnit>> updateBusinessUnit(@PathVariable UUID id, @RequestBody BusinessUnit bu) {
        BusinessUnit updated = orgDnaService.updateBusinessUnit(id, bu);
        return ResponseEntity.ok(ApiResponse.success(updated, "Business Unit updated successfully"));
    }

    @GetMapping("/organizations/{orgId}/business-units")
    public ResponseEntity<ApiResponse<List<BusinessUnit>>> getBusinessUnits(@PathVariable UUID orgId) {
        List<BusinessUnit> bus = orgDnaService.getBusinessUnitsByOrg(orgId);
        return ResponseEntity.ok(ApiResponse.success(bus, "Business Units retrieved successfully"));
    }

    @DeleteMapping("/business-units/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBusinessUnit(@PathVariable UUID id) {
        orgDnaService.deleteBusinessUnit(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Business Unit deleted successfully"));
    }

    // ── Divisions ──────────────────────────────────────────
    @PostMapping("/business-units/{buId}/divisions")
    public ResponseEntity<ApiResponse<Division>> createDivision(@PathVariable UUID buId, @RequestBody Division div) {
        Division created = orgDnaService.createDivision(div, buId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(created, "Division created successfully"));
    }

    @PutMapping("/divisions/{id}")
    public ResponseEntity<ApiResponse<Division>> updateDivision(@PathVariable UUID id, @RequestBody Division div) {
        Division updated = orgDnaService.updateDivision(id, div);
        return ResponseEntity.ok(ApiResponse.success(updated, "Division updated successfully"));
    }

    @GetMapping("/business-units/{buId}/divisions")
    public ResponseEntity<ApiResponse<List<Division>>> getDivisions(@PathVariable UUID buId) {
        List<Division> divs = orgDnaService.getDivisionsByBU(buId);
        return ResponseEntity.ok(ApiResponse.success(divs, "Divisions retrieved successfully"));
    }

    @DeleteMapping("/divisions/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDivision(@PathVariable UUID id) {
        orgDnaService.deleteDivision(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Division deleted successfully"));
    }

    // ── Departments ──────────────────────────────────────────
    @PostMapping("/divisions/{divId}/departments")
    public ResponseEntity<ApiResponse<Department>> createDepartment(@PathVariable UUID divId, @RequestBody Department dept) {
        Department created = orgDnaService.createDepartment(dept, divId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(created, "Department created successfully"));
    }

    @PutMapping("/departments/{id}")
    public ResponseEntity<ApiResponse<Department>> updateDepartment(@PathVariable UUID id, @RequestBody Department dept) {
        Department updated = orgDnaService.updateDepartment(id, dept);
        return ResponseEntity.ok(ApiResponse.success(updated, "Department updated successfully"));
    }

    @GetMapping("/divisions/{divId}/departments")
    public ResponseEntity<ApiResponse<List<Department>>> getDepartments(@PathVariable UUID divId) {
        List<Department> depts = orgDnaService.getDepartmentsByDivision(divId);
        return ResponseEntity.ok(ApiResponse.success(depts, "Departments retrieved successfully"));
    }

    @DeleteMapping("/departments/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDepartment(@PathVariable UUID id) {
        orgDnaService.deleteDepartment(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Department deleted successfully"));
    }

    // ── Sub Departments ──────────────────────────────────────────
    @PostMapping("/departments/{deptId}/sub-departments")
    public ResponseEntity<ApiResponse<SubDepartment>> createSubDepartment(@PathVariable UUID deptId, @RequestBody SubDepartment sdept) {
        SubDepartment created = orgDnaService.createSubDepartment(sdept, deptId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(created, "Sub Department created successfully"));
    }

    @PutMapping("/sub-departments/{id}")
    public ResponseEntity<ApiResponse<SubDepartment>> updateSubDepartment(@PathVariable UUID id, @RequestBody SubDepartment sdept) {
        SubDepartment updated = orgDnaService.updateSubDepartment(id, sdept);
        return ResponseEntity.ok(ApiResponse.success(updated, "Sub Department updated successfully"));
    }

    @GetMapping("/departments/{deptId}/sub-departments")
    public ResponseEntity<ApiResponse<List<SubDepartment>>> getSubDepartments(@PathVariable UUID deptId) {
        List<SubDepartment> sdepts = orgDnaService.getSubDepartmentsByDept(deptId);
        return ResponseEntity.ok(ApiResponse.success(sdepts, "Sub Departments retrieved successfully"));
    }

    @DeleteMapping("/sub-departments/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSubDepartment(@PathVariable UUID id) {
        orgDnaService.deleteSubDepartment(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Sub Department deleted successfully"));
    }

    // ── Locations ──────────────────────────────────────────
    @PostMapping("/organizations/{orgId}/locations")
    public ResponseEntity<ApiResponse<Location>> createLocation(@PathVariable UUID orgId, @RequestBody Location loc) {
        Location created = orgDnaService.createLocation(loc, orgId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(created, "Location created successfully"));
    }

    @PutMapping("/locations/{id}")
    public ResponseEntity<ApiResponse<Location>> updateLocation(@PathVariable UUID id, @RequestBody Location loc) {
        Location updated = orgDnaService.updateLocation(id, loc);
        return ResponseEntity.ok(ApiResponse.success(updated, "Location updated successfully"));
    }

    @GetMapping("/organizations/{orgId}/locations")
    public ResponseEntity<ApiResponse<List<Location>>> getLocations(@PathVariable UUID orgId) {
        List<Location> locs = orgDnaService.getLocationsByOrg(orgId);
        return ResponseEntity.ok(ApiResponse.success(locs, "Locations retrieved successfully"));
    }

    @DeleteMapping("/locations/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteLocation(@PathVariable UUID id) {
        orgDnaService.deleteLocation(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Location deleted successfully"));
    }

    // ── Grades ──────────────────────────────────────────
    @PostMapping("/organizations/{orgId}/grades")
    public ResponseEntity<ApiResponse<Grade>> createGrade(@PathVariable UUID orgId, @RequestBody Grade gr) {
        Grade created = orgDnaService.createGrade(gr, orgId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(created, "Grade created successfully"));
    }

    @PutMapping("/grades/{id}")
    public ResponseEntity<ApiResponse<Grade>> updateGrade(@PathVariable UUID id, @RequestBody Grade gr) {
        Grade updated = orgDnaService.updateGrade(id, gr);
        return ResponseEntity.ok(ApiResponse.success(updated, "Grade updated successfully"));
    }

    @GetMapping("/organizations/{orgId}/grades")
    public ResponseEntity<ApiResponse<List<Grade>>> getGrades(@PathVariable UUID orgId) {
        List<Grade> grs = orgDnaService.getGradesByOrg(orgId);
        return ResponseEntity.ok(ApiResponse.success(grs, "Grades retrieved successfully"));
    }

    @DeleteMapping("/grades/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteGrade(@PathVariable UUID id) {
        orgDnaService.deleteGrade(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Grade deleted successfully"));
    }

    // ── Bands ──────────────────────────────────────────
    @PostMapping("/organizations/{orgId}/bands")
    public ResponseEntity<ApiResponse<Band>> createBand(@PathVariable UUID orgId, @RequestBody Band bd) {
        Band created = orgDnaService.createBand(bd, orgId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(created, "Band created successfully"));
    }

    @PutMapping("/bands/{id}")
    public ResponseEntity<ApiResponse<Band>> updateBand(@PathVariable UUID id, @RequestBody Band bd) {
        Band updated = orgDnaService.updateBand(id, bd);
        return ResponseEntity.ok(ApiResponse.success(updated, "Band updated successfully"));
    }

    @GetMapping("/organizations/{orgId}/bands")
    public ResponseEntity<ApiResponse<List<Band>>> getBands(@PathVariable UUID orgId) {
        List<Band> bds = orgDnaService.getBandsByOrg(orgId);
        return ResponseEntity.ok(ApiResponse.success(bds, "Bands retrieved successfully"));
    }

    @DeleteMapping("/bands/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBand(@PathVariable UUID id) {
        orgDnaService.deleteBand(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Band deleted successfully"));
    }

    // ── Designations ──────────────────────────────────────────
    @PostMapping("/organizations/{orgId}/designations")
    public ResponseEntity<ApiResponse<Designation>> createDesignation(@PathVariable UUID orgId, @RequestBody Designation desig) {
        Designation created = orgDnaService.createDesignation(desig, orgId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(created, "Designation created successfully"));
    }

    @PutMapping("/designations/{id}")
    public ResponseEntity<ApiResponse<Designation>> updateDesignation(@PathVariable UUID id, @RequestBody Designation desig) {
        Designation updated = orgDnaService.updateDesignation(id, desig);
        return ResponseEntity.ok(ApiResponse.success(updated, "Designation updated successfully"));
    }

    @GetMapping("/organizations/{orgId}/designations")
    public ResponseEntity<ApiResponse<List<Designation>>> getDesignations(@PathVariable UUID orgId) {
        List<Designation> desigs = orgDnaService.getDesignationsByOrg(orgId);
        return ResponseEntity.ok(ApiResponse.success(desigs, "Designations retrieved successfully"));
    }

    @DeleteMapping("/designations/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDesignation(@PathVariable UUID id) {
        orgDnaService.deleteDesignation(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Designation deleted successfully"));
    }

    // ── Employment Types ──────────────────────────────────────────
    @PostMapping("/organizations/{orgId}/employment-types")
    public ResponseEntity<ApiResponse<EmploymentType>> createEmploymentType(@PathVariable UUID orgId, @RequestBody EmploymentType type) {
        EmploymentType created = orgDnaService.createEmploymentType(type, orgId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(created, "Employment Type created successfully"));
    }

    @PutMapping("/employment-types/{id}")
    public ResponseEntity<ApiResponse<EmploymentType>> updateEmploymentType(@PathVariable UUID id, @RequestBody EmploymentType type) {
        EmploymentType updated = orgDnaService.updateEmploymentType(id, type);
        return ResponseEntity.ok(ApiResponse.success(updated, "Employment Type updated successfully"));
    }

    @GetMapping("/organizations/{orgId}/employment-types")
    public ResponseEntity<ApiResponse<List<EmploymentType>>> getEmploymentTypes(@PathVariable UUID orgId) {
        List<EmploymentType> types = orgDnaService.getEmploymentTypesByOrg(orgId);
        return ResponseEntity.ok(ApiResponse.success(types, "Employment Types retrieved successfully"));
    }

    @DeleteMapping("/employment-types/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEmploymentType(@PathVariable UUID id) {
        orgDnaService.deleteEmploymentType(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Employment Type deleted successfully"));
    }

    // ── Cost Centers ──────────────────────────────────────────
    @PostMapping("/organizations/{orgId}/cost-centers")
    public ResponseEntity<ApiResponse<CostCenter>> createCostCenter(@PathVariable UUID orgId, @RequestBody CostCenter cc) {
        CostCenter created = orgDnaService.createCostCenter(cc, orgId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(created, "Cost Center created successfully"));
    }

    @PutMapping("/cost-centers/{id}")
    public ResponseEntity<ApiResponse<CostCenter>> updateCostCenter(@PathVariable UUID id, @RequestBody CostCenter cc) {
        CostCenter updated = orgDnaService.updateCostCenter(id, cc);
        return ResponseEntity.ok(ApiResponse.success(updated, "Cost Center updated successfully"));
    }

    @GetMapping("/organizations/{orgId}/cost-centers")
    public ResponseEntity<ApiResponse<List<CostCenter>>> getCostCenters(@PathVariable UUID orgId) {
        List<CostCenter> ccs = orgDnaService.getCostCentersByOrg(orgId);
        return ResponseEntity.ok(ApiResponse.success(ccs, "Cost Centers retrieved successfully"));
    }

    @DeleteMapping("/cost-centers/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCostCenter(@PathVariable UUID id) {
        orgDnaService.deleteCostCenter(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Cost Center deleted successfully"));
    }
}
