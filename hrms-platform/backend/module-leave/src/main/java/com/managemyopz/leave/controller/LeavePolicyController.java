package com.managemyopz.leave.controller;

import com.managemyopz.leave.entity.LeavePolicy;
import com.managemyopz.leave.entity.LeavePolicyRule;
import com.managemyopz.leave.entity.LeavePolicyAssignment;
import com.managemyopz.leave.repository.LeavePolicyRepository;
import com.managemyopz.leave.repository.LeavePolicyRuleRepository;
import com.managemyopz.leave.repository.LeavePolicyAssignmentRepository;
import com.managemyopz.leave.service.LeavePolicyAssignmentService;
import com.managemyopz.shared.dto.ApiResponse;
import com.managemyopz.shared.entity.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/v1/leave-policies")
@RequiredArgsConstructor
public class LeavePolicyController {

    private final LeavePolicyRepository leavePolicyRepository;
    private final LeavePolicyRuleRepository leavePolicyRuleRepository;
    private final LeavePolicyAssignmentRepository leavePolicyAssignmentRepository;
    private final LeavePolicyAssignmentService leavePolicyAssignmentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<LeavePolicy>>> getLeavePolicies() {
        String tenantId = TenantContext.getCurrentTenant();
        List<LeavePolicy> policies = leavePolicyRepository.findByTenantIdAndDeletedFalse(tenantId);
        return ResponseEntity.ok(ApiResponse.success(policies, "Leave policies retrieved successfully"));
    }

    @PostMapping
    @Transactional
    public ResponseEntity<ApiResponse<LeavePolicy>> createLeavePolicy(@RequestBody LeavePolicy policy) {
        if (policy.getTenantId() == null) {
            policy.setTenantId(TenantContext.getCurrentTenant());
        }
        LeavePolicy saved = leavePolicyRepository.save(policy);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(saved, "Leave policy created successfully"));
    }

    @GetMapping("/{id}/rules")
    public ResponseEntity<ApiResponse<List<LeavePolicyRule>>> getPolicyRules(@PathVariable UUID id) {
        List<LeavePolicyRule> rules = leavePolicyRuleRepository.findByPolicyIdAndDeletedFalse(id);
        return ResponseEntity.ok(ApiResponse.success(rules, "Leave policy rules retrieved successfully"));
    }

    @PostMapping("/{id}/rules")
    @Transactional
    public ResponseEntity<ApiResponse<LeavePolicyRule>> createPolicyRule(@PathVariable UUID id, @RequestBody LeavePolicyRule rule) {
        rule.setPolicyId(id);
        if (rule.getTenantId() == null) {
            rule.setTenantId(TenantContext.getCurrentTenant());
        }
        LeavePolicyRule saved = leavePolicyRuleRepository.save(rule);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(saved, "Leave policy rule added successfully"));
    }

    @PostMapping("/assignments")
    @Transactional
    public ResponseEntity<ApiResponse<LeavePolicyAssignment>> createAssignment(@RequestBody LeavePolicyAssignment assignment) {
        if (assignment.getTenantId() == null) {
            assignment.setTenantId(TenantContext.getCurrentTenant());
        }
        LeavePolicyAssignment saved = leavePolicyAssignmentRepository.save(assignment);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(saved, "Leave policy assignment created successfully"));
    }

    @GetMapping("/assignments")
    public ResponseEntity<ApiResponse<List<LeavePolicyAssignment>>> getAssignments() {
        String tenantId = TenantContext.getCurrentTenant();
        List<LeavePolicyAssignment> assignments = leavePolicyAssignmentRepository.findByTenantIdAndDeletedFalse(tenantId);
        return ResponseEntity.ok(ApiResponse.success(assignments, "Leave policy assignments retrieved successfully"));
    }

    @GetMapping("/resolved/{employeeId}")
    public ResponseEntity<ApiResponse<ResolvedPolicyDto>> getResolvedPolicy(@PathVariable UUID employeeId) {
        UUID policyId = leavePolicyAssignmentService.resolvePolicy(employeeId);
        if (policyId == null) {
            return ResponseEntity.ok(ApiResponse.success(null, "No policy resolved for employee"));
        }
        LeavePolicy policy = leavePolicyRepository.findById(policyId).orElse(null);
        List<LeavePolicyRule> rules = leavePolicyRuleRepository.findByPolicyIdAndDeletedFalse(policyId);
        ResolvedPolicyDto resolved = new ResolvedPolicyDto(policy, rules);
        return ResponseEntity.ok(ApiResponse.success(resolved, "Resolved policy retrieved successfully"));
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    public static class ResolvedPolicyDto {
        private LeavePolicy policy;
        private List<LeavePolicyRule> rules;
    }

    @PostMapping("/recalculate-balances")
    public ResponseEntity<ApiResponse<Void>> recalculateBalances(
            @RequestParam UUID employeeId,
            @RequestParam(required = false, defaultValue = "recalculate") String action) {
        
        if (action.equalsIgnoreCase("regenerate")) {
            leavePolicyAssignmentService.regenerateWallets(employeeId);
        } else {
            leavePolicyAssignmentService.recalculateBalances(employeeId);
        }
        
        return ResponseEntity.ok(ApiResponse.success(null, "Leave balances updated successfully via action: " + action));
    }
}
