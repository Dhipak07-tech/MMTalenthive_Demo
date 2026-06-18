package com.managemyopz.twin.controller;

import com.managemyopz.security.entity.Role;
import com.managemyopz.security.entity.User;
import com.managemyopz.security.repository.RoleRepository;
import com.managemyopz.security.repository.UserRepository;
import com.managemyopz.shared.dto.ApiResponse;
import com.managemyopz.shared.entity.TenantContext;
import com.managemyopz.twin.entity.EmployeeTwin;
import com.managemyopz.twin.service.EmployeeTwinService;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/v1/onboarding")
@RequiredArgsConstructor
public class OnboardingController {

    private final EmployeeTwinService twinService;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final EntityManager entityManager;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_ULTRA_SUPER_ADMIN')")
    public ApiResponse<EmployeeTwin> onboardEmployee(@RequestBody EmployeeTwin employee, Principal principal) {
        String actor = principal != null ? principal.getName() : "system";
        String tenant = TenantContext.getCurrentTenant() != null ? TenantContext.getCurrentTenant() : "default";

        log.info("Starting onboarding orchestration for employee Code: {}, Email: {} by actor: {}", 
                 employee.getEmployeeCode(), employee.getWorkEmail(), actor);

        // 1. Create Employee Twin (Saves twin, nested collections, and publishes EmployeeCreatedEvent)
        EmployeeTwin createdTwin = twinService.createEmployee(employee, actor);

        // 2. Create User Account
        User user = new User();
        user.setTenantId(tenant);
        String username = employee.getEmployeeCode().toLowerCase();
        user.setUsername(username);
        user.setEmail(employee.getWorkEmail());
        user.setPasswordHash(passwordEncoder.encode("Password123!"));
        user.setFirstName(employee.getFirstName());
        user.setLastName(employee.getLastName());
        user.setEmployeeId(createdTwin.getId().toString());
        user.setActive(true);

        // 3. Assign Default Role (ROLE_EMPLOYEE)
        Set<Role> roles = new HashSet<>();
        roleRepository.findByCode("ROLE_EMPLOYEE").ifPresent(roles::add);
        user.setRoles(roles);

        userRepository.save(user);
        log.info("Created user account and assigned ROLE_EMPLOYEE for: {}", username);

        // 4. Initialize Leave Balances
        try {
            List<Object[]> leaveTypes = entityManager.createNativeQuery(
                "SELECT id, default_days FROM leave_types WHERE active = true"
            ).getResultList();

            int currentYear = LocalDate.now().getYear();
            for (Object[] row : leaveTypes) {
                byte[] typeIdBytes = (byte[]) row[0];
                Double defaultDays = ((Number) row[1]).doubleValue();

                UUID balanceId = UUID.randomUUID();
                entityManager.createNativeQuery(
                    "INSERT INTO leave_balances (id, tenant_id, employee_id, leave_type_id, year, total_allocated, total_used, total_pending, carried_forward, balance, version, deleted) " +
                    "VALUES (:id, :tenantId, :employeeId, :leaveTypeId, :year, :totalAllocated, 0, 0, 0, :balance, 0, false)"
                )
                .setParameter("id", balanceId)
                .setParameter("tenantId", tenant)
                .setParameter("employeeId", createdTwin.getId())
                .setParameter("leaveTypeId", typeIdBytes)
                .setParameter("year", currentYear)
                .setParameter("totalAllocated", defaultDays)
                .setParameter("balance", defaultDays)
                .executeUpdate();
            }
            log.info("Initialized default leave balances for employee ID: {}", createdTwin.getId());
        } catch (Exception e) {
            log.error("Failed to initialize leave balances during onboarding", e);
        }

        return ApiResponse.created(createdTwin, "Employee onboarded successfully");
    }
}
