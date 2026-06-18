package com.managemyopz.security.controller;

import com.managemyopz.security.entity.Permission;
import com.managemyopz.security.entity.Role;
import com.managemyopz.security.entity.User;
import com.managemyopz.security.event.SecurityDomainEvent;
import com.managemyopz.security.repository.PermissionRepository;
import com.managemyopz.security.repository.RoleRepository;
import com.managemyopz.security.repository.UserRepository;
import com.managemyopz.security.service.JwtService;
import com.managemyopz.shared.dto.ApiResponse;
import com.managemyopz.shared.entity.TenantContext;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.*;

@Slf4j
@RestController
@RequestMapping("/v1/security")
@RequiredArgsConstructor
public class SecurityController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final ApplicationEventPublisher eventPublisher;

    @GetMapping("/users")
    public ApiResponse<List<User>> listUsers() {
        return ApiResponse.success(userRepository.findAll());
    }

    @PostMapping("/users")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<User> createUser(@RequestBody UserCreationRequest req, Principal principal) {
        String actor = principal != null ? principal.getName() : "system";
        String tenant = TenantContext.getCurrentTenant() != null ? TenantContext.getCurrentTenant() : "default";

        User user = new User();
        user.setTenantId(tenant);
        user.setUsername(req.getUsername());
        user.setEmail(req.getEmail());
        user.setPasswordHash(passwordEncoder.encode(req.getPassword() != null ? req.getPassword() : "Password123!"));
        user.setFirstName(req.getFirstName());
        user.setLastName(req.getLastName());
        user.setEmployeeId(req.getEmployeeId());
        user.setActive(true);

        if (req.getRoleCodes() != null) {
            Set<Role> roles = new HashSet<>();
            for (String roleCode : req.getRoleCodes()) {
                roleRepository.findByCode(roleCode).ifPresent(roles::add);
            }
            user.setRoles(roles);
        }

        User savedUser = userRepository.save(user);

        // Audit Event
        eventPublisher.publishEvent(new SecurityDomainEvent(
                "USER_CREATED",
                tenant,
                actor,
                savedUser.getId(),
                "User",
                Map.of("username", savedUser.getUsername(), "roles", savedUser.getRoles().stream().map(Role::getCode).toList())
        ));

        return ApiResponse.created(savedUser, "User created successfully");
    }

    @PostMapping("/users/{userId}/roles")
    public ApiResponse<User> assignRole(@PathVariable UUID userId, @RequestBody RoleAssignmentRequest req, Principal principal) {
        String actor = principal != null ? principal.getName() : "system";
        String tenant = TenantContext.getCurrentTenant() != null ? TenantContext.getCurrentTenant() : "default";

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Role role = roleRepository.findByCode(req.getRoleCode())
                .orElseThrow(() -> new IllegalArgumentException("Role not found"));

        // Save old state for audit
        List<String> rolesBefore = user.getRoles().stream().map(Role::getCode).toList();

        user.getRoles().add(role);
        User savedUser = userRepository.save(user);

        // Audit Event
        eventPublisher.publishEvent(new SecurityDomainEvent(
                "ROLE_ASSIGNED",
                tenant,
                actor,
                savedUser.getId(),
                "User",
                Map.of("roleCode", role.getCode(), "rolesBefore", rolesBefore, "rolesAfter", savedUser.getRoles().stream().map(Role::getCode).toList())
        ));

        return ApiResponse.success(savedUser, "Role assigned successfully");
    }

    @DeleteMapping("/users/{userId}/roles/{roleId}")
    public ApiResponse<User> revokeRole(@PathVariable UUID userId, @PathVariable UUID roleId, Principal principal) {
        String actor = principal != null ? principal.getName() : "system";
        String tenant = TenantContext.getCurrentTenant() != null ? TenantContext.getCurrentTenant() : "default";

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new IllegalArgumentException("Role not found"));

        // Save old state for audit
        List<String> rolesBefore = user.getRoles().stream().map(Role::getCode).toList();

        user.getRoles().remove(role);
        User savedUser = userRepository.save(user);

        // Audit Event
        eventPublisher.publishEvent(new SecurityDomainEvent(
                "ROLE_REVOKED",
                tenant,
                actor,
                savedUser.getId(),
                "User",
                Map.of("roleCode", role.getCode(), "rolesBefore", rolesBefore, "rolesAfter", savedUser.getRoles().stream().map(Role::getCode).toList())
        ));

        return ApiResponse.success(savedUser, "Role revoked successfully");
    }

    @GetMapping("/roles")
    public ApiResponse<List<Role>> listRoles() {
        return ApiResponse.success(roleRepository.findAll());
    }

    @GetMapping("/permissions")
    public ApiResponse<List<Permission>> listPermissions() {
        return ApiResponse.success(permissionRepository.findAll());
    }

    @PostMapping("/auth/token")
    public ApiResponse<TokenResponse> generateToken(@RequestBody TokenRequest req) {
        String username = req.getUsername() != null ? req.getUsername() : "test-admin";
        String tenantId = req.getTenantId() != null ? req.getTenantId() : "default";
        String role = req.getRole() != null ? req.getRole() : "ROLE_ADMIN";
        String employeeId = req.getEmployeeId();

        String token = jwtService.generateToken(username, tenantId, role, employeeId);
        TokenResponse response = new TokenResponse();
        response.setToken(token);
        response.setUsername(username);
        response.setTenantId(tenantId);
        response.setRole(role);
        response.setEmployeeId(employeeId);

        return ApiResponse.success(response, "Token generated successfully");
    }

    @Data
    public static class UserCreationRequest {
        private String username;
        private String email;
        private String password;
        private String firstName;
        private String lastName;
        private String employeeId;
        private List<String> roleCodes;
    }

    @Data
    public static class RoleAssignmentRequest {
        private String roleCode;
    }

    @Data
    public static class TokenRequest {
        private String username;
        private String tenantId;
        private String role;
        private String employeeId;
    }

    @Data
    public static class TokenResponse {
        private String token;
        private String username;
        private String tenantId;
        private String role;
        private String employeeId;
    }
}
