package com.managemyopz.attendance.service;

import com.managemyopz.attendance.dto.*;
import com.managemyopz.attendance.entity.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface AttendanceService {

    AttendanceStatusResponse getAttendanceStatus(UUID employeeId);

    AttendanceRecord clockIn(UUID employeeId, ClockInRequest request);

    AttendanceRecord clockOut(UUID employeeId, ClockOutRequest request);

    List<AttendanceRecord> getMyHistory(UUID employeeId, LocalDate startDate, LocalDate endDate);

    List<AttendanceRecord> getMyCalendar(UUID employeeId, LocalDate startDate, LocalDate endDate);

    AttendanceRegularization applyRegularization(UUID employeeId, RegularizationRequestDto request);

    List<AttendanceRegularization> getMyRegularizations(UUID employeeId);

    List<AttendanceRegularization> getTeamRegularizations();

    AttendanceRegularization actionRegularization(UUID regularizationId, RegularizationActionRequest request);

    List<AttendanceRecord> getTeamHistory(LocalDate date, UUID departmentId, UUID employeeId);

    AttendanceDashboardDto getDashboardStats();

    List<AttendanceRecord> getReports(String reportType, LocalDate startDate, LocalDate endDate, UUID departmentId, UUID employeeId, UUID locationId);

    AttendanceSettings getSettings();

    AttendanceSettings updateSettings(AttendanceSettingsDto request);

    // Phase 2 Additions
    List<OfficeLocation> getOfficeLocations();
    OfficeLocation saveOfficeLocation(OfficeLocation location);
    void deleteOfficeLocation(UUID id);

    List<BiometricDevice> getBiometricDevices();
    BiometricDevice saveBiometricDevice(BiometricDevice device);
    void deleteBiometricDevice(UUID id);

    List<BiometricLog> getBiometricLogs();
    void syncBiometricDevices();

    List<AttendanceSelfie> getAttendanceSelfies();
    List<AttendanceLocation> getAttendanceLocations();

    // Phase 3 Additions
    // Face Recognition
    EmployeeFaceData registerFace(UUID employeeId, FaceRegistrationRequest request);
    EmployeeFaceData getFace(UUID employeeId);
    void deleteFace(UUID employeeId);
    FaceVerificationLog verifyFace(UUID employeeId, FaceVerificationRequest request);

    // QR Attendance
    QrAttendanceSession generateQrCode(QrGenerationRequest request);
    QrAttendanceSession scanQrCode(UUID employeeId, QrScanRequest request);
    List<QrAttendanceSession> getQrSessions();

    // Productivity Analytics
    ProductivityAnalyticsDto getProductivityAnalytics(LocalDate startDate, LocalDate endDate, UUID departmentId, UUID employeeId, UUID locationId);

    // Heatmaps
    List<AttendanceHeatmap> getHeatmaps(String viewType, LocalDate startDate, LocalDate endDate);

    // AI Insights
    List<AttendanceInsight> getAiInsights(UUID departmentId, UUID employeeId);

    // Payroll Summary
    List<PayrollAttendanceSummary> getPayrollSummary(String yearMonth);
    void lockPayrollPeriod(String yearMonth);
    List<PayrollAttendanceSummary> calculatePayrollSummary(String yearMonth);

    // Notifications
    List<AttendanceNotification> getNotifications(UUID employeeId);
    void markNotificationsAsRead(UUID employeeId);

    // Audit logs
    List<AttendanceAuditLog> getAuditLogs();
    void logAudit(String performedBy, String action, String oldValue, String newValue);
}
