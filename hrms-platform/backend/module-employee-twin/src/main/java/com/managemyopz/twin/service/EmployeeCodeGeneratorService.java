package com.managemyopz.twin.service;

import com.managemyopz.orgdna.repository.OrganizationRepository;
import com.managemyopz.twin.entity.EmployeeCodeSequence;
import com.managemyopz.twin.repository.EmployeeCodeSequenceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmployeeCodeGeneratorService {

    private final OrganizationRepository organizationRepository;
    private final EmployeeCodeSequenceRepository sequenceRepository;

    /**
     * Generates a unique, thread-safe, and tenant-safe Employee Code.
     * Format: {ORG_CODE}-EMP-{SEQUENCE}
     *
     * @param organizationId the UUID of the organization
     * @return the generated employee code
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public String generateEmployeeCode(UUID organizationId) {
        String orgCode = "ORG";
        
        if (organizationId != null) {
            orgCode = organizationRepository.findById(organizationId)
                .map(org -> org.getCode())
                .orElse("ORG");
        }
        
        // Ensure orgCode is uppercase
        orgCode = orgCode.trim().toUpperCase();

        UUID targetOrgId = organizationId != null ? organizationId : UUID.nameUUIDFromBytes("default-org".getBytes());

        // Pessimistically lock and fetch/create sequence counter
        EmployeeCodeSequence seq = sequenceRepository.findByOrganizationIdForUpdate(targetOrgId)
            .orElseGet(() -> {
                EmployeeCodeSequence newSeq = new EmployeeCodeSequence(targetOrgId, 0);
                return sequenceRepository.saveAndFlush(newSeq);
            });

        int nextSequence = seq.getLastSequence() + 1;
        seq.setLastSequence(nextSequence);
        sequenceRepository.saveAndFlush(seq);

        String generatedCode = String.format("%s-EMP-%06d", orgCode, nextSequence);
        log.info("Generated Employee Code for organization {}: {}", orgCode, generatedCode);
        return generatedCode;
    }

    /**
     * Previews the next sequence code without incrementing/modifying the database.
     */
    @Transactional(readOnly = true)
    public String previewNextEmployeeCode(UUID organizationId) {
        String orgCode = "ORG";
        if (organizationId != null) {
            orgCode = organizationRepository.findById(organizationId)
                .map(org -> org.getCode())
                .orElse("ORG");
        }
        orgCode = orgCode.trim().toUpperCase();

        UUID targetOrgId = organizationId != null ? organizationId : UUID.nameUUIDFromBytes("default-org".getBytes());
        int lastSeq = sequenceRepository.findById(targetOrgId)
            .map(EmployeeCodeSequence::getLastSequence)
            .orElse(0);

        return String.format("%s-EMP-%06d", orgCode, lastSeq + 1);
    }
}
