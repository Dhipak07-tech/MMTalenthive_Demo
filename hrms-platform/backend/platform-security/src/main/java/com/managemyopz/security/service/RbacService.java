package com.managemyopz.security.service;

import com.managemyopz.security.entity.Permission;
import com.managemyopz.security.entity.Role;
import com.managemyopz.security.entity.User;
import com.managemyopz.security.repository.UserRepository;
import com.managemyopz.shared.entity.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Optional;

@Slf4j
@Component("rbac")
@RequiredArgsConstructor
public class RbacService {

    private final UserRepository userRepository;

    private static final Map<String, Integer> ROLE_PRIORITIES = Map.of(
            "ROLE_ULTRA_SUPER_ADMIN", 100,
            "ROLE_SUPER_ADMIN", 80,
            "ROLE_ADMIN", 60,
            "ROLE_EMPLOYEE", 20
    );

    public boolean hasRole(Authentication auth, String roleCode) {
        if (auth == null || !auth.isAuthenticated()) {
            return false;
        }
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals(roleCode));
    }

    public boolean hasAnyRole(Authentication auth, String... roleCodes) {
        if (auth == null || !auth.isAuthenticated()) {
            return false;
        }
        for (String roleCode : roleCodes) {
            if (hasRole(auth, roleCode)) {
                return true;
            }
        }
        return false;
    }

    @Transactional(readOnly = true)
    public boolean hasPermission(Authentication auth, String permissionKey) {
        if (auth == null || !auth.isAuthenticated()) {
            return false;
        }

        String username = auth.getName();
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            return false;
        }

        User user = userOpt.get();
        // Ultra Super Admin has all permissions
        if (user.getRoles().stream().anyMatch(r -> "ROLE_ULTRA_SUPER_ADMIN".equals(r.getCode()))) {
            return true;
        }

        // Check user roles' permissions
        return user.getRoles().stream()
                .flatMap(role -> role.getPermissions().stream())
                .anyMatch(permission -> permissionKey.equals(permission.getPermissionKey()));
    }

    public boolean hasMinimumRole(Authentication auth, String minimumRoleCode) {
        if (auth == null || !auth.isAuthenticated()) {
            return false;
        }

        // Get highest priority of user's roles
        int userPriority = auth.getAuthorities().stream()
                .map(a -> ROLE_PRIORITIES.getOrDefault(a.getAuthority(), 0))
                .max(Integer::compareTo)
                .orElse(0);

        int minPriority = ROLE_PRIORITIES.getOrDefault(minimumRoleCode, 0);
        return userPriority >= minPriority;
    }

    /**
     * Checks if tenant isolation is violated.
     * Ultra Super Admin can access all tenants.
     * Super Admin and Admin can only access their own tenant.
     * Employee can only access their own record.
     */
    public boolean validateTenantAccess(Authentication auth, String requestTenantId) {
        if (auth == null || !auth.isAuthenticated()) {
            return false;
        }

        // Ultra Super Admin is bypass tenant isolation
        if (hasRole(auth, "ROLE_ULTRA_SUPER_ADMIN")) {
            return true;
        }

        // Check if tenant match
        String currentTenant = TenantContext.getCurrentTenant();
        return currentTenant != null && currentTenant.equals(requestTenantId);
    }
}
