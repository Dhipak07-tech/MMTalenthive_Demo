import { platformApi } from '../../app/api';

export interface AttendanceRecord {
  id?: string;
  employeeId: string;
  attendanceDate: string;
  checkIn?: string;
  checkOut?: string;
  workingHours?: number;
  status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LATE' | 'EARLY_LOGOUT' | 'LEAVE' | 'HOLIDAY' | 'WEEK_OFF';
  attendanceMode: 'OFFICE' | 'WFH' | 'REMOTE' | 'CLIENT_SITE';
  lateMinutes: number;
  earlyLogoutMinutes: number;
  ipAddress?: string;
  deviceInfo?: string;
}

export interface AttendanceRegularization {
  id?: string;
  employeeId: string;
  attendanceId?: string;
  requestType: 'MISSING_CHECK_IN' | 'MISSING_CHECK_OUT' | 'WRONG_TIMING' | 'ON_DUTY';
  requestedCheckIn?: string;
  requestedCheckOut?: string;
  reason: string;
  attachment?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  approvedAt?: string;
  createdAt?: string;
}

export interface AttendanceSettings {
  id?: string;
  shiftStartTime: string;
  shiftEndTime: string;
  gracePeriodMinutes: number;
  minHoursPresent: number;
  minHoursHalfDay: number;
  geofencingEnabled: boolean;
  selfieVerificationMode: 'DISABLED' | 'CLOCK_IN_ONLY' | 'CLOCK_OUT_ONLY' | 'BOTH';
  faceRecognitionEnabled: boolean;
}

export interface ClockInRequest {
  attendanceMode: 'OFFICE' | 'WFH' | 'REMOTE' | 'CLIENT_SITE';
  ipAddress?: string;
  deviceInfo?: string;
  latitude?: number;
  longitude?: number;
  selfie?: string;
  deviceType?: string;
  browser?: string;
  platform?: string;
}

export interface ClockOutRequest {
  latitude?: number;
  longitude?: number;
  selfie?: string;
  deviceType?: string;
  browser?: string;
  platform?: string;
}

export interface AttendanceStatusResponse {
  todayRecord?: AttendanceRecord;
  status: 'NOT_CHECKED_IN' | 'CHECKED_IN' | 'CHECKED_OUT';
  checkInTime?: string;
  checkOutTime?: string;
  workingHours?: number;
  activeTimerSeconds?: number;
}

export interface RegularizationRequestDto {
  attendanceId?: string;
  requestType: 'MISSING_CHECK_IN' | 'MISSING_CHECK_OUT' | 'WRONG_TIMING' | 'ON_DUTY';
  requestedCheckIn?: string;
  requestedCheckOut?: string;
  reason: string;
  attendanceDate?: string;
}

export interface RegularizationActionRequest {
  status: 'APPROVED' | 'REJECTED';
}

export interface AttendanceDashboardDto {
  presentCount: number;
  absentCount: number;
  lateCount: number;
  wfhCount: number;
  pendingRequests: number;
  dailyTrends: { date: string; percentage: number }[];
  monthlyPercentage: number;
  departmentStats: { departmentId: string; percentage: number }[];
}

export interface AttendanceSettingsDto {
  shiftStartTime: string;
  shiftEndTime: string;
  gracePeriodMinutes: number;
  minHoursPresent: number;
  minHoursHalfDay: number;
  geofencingEnabled: boolean;
  selfieVerificationMode: string;
  faceRecognitionEnabled: boolean;
}

export interface OfficeLocation {
  id?: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  departmentId?: string;
  isActive: boolean;
}

export interface AttendanceLocation {
  id?: string;
  attendanceId: string;
  employeeId: string;
  latitude: number;
  longitude: number;
  distance: number;
  insideRadius: boolean;
  timestamp: string;
}

export interface BiometricDevice {
  id?: string;
  name: string;
  deviceType: string;
  ipAddress: string;
  port: number;
  location: string;
  status: string;
}

export interface BiometricLog {
  id?: string;
  employeeId: string;
  deviceId: string;
  punchTime: string;
  punchType: string;
  syncStatus: string;
}

export interface AttendanceSelfie {
  id?: string;
  attendanceId: string;
  employeeId: string;
  imagePath: string;
  type: string;
  timestamp: string;
}

// Phase 3 Interfaces
export interface EmployeeFaceData {
  id?: string;
  employeeId: string;
  faceTemplate?: string;
  imagePath?: string;
  isActive: boolean;
}

export interface FaceVerificationLog {
  id?: string;
  employeeId: string;
  verificationStatus: string;
  imagePath?: string;
  timestamp: string;
  confidenceScore: number;
}

export interface QrAttendanceSession {
  id?: string;
  qrId: string;
  employeeId?: string;
  scanTime: string;
  latitude?: number;
  longitude?: number;
  officeLocationId?: string;
  departmentId?: string;
  expiresAt?: string;
  isActive: boolean;
}

export interface AttendanceHeatmap {
  id?: string;
  date: string;
  departmentId?: string;
  locationId?: string;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
}

export interface AttendanceInsight {
  id?: string;
  employeeId?: string;
  departmentId?: string;
  insightType: string;
  message: string;
  severity: string;
  riskScore: number;
  burnoutRisk?: string;
  productivityTrend?: string;
}

export interface AttendanceNotification {
  id?: string;
  employeeId: string;
  title: string;
  message: string;
  notificationType: string;
  deliveryChannel: string;
  isRead: boolean;
  sentAt: string;
}

export interface AttendanceAuditLog {
  id?: string;
  performedBy: string;
  action: string;
  timestamp: string;
  oldValue?: string;
  newValue?: string;
}

export interface PayrollAttendanceSummary {
  id?: string;
  employeeId: string;
  yearMonth: string;
  workingDays: number;
  payableDays: number;
  overtimeHours: number;
  lopDays: number;
  status: string; // DRAFT, LOCKED, EXPORTED
}

export interface ProductivityAnalyticsDto {
  averageWorkingHours: number;
  attendancePercentage: number;
  lateArrivalPercentage: number;
  absenteeRate: number;
  teamProductivityScore: number;
  employeeProductivityTrend: { label: string; value: number }[];
  departmentProductivityTrend: { label: string; value: number }[];
  locationProductivityTrend: { label: string; value: number }[];
  overtimeTrends: { label: string; value: number }[];
}

export interface FaceRegistrationRequest {
  faceTemplate: string;
  imagePath: string;
}

export interface FaceVerificationRequest {
  base64Image: string;
}

export interface QrGenerationRequest {
  locationId?: string;
  departmentId?: string;
  expiryMinutes: number;
}

export interface QrScanRequest {
  qrId: string;
  latitude?: number;
  longitude?: number;
}

export const attendanceApi = platformApi.injectEndpoints({
  endpoints: (builder) => ({
    getAttendanceStatus: builder.query<AttendanceStatusResponse, string | void>({
      query: (employeeId) => ({
        url: '/v1/attendance/status',
        params: employeeId ? { employeeId } : {},
      }),
      transformResponse: (response: any) => response.data,
      providesTags: [{ type: 'Attendance' as const, id: 'STATUS' }],
    }),
    clockIn: builder.mutation<AttendanceRecord, { body: ClockInRequest; employeeId?: string }>({
      query: ({ body, employeeId }) => ({
        url: '/v1/attendance/clock-in',
        method: 'POST',
        body,
        params: employeeId ? { employeeId } : {},
      }),
      invalidatesTags: [
        { type: 'Attendance', id: 'STATUS' },
        { type: 'Attendance', id: 'HISTORY' },
      ],
    }),
    clockOut: builder.mutation<AttendanceRecord, { body?: ClockOutRequest; employeeId?: string } | void>({
      query: (arg) => {
        const body = arg && 'body' in arg ? arg.body : undefined;
        const employeeId = arg && 'employeeId' in arg ? arg.employeeId : undefined;
        return {
          url: '/v1/attendance/clock-out',
          method: 'POST',
          body,
          params: employeeId ? { employeeId } : {},
        };
      },
      invalidatesTags: [
        { type: 'Attendance', id: 'STATUS' },
        { type: 'Attendance', id: 'HISTORY' },
      ],
    }),
    getMyHistory: builder.query<AttendanceRecord[], { employeeId?: string; startDate?: string; endDate?: string } | void>({
      query: (params) => ({
        url: '/v1/attendance/my-history',
        params: params || {},
      }),
      transformResponse: (response: any) => response.data || [],
      providesTags: [{ type: 'Attendance', id: 'HISTORY' }],
    }),
    getMyCalendar: builder.query<AttendanceRecord[], { employeeId?: string; startDate: string; endDate: string }>({
      query: (params) => ({
        url: '/v1/attendance/my-calendar',
        params,
      }),
      transformResponse: (response: any) => response.data || [],
      providesTags: [{ type: 'Attendance', id: 'CALENDAR' }],
    }),
    applyRegularization: builder.mutation<AttendanceRegularization, { body: RegularizationRequestDto; employeeId?: string }>({
      query: ({ body, employeeId }) => ({
        url: '/v1/attendance/regularize',
        method: 'POST',
        body,
        params: employeeId ? { employeeId } : {},
      }),
      invalidatesTags: [
        { type: 'Attendance', id: 'REGULARIZATIONS' },
      ],
    }),
    getMyRegularizations: builder.query<AttendanceRegularization[], string | void>({
      query: (employeeId) => ({
        url: '/v1/attendance/regularizations/my',
        params: employeeId ? { employeeId } : {},
      }),
      transformResponse: (response: any) => response.data || [],
      providesTags: [{ type: 'Attendance', id: 'REGULARIZATIONS' }],
    }),
    getTeamRegularizations: builder.query<AttendanceRegularization[], void>({
      query: () => '/v1/attendance/regularizations/team',
      transformResponse: (response: any) => response.data || [],
      providesTags: [{ type: 'Attendance', id: 'TEAM_REGULARIZATIONS' }],
    }),
    actionRegularization: builder.mutation<AttendanceRegularization, { id: string; body: RegularizationActionRequest }>({
      query: ({ id, body }) => ({
        url: `/v1/attendance/regularizations/${id}/action`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'Attendance', id: 'STATUS' },
        { type: 'Attendance', id: 'HISTORY' },
        { type: 'Attendance', id: 'TEAM_REGULARIZATIONS' },
        { type: 'Attendance', id: 'TEAM_HISTORY' },
        { type: 'Attendance', id: 'DASHBOARD' },
      ],
    }),
    getTeamHistory: builder.query<AttendanceRecord[], { date: string; departmentId?: string; employeeId?: string }>({
      query: (params) => ({
        url: '/v1/attendance/team-history',
        params,
      }),
      transformResponse: (response: any) => response.data || [],
      providesTags: [{ type: 'Attendance', id: 'TEAM_HISTORY' }],
    }),
    getDashboardStats: builder.query<AttendanceDashboardDto, void>({
      query: () => '/v1/attendance/dashboard',
      transformResponse: (response: any) => response.data,
      providesTags: [{ type: 'Attendance', id: 'DASHBOARD' }],
    }),
    getReports: builder.query<AttendanceRecord[], { reportType: string; startDate: string; endDate: string; departmentId?: string; employeeId?: string; locationId?: string }>({
      query: (params) => ({
        url: '/v1/attendance/reports',
        params,
      }),
      transformResponse: (response: any) => response.data || [],
      providesTags: [{ type: 'Attendance', id: 'REPORTS' }],
    }),
    getSettings: builder.query<AttendanceSettings, void>({
      query: () => '/v1/attendance/settings',
      transformResponse: (response: any) => response.data,
      providesTags: [{ type: 'Attendance', id: 'SETTINGS' }],
    }),
    updateSettings: builder.mutation<AttendanceSettings, AttendanceSettingsDto>({
      query: (body) => ({
        url: '/v1/attendance/settings',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'Attendance', id: 'SETTINGS' },
        { type: 'Attendance', id: 'STATUS' },
      ],
    }),
    getOfficeLocations: builder.query<OfficeLocation[], void>({
      query: () => '/v1/attendance/locations',
      transformResponse: (response: any) => response.data || [],
      providesTags: [{ type: 'Attendance', id: 'LOCATIONS' }],
    }),
    saveOfficeLocation: builder.mutation<OfficeLocation, OfficeLocation>({
      query: (body) => ({
        url: '/v1/attendance/locations',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Attendance', id: 'LOCATIONS' }],
    }),
    deleteOfficeLocation: builder.mutation<void, string>({
      query: (id) => ({
        url: `/v1/attendance/locations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Attendance', id: 'LOCATIONS' }],
    }),
    getBiometricDevices: builder.query<BiometricDevice[], void>({
      query: () => '/v1/attendance/devices',
      transformResponse: (response: any) => response.data || [],
      providesTags: [{ type: 'Attendance', id: 'DEVICES' }],
    }),
    saveBiometricDevice: builder.mutation<BiometricDevice, BiometricDevice>({
      query: (body) => ({
        url: '/v1/attendance/devices',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Attendance', id: 'DEVICES' }],
    }),
    deleteBiometricDevice: builder.mutation<void, string>({
      query: (id) => ({
        url: `/v1/attendance/devices/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Attendance', id: 'DEVICES' }],
    }),
    getBiometricLogs: builder.query<BiometricLog[], void>({
      query: () => '/v1/attendance/biometric-logs',
      transformResponse: (response: any) => response.data || [],
      providesTags: [{ type: 'Attendance', id: 'BIOMETRIC_LOGS' }],
    }),
    syncBiometricDevices: builder.mutation<void, void>({
      query: () => ({
        url: '/v1/attendance/biometric-logs/sync',
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Attendance', id: 'BIOMETRIC_LOGS' }],
    }),
    getAttendanceSelfies: builder.query<AttendanceSelfie[], void>({
      query: () => '/v1/attendance/selfies',
      transformResponse: (response: any) => response.data || [],
      providesTags: [{ type: 'Attendance', id: 'SELFIES' }],
    }),
    getAttendanceLocations: builder.query<AttendanceLocation[], void>({
      query: () => '/v1/attendance/punches/locations',
      transformResponse: (response: any) => response.data || [],
      providesTags: [{ type: 'Attendance', id: 'PUNCH_LOCATIONS' }],
    }),
    // Phase 3 Endpoints
    getFace: builder.query<EmployeeFaceData, string | void>({
      query: (employeeId) => ({
        url: '/v1/attendance/face',
        params: employeeId ? { employeeId } : {},
      }),
      transformResponse: (response: any) => response.data,
      providesTags: [{ type: 'Attendance', id: 'FACE' }],
    }),
    registerFace: builder.mutation<EmployeeFaceData, { body: FaceRegistrationRequest; employeeId?: string }>({
      query: ({ body, employeeId }) => ({
        url: '/v1/attendance/face/register',
        method: 'POST',
        body,
        params: employeeId ? { employeeId } : {},
      }),
      invalidatesTags: [{ type: 'Attendance', id: 'FACE' }, { type: 'Attendance', id: 'AUDIT_LOGS' }],
    }),
    deleteFace: builder.mutation<void, string | void>({
      query: (employeeId) => ({
        url: '/v1/attendance/face',
        method: 'DELETE',
        params: employeeId ? { employeeId } : {},
      }),
      invalidatesTags: [{ type: 'Attendance', id: 'FACE' }, { type: 'Attendance', id: 'AUDIT_LOGS' }],
    }),
    verifyFace: builder.mutation<FaceVerificationLog, { body: FaceVerificationRequest; employeeId?: string }>({
      query: ({ body, employeeId }) => ({
        url: '/v1/attendance/face/verify',
        method: 'POST',
        body,
        params: employeeId ? { employeeId } : {},
      }),
      invalidatesTags: [{ type: 'Attendance', id: 'STATUS' }, { type: 'Attendance', id: 'HISTORY' }, { type: 'Attendance', id: 'NOTIFICATIONS' }],
    }),
    generateQr: builder.mutation<QrAttendanceSession, QrGenerationRequest>({
      query: (body) => ({
        url: '/v1/attendance/qr/generate',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Attendance', id: 'QR_SESSIONS' }, { type: 'Attendance', id: 'AUDIT_LOGS' }],
    }),
    scanQr: builder.mutation<QrAttendanceSession, { body: QrScanRequest; employeeId?: string }>({
      query: ({ body, employeeId }) => ({
        url: '/v1/attendance/qr/scan',
        method: 'POST',
        body,
        params: employeeId ? { employeeId } : {},
      }),
      invalidatesTags: [{ type: 'Attendance', id: 'STATUS' }, { type: 'Attendance', id: 'HISTORY' }],
    }),
    getQrSessions: builder.query<QrAttendanceSession[], void>({
      query: () => '/v1/attendance/qr/sessions',
      transformResponse: (response: any) => response.data || [],
      providesTags: [{ type: 'Attendance', id: 'QR_SESSIONS' }],
    }),
    getProductivityAnalytics: builder.query<ProductivityAnalyticsDto, { startDate: string; endDate: string; departmentId?: string; employeeId?: string; locationId?: string }>({
      query: (params) => ({
        url: '/v1/attendance/productivity',
        params,
      }),
      transformResponse: (response: any) => response.data,
      providesTags: [{ type: 'Attendance', id: 'PRODUCTIVITY' }],
    }),
    getHeatmaps: builder.query<AttendanceHeatmap[], { viewType: string; startDate: string; endDate: string }>({
      query: (params) => ({
        url: '/v1/attendance/heatmaps',
        params,
      }),
      transformResponse: (response: any) => response.data || [],
      providesTags: [{ type: 'Attendance', id: 'HEATMAPS' }],
    }),
    getAttendanceAiInsights: builder.query<AttendanceInsight[], { departmentId?: string; employeeId?: string } | void>({
      query: (params) => ({
        url: '/v1/attendance/ai-insights',
        params: params || {},
      }),
      transformResponse: (response: any) => response.data || [],
      providesTags: [{ type: 'Attendance', id: 'AI_INSIGHTS' }],
    }),
    getPayrollSummary: builder.query<PayrollAttendanceSummary[], string>({
      query: (yearMonth) => ({
        url: '/v1/attendance/payroll/summary',
        params: { yearMonth },
      }),
      transformResponse: (response: any) => response.data || [],
      providesTags: [{ type: 'Attendance', id: 'PAYROLL' }],
    }),
    calculatePayrollSummary: builder.mutation<PayrollAttendanceSummary[], string>({
      query: (yearMonth) => ({
        url: '/v1/attendance/payroll/calculate',
        method: 'POST',
        params: { yearMonth },
      }),
      invalidatesTags: [{ type: 'Attendance', id: 'PAYROLL' }, { type: 'Attendance', id: 'AUDIT_LOGS' }],
    }),
    lockPayrollPeriod: builder.mutation<void, string>({
      query: (yearMonth) => ({
        url: '/v1/attendance/payroll/lock',
        method: 'POST',
        params: { yearMonth },
      }),
      invalidatesTags: [{ type: 'Attendance', id: 'PAYROLL' }, { type: 'Attendance', id: 'AUDIT_LOGS' }],
    }),
    getNotifications: builder.query<AttendanceNotification[], string | void>({
      query: (employeeId) => ({
        url: '/v1/attendance/notifications',
        params: employeeId ? { employeeId } : {},
      }),
      transformResponse: (response: any) => response.data || [],
      providesTags: [{ type: 'Attendance', id: 'NOTIFICATIONS' }],
    }),
    markNotificationsAsRead: builder.mutation<void, string | void>({
      query: (employeeId) => ({
        url: '/v1/attendance/notifications/read',
        method: 'POST',
        params: employeeId ? { employeeId } : {},
      }),
      invalidatesTags: [{ type: 'Attendance', id: 'NOTIFICATIONS' }],
    }),
    getAuditLogs: builder.query<AttendanceAuditLog[], void>({
      query: () => '/v1/attendance/audit-logs',
      transformResponse: (response: any) => response.data || [],
      providesTags: [{ type: 'Attendance', id: 'AUDIT_LOGS' }],
    }),
  }),
});

export const {
  useGetAttendanceStatusQuery,
  useClockInMutation,
  useClockOutMutation,
  useGetMyHistoryQuery,
  useGetMyCalendarQuery,
  useApplyRegularizationMutation,
  useGetMyRegularizationsQuery,
  useGetTeamRegularizationsQuery,
  useActionRegularizationMutation,
  useGetTeamHistoryQuery,
  useGetDashboardStatsQuery,
  useGetReportsQuery,
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useGetOfficeLocationsQuery,
  useSaveOfficeLocationMutation,
  useDeleteOfficeLocationMutation,
  useGetBiometricDevicesQuery,
  useSaveBiometricDeviceMutation,
  useDeleteBiometricDeviceMutation,
  useGetBiometricLogsQuery,
  useSyncBiometricDevicesMutation,
  useGetAttendanceSelfiesQuery,
  useGetAttendanceLocationsQuery,
  // Phase 3 Hook Exports
  useGetFaceQuery,
  useRegisterFaceMutation,
  useDeleteFaceMutation,
  useVerifyFaceMutation,
  useGenerateQrMutation,
  useScanQrMutation,
  useGetQrSessionsQuery,
  useGetProductivityAnalyticsQuery,
  useGetHeatmapsQuery,
  useGetAttendanceAiInsightsQuery,
  useGetPayrollSummaryQuery,
  useCalculatePayrollSummaryMutation,
  useLockPayrollPeriodMutation,
  useGetNotificationsQuery,
  useMarkNotificationsAsReadMutation,
  useGetAuditLogsQuery,
} = attendanceApi;
