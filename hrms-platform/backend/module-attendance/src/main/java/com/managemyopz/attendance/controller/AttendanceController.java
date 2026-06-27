package com.managemyopz.attendance.controller;

import com.managemyopz.attendance.dto.*;
import com.managemyopz.attendance.entity.*;
import com.managemyopz.attendance.service.AttendanceService;
import com.managemyopz.shared.dto.ApiResponse;
import com.managemyopz.shared.entity.TenantContext;
import com.managemyopz.twin.entity.EmployeeTwin;
import com.managemyopz.twin.repository.EmployeeTwinRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/v1/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final EmployeeTwinRepository employeeTwinRepository;

    private UUID getEmployeeIdForCurrentUser(UUID employeeId) {
        if (employeeId != null) {
            return employeeId;
        }
        String email = TenantContext.getCurrentUser();
        return employeeTwinRepository.findByWorkEmail(email)
                .map(EmployeeTwin::getId)
                .orElseThrow(() -> new IllegalArgumentException("No employee profile found for current user email: " + email));
    }

    @GetMapping("/status")
    @PreAuthorize("@rbac.hasPermission(authentication,'ATTENDANCE_VIEW')")
    public ResponseEntity<ApiResponse<AttendanceStatusResponse>> getStatus(@RequestParam(required = false) UUID employeeId) {
        UUID empId = getEmployeeIdForCurrentUser(employeeId);
        AttendanceStatusResponse status = attendanceService.getAttendanceStatus(empId);
        return ResponseEntity.ok(ApiResponse.success(status, "Attendance status retrieved successfully"));
    }

    @PostMapping("/clock-in")
    @PreAuthorize("@rbac.hasPermission(authentication,'ATTENDANCE_CLOCK')")
    public ResponseEntity<ApiResponse<AttendanceRecord>> clockIn(@RequestBody ClockInRequest request, @RequestParam(required = false) UUID employeeId) {
        UUID empId = getEmployeeIdForCurrentUser(employeeId);
        AttendanceRecord record = attendanceService.clockIn(empId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(record, "Clocked in successfully"));
    }

    @PostMapping("/clock-out")
    @PreAuthorize("@rbac.hasPermission(authentication,'ATTENDANCE_CLOCK')")
    public ResponseEntity<ApiResponse<AttendanceRecord>> clockOut(
            @RequestBody(required = false) ClockOutRequest request,
            @RequestParam(required = false) UUID employeeId) {
        UUID empId = getEmployeeIdForCurrentUser(employeeId);
        AttendanceRecord record = attendanceService.clockOut(empId, request);
        return ResponseEntity.ok(ApiResponse.success(record, "Clocked out successfully"));
    }

    @GetMapping("/my-history")
    @PreAuthorize("@rbac.hasPermission(authentication,'ATTENDANCE_VIEW')")
    public ResponseEntity<ApiResponse<List<AttendanceRecord>>> getMyHistory(
            @RequestParam(required = false) UUID employeeId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        UUID empId = getEmployeeIdForCurrentUser(employeeId);
        LocalDate start = startDate != null ? LocalDate.parse(startDate) : null;
        LocalDate end = endDate != null ? LocalDate.parse(endDate) : null;
        List<AttendanceRecord> history = attendanceService.getMyHistory(empId, start, end);
        return ResponseEntity.ok(ApiResponse.success(history, "Attendance history retrieved successfully"));
    }

    @GetMapping("/my-calendar")
    @PreAuthorize("@rbac.hasPermission(authentication,'ATTENDANCE_VIEW')")
    public ResponseEntity<ApiResponse<List<AttendanceRecord>>> getMyCalendar(
            @RequestParam(required = false) UUID employeeId,
            @RequestParam String startDate,
            @RequestParam String endDate) {
        UUID empId = getEmployeeIdForCurrentUser(employeeId);
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);
        List<AttendanceRecord> calendar = attendanceService.getMyCalendar(empId, start, end);
        return ResponseEntity.ok(ApiResponse.success(calendar, "Calendar logs retrieved successfully"));
    }

    @PostMapping("/regularize")
    @PreAuthorize("@rbac.hasPermission(authentication,'ATTENDANCE_REGULARIZE_APPLY')")
    public ResponseEntity<ApiResponse<AttendanceRegularization>> applyRegularization(
            @RequestBody RegularizationRequestDto dto,
            @RequestParam(required = false) UUID employeeId) {
        UUID empId = getEmployeeIdForCurrentUser(employeeId);
        AttendanceRegularization req = attendanceService.applyRegularization(empId, dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(req, "Regularization request submitted successfully"));
    }

    @GetMapping("/regularizations/my")
    @PreAuthorize("@rbac.hasPermission(authentication,'ATTENDANCE_VIEW')")
    public ResponseEntity<ApiResponse<List<AttendanceRegularization>>> getMyRegularizations(@RequestParam(required = false) UUID employeeId) {
        UUID empId = getEmployeeIdForCurrentUser(employeeId);
        List<AttendanceRegularization> list = attendanceService.getMyRegularizations(empId);
        return ResponseEntity.ok(ApiResponse.success(list, "Personal regularization requests retrieved"));
    }

    @GetMapping("/regularizations/team")
    @PreAuthorize("@rbac.hasPermission(authentication,'ATTENDANCE_REGULARIZE_APPROVE')")
    public ResponseEntity<ApiResponse<List<AttendanceRegularization>>> getTeamRegularizations() {
        List<AttendanceRegularization> list = attendanceService.getTeamRegularizations();
        return ResponseEntity.ok(ApiResponse.success(list, "Team regularization requests retrieved"));
    }

    @PostMapping("/regularizations/{id}/action")
    @PreAuthorize("@rbac.hasPermission(authentication,'ATTENDANCE_REGULARIZE_APPROVE')")
    public ResponseEntity<ApiResponse<AttendanceRegularization>> actionRegularization(
            @PathVariable UUID id,
            @RequestBody RegularizationActionRequest request) {
        AttendanceRegularization res = attendanceService.actionRegularization(id, request);
        return ResponseEntity.ok(ApiResponse.success(res, "Regularization request status updated to " + request.getStatus()));
    }

    @GetMapping("/team-history")
    @PreAuthorize("@rbac.hasPermission(authentication,'ATTENDANCE_TEAM_VIEW')")
    public ResponseEntity<ApiResponse<List<AttendanceRecord>>> getTeamHistory(
            @RequestParam String date,
            @RequestParam(required = false) UUID departmentId,
            @RequestParam(required = false) UUID employeeId) {
        LocalDate localDate = LocalDate.parse(date);
        List<AttendanceRecord> teamHistory = attendanceService.getTeamHistory(localDate, departmentId, employeeId);
        return ResponseEntity.ok(ApiResponse.success(teamHistory, "Team logs retrieved successfully"));
    }

    @GetMapping("/dashboard")
    @PreAuthorize("@rbac.hasPermission(authentication,'ATTENDANCE_DASHBOARD_VIEW')")
    public ResponseEntity<ApiResponse<AttendanceDashboardDto>> getDashboardStats() {
        AttendanceDashboardDto stats = attendanceService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats, "Dashboard statistics retrieved"));
    }

    @GetMapping("/reports")
    @PreAuthorize("@rbac.hasPermission(authentication,'ATTENDANCE_REPORT_VIEW')")
    public ResponseEntity<ApiResponse<List<AttendanceRecord>>> getReports(
            @RequestParam String reportType,
            @RequestParam String startDate,
            @RequestParam String endDate,
            @RequestParam(required = false) UUID departmentId,
            @RequestParam(required = false) UUID employeeId,
            @RequestParam(required = false) UUID locationId) {
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);
        List<AttendanceRecord> list = attendanceService.getReports(reportType, start, end, departmentId, employeeId, locationId);
        return ResponseEntity.ok(ApiResponse.success(list, "Attendance report generated successfully"));
    }

    @GetMapping("/settings")
    @PreAuthorize("@rbac.hasPermission(authentication,'ATTENDANCE_VIEW')")
    public ResponseEntity<ApiResponse<AttendanceSettings>> getSettings() {
        AttendanceSettings settings = attendanceService.getSettings();
        return ResponseEntity.ok(ApiResponse.success(settings, "Tenant settings retrieved successfully"));
    }

    @PostMapping("/settings")
    @PreAuthorize("@rbac.hasPermission(authentication,'ATTENDANCE_SETTINGS_MANAGE')")
    public ResponseEntity<ApiResponse<AttendanceSettings>> updateSettings(@RequestBody AttendanceSettingsDto request) {
        AttendanceSettings settings = attendanceService.updateSettings(request);
        return ResponseEntity.ok(ApiResponse.success(settings, "Tenant settings updated successfully"));
    }

    // Office Location CRUD mappings
    @GetMapping("/locations")
    @PreAuthorize("@rbac.hasPermission(authentication,'ATTENDANCE_VIEW')")
    public ResponseEntity<ApiResponse<List<OfficeLocation>>> getOfficeLocations() {
        List<OfficeLocation> list = attendanceService.getOfficeLocations();
        return ResponseEntity.ok(ApiResponse.success(list, "Office locations retrieved successfully"));
    }

    @PostMapping("/locations")
    @PreAuthorize("@rbac.hasPermission(authentication,'ATTENDANCE_LOCATION_MANAGE')")
    public ResponseEntity<ApiResponse<OfficeLocation>> saveOfficeLocation(@RequestBody OfficeLocation location) {
        OfficeLocation saved = attendanceService.saveOfficeLocation(location);
        return ResponseEntity.ok(ApiResponse.success(saved, "Office location saved successfully"));
    }

    @DeleteMapping("/locations/{id}")
    @PreAuthorize("@rbac.hasPermission(authentication,'ATTENDANCE_LOCATION_MANAGE')")
    public ResponseEntity<ApiResponse<Void>> deleteOfficeLocation(@PathVariable UUID id) {
        attendanceService.deleteOfficeLocation(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Office location deleted successfully"));
    }

    // Biometric Device CRUD mappings
    @GetMapping("/devices")
    @PreAuthorize("@rbac.hasPermission(authentication,'ATTENDANCE_VIEW')")
    public ResponseEntity<ApiResponse<List<BiometricDevice>>> getBiometricDevices() {
        List<BiometricDevice> list = attendanceService.getBiometricDevices();
        return ResponseEntity.ok(ApiResponse.success(list, "Biometric devices retrieved successfully"));
    }

    @PostMapping("/devices")
    @PreAuthorize("@rbac.hasPermission(authentication,'ATTENDANCE_DEVICE_MANAGE')")
    public ResponseEntity<ApiResponse<BiometricDevice>> saveBiometricDevice(@RequestBody BiometricDevice device) {
        BiometricDevice saved = attendanceService.saveBiometricDevice(device);
        return ResponseEntity.ok(ApiResponse.success(saved, "Biometric device saved successfully"));
    }

    @DeleteMapping("/devices/{id}")
    @PreAuthorize("@rbac.hasPermission(authentication,'ATTENDANCE_DEVICE_MANAGE')")
    public ResponseEntity<ApiResponse<Void>> deleteBiometricDevice(@PathVariable UUID id) {
        attendanceService.deleteBiometricDevice(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Biometric device deleted successfully"));
    }

    // Biometric Logs mappings
    @GetMapping("/biometric-logs")
    @PreAuthorize("@rbac.hasPermission(authentication,'ATTENDANCE_BIOMETRIC_LOG_VIEW')")
    public ResponseEntity<ApiResponse<List<BiometricLog>>> getBiometricLogs() {
        List<BiometricLog> list = attendanceService.getBiometricLogs();
        return ResponseEntity.ok(ApiResponse.success(list, "Biometric logs retrieved successfully"));
    }

    @PostMapping("/biometric-logs/sync")
    @PreAuthorize("@rbac.hasPermission(authentication,'ATTENDANCE_DEVICE_MANAGE')")
    public ResponseEntity<ApiResponse<Void>> syncBiometricDevices() {
        attendanceService.syncBiometricDevices();
        return ResponseEntity.ok(ApiResponse.success(null, "Biometric devices synced successfully"));
    }

    // Selfies mapping
    @GetMapping("/selfies")
    @PreAuthorize("@rbac.hasPermission(authentication,'ATTENDANCE_SELFIE_VIEW')")
    public ResponseEntity<ApiResponse<List<AttendanceSelfie>>> getAttendanceSelfies() {
        List<AttendanceSelfie> list = attendanceService.getAttendanceSelfies();
        return ResponseEntity.ok(ApiResponse.success(list, "Selfies retrieved successfully"));
    }

    // Punch Locations mapping
    @GetMapping("/punches/locations")
    @PreAuthorize("@rbac.hasPermission(authentication,'ATTENDANCE_VIEW')")
    public ResponseEntity<ApiResponse<List<AttendanceLocation>>> getAttendanceLocations() {
        List<AttendanceLocation> list = attendanceService.getAttendanceLocations();
        return ResponseEntity.ok(ApiResponse.success(list, "Attendance locations retrieved successfully"));
    }

    // Phase 3 Endpoints
    // Face Recognition
    @GetMapping("/face")
    @PreAuthorize("@rbac.hasPermission(authentication,'ATTENDANCE_VIEW')")
    public ResponseEntity<ApiResponse<EmployeeFaceData>> getFace(@RequestParam(required = false) UUID employeeId) {
        UUID empId = getEmployeeIdForCurrentUser(employeeId);
        EmployeeFaceData face = attendanceService.getFace(empId);
        return ResponseEntity.ok(ApiResponse.success(face, "Face data retrieved successfully"));
    }

    @PostMapping("/face/register")
    @PreAuthorize("@rbac.hasPermission(authentication,'ATTENDANCE_FACE_MANAGE')")
    public ResponseEntity<ApiResponse<EmployeeFaceData>> registerFace(
            @RequestBody FaceRegistrationRequest request,
            @RequestParam(required = false) UUID employeeId) {
        UUID empId = getEmployeeIdForCurrentUser(employeeId);
        EmployeeFaceData face = attendanceService.registerFace(empId, request);
        return ResponseEntity.ok(ApiResponse.success(face, "Face registered successfully"));
    }

    @DeleteMapping("/face")
    @PreAuthorize("@rbac.hasPermission(authentication,'ATTENDANCE_FACE_MANAGE')")
    public ResponseEntity<ApiResponse<Void>> deleteFace(@RequestParam(required = false) UUID employeeId) {
        UUID empId = getEmployeeIdForCurrentUser(employeeId);
        attendanceService.deleteFace(empId);
        return ResponseEntity.ok(ApiResponse.success(null, "Face deleted successfully"));
    }

    @PostMapping("/face/verify")
    @PreAuthorize("@rbac.hasPermission(authentication,'ATTENDANCE_CLOCK')")
    public ResponseEntity<ApiResponse<FaceVerificationLog>> verifyFace(
            @RequestBody FaceVerificationRequest request,
            @RequestParam(required = false) UUID employeeId) {
        UUID empId = getEmployeeIdForCurrentUser(employeeId);
        FaceVerificationLog logData = attendanceService.verifyFace(empId, request);
        return ResponseEntity.ok(ApiResponse.success(logData, "Face verification log recorded"));
    }

    // QR Attendance
    @PostMapping("/qr/generate")
    @PreAuthorize("@rbac.hasPermission(authentication,'ATTENDANCE_QR_MANAGE')")
    public ResponseEntity<ApiResponse<QrAttendanceSession>> generateQr(@RequestBody QrGenerationRequest request) {
        QrAttendanceSession session = attendanceService.generateQrCode(request);
        return ResponseEntity.ok(ApiResponse.success(session, "QR Code session generated"));
    }

    @PostMapping("/qr/scan")
    @PreAuthorize("@rbac.hasPermission(authentication,'ATTENDANCE_CLOCK')")
    public ResponseEntity<ApiResponse<QrAttendanceSession>> scanQr(
            @RequestBody QrScanRequest request,
            @RequestParam(required = false) UUID employeeId) {
        UUID empId = getEmployeeIdForCurrentUser(employeeId);
        QrAttendanceSession session = attendanceService.scanQrCode(empId, request);
        return ResponseEntity.ok(ApiResponse.success(session, "QR scanned and clock-in recorded"));
    }

    @GetMapping("/qr/sessions")
    @PreAuthorize("@rbac.hasPermission(authentication,'ATTENDANCE_QR_MANAGE')")
    public ResponseEntity<ApiResponse<List<QrAttendanceSession>>> getQrSessions() {
        List<QrAttendanceSession> list = attendanceService.getQrSessions();
        return ResponseEntity.ok(ApiResponse.success(list, "QR sessions retrieved"));
    }

    // Productivity Analytics
    @GetMapping("/productivity")
    @PreAuthorize("@rbac.hasPermission(authentication,'ATTENDANCE_PRODUCTIVITY_VIEW')")
    public ResponseEntity<ApiResponse<ProductivityAnalyticsDto>> getProductivityAnalytics(
            @RequestParam String startDate,
            @RequestParam String endDate,
            @RequestParam(required = false) UUID departmentId,
            @RequestParam(required = false) UUID employeeId,
            @RequestParam(required = false) UUID locationId) {
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);
        ProductivityAnalyticsDto dto = attendanceService.getProductivityAnalytics(start, end, departmentId, employeeId, locationId);
        return ResponseEntity.ok(ApiResponse.success(dto, "Productivity analytics retrieved"));
    }

    // Heatmaps
    @GetMapping("/heatmaps")
    @PreAuthorize("@rbac.hasPermission(authentication,'ATTENDANCE_HEATMAP_VIEW')")
    public ResponseEntity<ApiResponse<List<AttendanceHeatmap>>> getHeatmaps(
            @RequestParam String viewType,
            @RequestParam String startDate,
            @RequestParam String endDate) {
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);
        List<AttendanceHeatmap> list = attendanceService.getHeatmaps(viewType, start, end);
        return ResponseEntity.ok(ApiResponse.success(list, "Heatmaps retrieved successfully"));
    }

    // AI Insights
    @GetMapping("/ai-insights")
    @PreAuthorize("@rbac.hasPermission(authentication,'ATTENDANCE_AI_INSIGHTS_VIEW')")
    public ResponseEntity<ApiResponse<List<AttendanceInsight>>> getAiInsights(
            @RequestParam(required = false) UUID departmentId,
            @RequestParam(required = false) UUID employeeId) {
        List<AttendanceInsight> list = attendanceService.getAiInsights(departmentId, employeeId);
        return ResponseEntity.ok(ApiResponse.success(list, "AI insights retrieved"));
    }

    // Payroll Integration
    @GetMapping("/payroll/summary")
    @PreAuthorize("@rbac.hasPermission(authentication,'ATTENDANCE_PAYROLL_MANAGE')")
    public ResponseEntity<ApiResponse<List<PayrollAttendanceSummary>>> getPayrollSummary(@RequestParam String yearMonth) {
        List<PayrollAttendanceSummary> list = attendanceService.getPayrollSummary(yearMonth);
        return ResponseEntity.ok(ApiResponse.success(list, "Payroll summaries retrieved"));
    }

    @PostMapping("/payroll/calculate")
    @PreAuthorize("@rbac.hasPermission(authentication,'ATTENDANCE_PAYROLL_MANAGE')")
    public ResponseEntity<ApiResponse<List<PayrollAttendanceSummary>>> calculatePayrollSummary(@RequestParam String yearMonth) {
        List<PayrollAttendanceSummary> list = attendanceService.calculatePayrollSummary(yearMonth);
        return ResponseEntity.ok(ApiResponse.success(list, "Payroll summaries calculated successfully"));
    }

    @PostMapping("/payroll/lock")
    @PreAuthorize("@rbac.hasPermission(authentication,'ATTENDANCE_PAYROLL_MANAGE')")
    public ResponseEntity<ApiResponse<Void>> lockPayrollPeriod(@RequestParam String yearMonth) {
        attendanceService.lockPayrollPeriod(yearMonth);
        return ResponseEntity.ok(ApiResponse.success(null, "Payroll period locked successfully"));
    }

    // Notifications
    @GetMapping("/notifications")
    @PreAuthorize("@rbac.hasPermission(authentication,'ATTENDANCE_NOTIFICATIONS_VIEW')")
    public ResponseEntity<ApiResponse<List<AttendanceNotification>>> getNotifications(@RequestParam(required = false) UUID employeeId) {
        UUID empId = getEmployeeIdForCurrentUser(employeeId);
        List<AttendanceNotification> list = attendanceService.getNotifications(empId);
        return ResponseEntity.ok(ApiResponse.success(list, "Notifications retrieved"));
    }

    @PostMapping("/notifications/read")
    @PreAuthorize("@rbac.hasPermission(authentication,'ATTENDANCE_NOTIFICATIONS_VIEW')")
    public ResponseEntity<ApiResponse<Void>> markNotificationsAsRead(@RequestParam(required = false) UUID employeeId) {
        UUID empId = getEmployeeIdForCurrentUser(employeeId);
        attendanceService.markNotificationsAsRead(empId);
        return ResponseEntity.ok(ApiResponse.success(null, "Notifications marked as read"));
    }

    // Audit logs
    @GetMapping("/audit-logs")
    @PreAuthorize("@rbac.hasPermission(authentication,'ATTENDANCE_AUDIT_VIEW')")
    public ResponseEntity<ApiResponse<List<AttendanceAuditLog>>> getAuditLogs() {
        List<AttendanceAuditLog> list = attendanceService.getAuditLogs();
        return ResponseEntity.ok(ApiResponse.success(list, "Audit logs retrieved"));
    }
}
