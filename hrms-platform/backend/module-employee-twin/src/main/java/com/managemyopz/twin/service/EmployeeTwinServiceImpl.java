package com.managemyopz.twin.service;

import com.managemyopz.shared.entity.TenantContext;
import com.managemyopz.shared.event.EventPublisher;
import com.managemyopz.shared.exception.ResourceNotFoundException;
import com.managemyopz.twin.entity.*;
import com.managemyopz.twin.event.EmployeeCreatedEvent;
import com.managemyopz.twin.event.EmployeePromotedEvent;
import com.managemyopz.twin.event.EmployeeTerminatedEvent;
import com.managemyopz.twin.event.EmployeeTransferredEvent;
import com.managemyopz.twin.repository.EmployeeTwinRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmployeeTwinServiceImpl implements EmployeeTwinService {

    private final EmployeeTwinRepository repository;
    private final EventPublisher eventPublisher;
    private final EmployeeCodeGeneratorService codeGeneratorService;

    @Override
    @Transactional
    public EmployeeTwin createEmployee(EmployeeTwin employee, String triggeredBy) {
        String tenantId = TenantContext.getCurrentTenant();
        employee.setTenantId(tenantId);
        
        // Generate employee code automatically
        String generatedCode = codeGeneratorService.generateEmployeeCode(employee.getOrganizationId());
        employee.setEmployeeCode(generatedCode);
        
        if (employee.getSkills() != null) {
            for (com.managemyopz.twin.entity.EmployeeSkill s : employee.getSkills()) {
                s.setEmployeeTwin(employee);
                s.setTenantId(tenantId);
            }
        }
        if (employee.getCertifications() != null) {
            for (com.managemyopz.twin.entity.EmployeeCertification c : employee.getCertifications()) {
                c.setEmployeeTwin(employee);
                c.setTenantId(tenantId);
            }
        }
        if (employee.getDocuments() != null) {
            for (com.managemyopz.twin.entity.EmployeeDocument d : employee.getDocuments()) {
                d.setEmployeeTwin(employee);
                d.setTenantId(tenantId);
            }
        }
        if (employee.getRelationships() != null) {
            for (com.managemyopz.twin.entity.EmployeeRelationship r : employee.getRelationships()) {
                r.setEmployeeTwin(employee);
                r.setTenantId(tenantId);
            }
        }
        if (employee.getTimeline() != null) {
            for (com.managemyopz.twin.entity.EmployeeTimeline t : employee.getTimeline()) {
                t.setEmployeeTwin(employee);
                t.setTenantId(tenantId);
            }
        }
        if (employee.getCustomFields() != null) {
            for (com.managemyopz.twin.entity.EmployeeCustomField f : employee.getCustomFields()) {
                f.setEmployeeTwin(employee);
                f.setTenantId(tenantId);
            }
        }
        
        EmployeeTwin saved = repository.save(employee);
        
        eventPublisher.publish(new EmployeeCreatedEvent(
            tenantId,
            triggeredBy,
            saved.getId(),
            saved.getEmployeeCode(),
            saved.getWorkEmail(),
            saved.getFullName()
        ));
        
        return saved;
    }

    @Override
    @Transactional
    public EmployeeTwin updateEmployee(UUID id, EmployeeTwin details, String triggeredBy) {
        EmployeeTwin existing = getById(id);
        
        existing.setFirstName(details.getFirstName());
        existing.setMiddleName(details.getMiddleName());
        existing.setLastName(details.getLastName());
        existing.setDisplayName(details.getDisplayName());
        existing.setDateOfBirth(details.getDateOfBirth());
        existing.setGender(details.getGender());
        existing.setNationality(details.getNationality());
        existing.setMaritalStatus(details.getMaritalStatus());
        existing.setBloodGroup(details.getBloodGroup());
        existing.setPreferredLanguage(details.getPreferredLanguage());
        existing.setAvatarUrl(details.getAvatarUrl());
        
        existing.setPersonalEmail(details.getPersonalEmail());
        existing.setWorkPhone(details.getWorkPhone());
        existing.setPersonalPhone(details.getPersonalPhone());
        existing.setCurrentAddress(details.getCurrentAddress());
        existing.setPermanentAddress(details.getPermanentAddress());
        existing.setEmergencyContactName(details.getEmergencyContactName());
        existing.setEmergencyContactPhone(details.getEmergencyContactPhone());
        existing.setEmergencyContactRelation(details.getEmergencyContactRelation());
        
        existing.setPanNumber(details.getPanNumber());
        existing.setAadhaarNumber(details.getAadhaarNumber());
        existing.setUanNumber(details.getUanNumber());
        existing.setEsicNumber(details.getEsicNumber());
        existing.setPassportNumber(details.getPassportNumber());
        existing.setPassportExpiry(details.getPassportExpiry());
        
        existing.setBankName(details.getBankName());
        existing.setBankAccountNumber(details.getBankAccountNumber());
        existing.setBankIfsc(details.getBankIfsc());
        existing.setBankBranch(details.getBankBranch());

        // Sync Skills list
        if (details.getSkills() != null) {
            existing.getSkills().clear();
            for (EmployeeSkill s : details.getSkills()) {
                s.setEmployeeTwin(existing);
                s.setTenantId(existing.getTenantId());
                existing.getSkills().add(s);
            }
        }

        // Sync Certifications list
        if (details.getCertifications() != null) {
            existing.getCertifications().clear();
            for (EmployeeCertification c : details.getCertifications()) {
                c.setEmployeeTwin(existing);
                c.setTenantId(existing.getTenantId());
                existing.getCertifications().add(c);
            }
        }

        // Sync Documents list
        if (details.getDocuments() != null) {
            existing.getDocuments().clear();
            for (EmployeeDocument d : details.getDocuments()) {
                d.setEmployeeTwin(existing);
                d.setTenantId(existing.getTenantId());
                existing.getDocuments().add(d);
            }
        }

        // Sync Relationships list
        if (details.getRelationships() != null) {
            existing.getRelationships().clear();
            for (EmployeeRelationship r : details.getRelationships()) {
                r.setEmployeeTwin(existing);
                r.setTenantId(existing.getTenantId());
                existing.getRelationships().add(r);
            }
        }
        
        return repository.save(existing);
    }

    @Override
    @Transactional
    public EmployeeTwin transferEmployee(UUID id, UUID newDepartmentId, UUID newLocationId, String triggeredBy) {
        EmployeeTwin existing = getById(id);
        UUID oldDepartmentId = existing.getDepartmentId();
        UUID oldLocationId = existing.getLocationId();
        
        existing.setDepartmentId(newDepartmentId);
        existing.setLocationId(newLocationId);
        
        EmployeeTwin saved = repository.save(existing);
        
        eventPublisher.publish(new EmployeeTransferredEvent(
            TenantContext.getCurrentTenant(),
            triggeredBy,
            saved.getId(),
            oldDepartmentId,
            newDepartmentId,
            oldLocationId,
            newLocationId
        ));
        
        return saved;
    }

    @Override
    @Transactional
    public EmployeeTwin promoteEmployee(UUID id, UUID newDesignationId, UUID newGradeId, String triggeredBy) {
        EmployeeTwin existing = getById(id);
        UUID oldDesignationId = existing.getDesignationId();
        UUID oldGradeId = existing.getGradeId();
        
        existing.setDesignationId(newDesignationId);
        existing.setGradeId(newGradeId);
        
        EmployeeTwin saved = repository.save(existing);
        
        eventPublisher.publish(new EmployeePromotedEvent(
            TenantContext.getCurrentTenant(),
            triggeredBy,
            saved.getId(),
            oldDesignationId,
            newDesignationId,
            oldGradeId,
            newGradeId
        ));
        
        return saved;
    }

    @Override
    @Transactional
    public EmployeeTwin changeManager(UUID id, UUID newManagerId, String triggeredBy) {
        EmployeeTwin existing = getById(id);
        existing.setManagerId(newManagerId);
        return repository.save(existing);
    }

    @Override
    @Transactional
    public EmployeeTwin terminateEmployee(UUID id, LocalDate exitDate, String reason, String triggeredBy) {
        EmployeeTwin existing = getById(id);
        existing.setEmploymentStatus(EmployeeTwin.EmploymentStatus.TERMINATED);
        
        EmployeeTwin saved = repository.save(existing);
        
        eventPublisher.publish(new EmployeeTerminatedEvent(
            TenantContext.getCurrentTenant(),
            triggeredBy,
            saved.getId(),
            exitDate,
            reason
        ));
        
        return saved;
    }

    @Override
    @Transactional
    public void deleteEmployee(UUID id, String triggeredBy) {
        EmployeeTwin twin = getById(id);
        repository.delete(twin);
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeTwin getById(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("EmployeeTwin", id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeTwin> getAllActive() {
        return repository.findAllActiveByTenant(TenantContext.getCurrentTenant());
    }

    @Override
    @Transactional(readOnly = true)
    public int calculateProfileCompletion(UUID id) {
        EmployeeTwin twin = getById(id);
        double totalScore = 0.0;

        // 1. Identity (20%)
        double identityScore = 0.0;
        if (twin.getEmployeeCode() != null) identityScore += 1;
        if (twin.getFirstName() != null) identityScore += 1;
        if (twin.getLastName() != null) identityScore += 1;
        if (twin.getDateOfBirth() != null) identityScore += 1;
        if (twin.getGender() != null) identityScore += 1;
        if (twin.getNationality() != null) identityScore += 1;
        totalScore += (identityScore / 6.0) * 20.0;

        // 2. Contact (15%)
        double contactScore = 0.0;
        if (twin.getWorkEmail() != null) contactScore += 1;
        if (twin.getWorkPhone() != null) contactScore += 1;
        if (twin.getCurrentAddress() != null) contactScore += 1;
        if (twin.getEmergencyContactPhone() != null) contactScore += 1;
        totalScore += (contactScore / 4.0) * 15.0;

        // 3. Employment DNA (25%)
        double dnaScore = 0.0;
        if (twin.getDepartmentId() != null) dnaScore += 1;
        if (twin.getLocationId() != null) dnaScore += 1;
        if (twin.getCostCenterId() != null) dnaScore += 1;
        if (twin.getManagerId() != null) dnaScore += 1;
        if (twin.getDateOfJoining() != null) dnaScore += 1;
        totalScore += (dnaScore / 5.0) * 25.0;

        // 4. Compliance (15%)
        double complianceScore = 0.0;
        if (twin.getPanNumber() != null) complianceScore += 1;
        if (twin.getAadhaarNumber() != null) complianceScore += 1;
        if (twin.getUanNumber() != null) complianceScore += 1;
        totalScore += (complianceScore / 3.0) * 15.0;

        // 5. Banking (10%)
        double bankingScore = 0.0;
        if (twin.getBankName() != null) bankingScore += 1;
        if (twin.getBankAccountNumber() != null) bankingScore += 1;
        if (twin.getBankIfsc() != null) bankingScore += 1;
        totalScore += (bankingScore / 3.0) * 10.0;

        // 6. Documents (10%)
        if (twin.getDocuments() != null && !twin.getDocuments().isEmpty()) {
            totalScore += 10.0;
        }

        // 7. Skills (5%)
        if (twin.getSkills() != null && !twin.getSkills().isEmpty()) {
            totalScore += 5.0;
        }

        return (int) Math.round(totalScore);
    }

    @Override
    public String previewNextEmployeeCode(UUID organizationId) {
        return codeGeneratorService.previewNextEmployeeCode(organizationId);
    }
}
