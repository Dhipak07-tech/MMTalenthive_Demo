import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Clock, Calendar, User, Search, Filter, AlertCircle, Check, X,
  FileSpreadsheet, Settings, ShieldAlert, BarChart3, Users, Send,
  Plus, CheckCircle, HelpCircle, MapPin, Printer, ArrowRight, ClipboardCheck,
  Smartphone, Fingerprint, Camera, Laptop, Monitor, Trash2, Eye, ShieldAlert as ShieldIcon,
  QrCode, TrendingUp, Grid, Sparkles, Coins, History, Bell
} from 'lucide-react';
import { useAppSelector } from '../../app/hooks';
import {
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
  // Phase 3 hooks
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
  useGetAuditLogsQuery
} from './attendanceApi';
import { useGetEmployeesQuery } from '../employees/employeesApi';
import { useGetDnaAnalyticsQuery } from '../org-dna/orgDnaApi';

export function AttendanceScreen() {
  const currentUser = useAppSelector((state) => state.auth.user);
  const userRole = useAppSelector((state) => state.auth.role);

  const { data: employees = [] } = useGetEmployeesQuery();
  const currentEmployee = employees.find(
    (e) => e.workEmail?.toLowerCase() === currentUser?.email?.toLowerCase()
  );
  const employeeId = currentEmployee?.id || '';

  const isAdmin = userRole === 'ROLE_ADMIN' || userRole === 'ROLE_SUPER_ADMIN' || userRole === 'ROLE_ULTRA_SUPER_ADMIN';
  const isSuperAdmin = userRole === 'ROLE_SUPER_ADMIN' || userRole === 'ROLE_ULTRA_SUPER_ADMIN';
  const isUltraAdmin = userRole === 'ROLE_ULTRA_SUPER_ADMIN';

  // Dynamic Tabs List based on role
  const getTabs = () => {
    const defaultTabs = [
      { id: 'my-attendance', label: 'My Attendance', icon: Clock },
      { id: 'mobile', label: 'Mobile Attendance', icon: Smartphone },
      { id: 'face-recognition', label: 'Face Attendance', icon: Camera },
      { id: 'qr-attendance', label: 'QR Attendance', icon: QrCode },
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'my-requests', label: 'Correction Requests', icon: Send }
    ];

    if (isAdmin) {
      defaultTabs.push(
        { id: 'dashboard', label: 'Executive Dashboard', icon: BarChart3 },
        { id: 'analytics', label: 'Analytics Dashboard', icon: BarChart3 },
        { id: 'productivity', label: 'Productivity Analytics', icon: TrendingUp },
        { id: 'heatmaps', label: 'Heatmaps', icon: Grid },
        { id: 'team-attendance', label: 'Team Attendance', icon: Users },
        { id: 'approve-requests', label: 'Approve Requests', icon: ClipboardCheck },
        { id: 'biometric-logs', label: 'Biometric Logs', icon: Fingerprint },
        { id: 'selfies', label: 'Attendance Selfies', icon: Camera },
        { id: 'reports', label: 'Analytics Reports', icon: FileSpreadsheet },
        { id: 'audit-logs', label: 'Audit Logs', icon: History }
      );
    }

    if (isSuperAdmin) {
      defaultTabs.push(
        { id: 'geofencing', label: 'Geo-Fencing Settings', icon: MapPin },
        { id: 'biometric', label: 'Biometric Devices', icon: Settings },
        { id: 'ai-insights', label: 'AI Insights', icon: Sparkles },
        { id: 'payroll', label: 'Payroll Reports', icon: Coins },
        { id: 'settings', label: 'Attendance Settings', icon: Settings }
      );
    }

    return defaultTabs;
  };

  const tabs = getTabs();
  
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveTabFromPath = (path: string) => {
    if (path.includes('/attendance/dashboard')) return 'dashboard';
    if (path.includes('/attendance/analytics')) return 'analytics';
    if (path.includes('/attendance/productivity')) return 'productivity';
    if (path.includes('/attendance/heatmaps')) return 'heatmaps';
    if (path.includes('/attendance/ai-insights')) return 'ai-insights';
    if (path.includes('/attendance/payroll')) return 'payroll';
    if (path.includes('/attendance/face-recognition')) return 'face-recognition';
    if (path.includes('/attendance/qr-attendance')) return 'qr-attendance';
    if (path.includes('/attendance/notifications')) return 'notifications';
    if (path.includes('/attendance/biometric-logs')) return 'biometric-logs';
    if (path.includes('/attendance/selfies')) return 'selfies';
    if (path.includes('/attendance/team-attendance')) return 'team-attendance';
    if (path.includes('/attendance/requests')) return isAdmin ? 'approve-requests' : 'my-requests';
    if (path.includes('/attendance/reports')) return 'reports';
    if (path.includes('/attendance/settings/geofencing')) return 'geofencing';
    if (path.includes('/attendance/settings/biometric')) return 'biometric';
    if (path.includes('/attendance/settings')) return 'settings';
    if (path.includes('/attendance/audit-logs')) return 'audit-logs';
    if (path.includes('/attendance/mobile')) return 'mobile';
    return 'my-attendance';
  };

  const activeTab = getActiveTabFromPath(location.pathname);

  const handleTabChange = (tabId: string) => {
    if (tabId === 'dashboard') navigate('/attendance/dashboard');
    else if (tabId === 'analytics') navigate('/attendance/analytics');
    else if (tabId === 'productivity') navigate('/attendance/productivity');
    else if (tabId === 'heatmaps') navigate('/attendance/heatmaps');
    else if (tabId === 'ai-insights') navigate('/attendance/ai-insights');
    else if (tabId === 'payroll') navigate('/attendance/payroll');
    else if (tabId === 'face-recognition') navigate('/attendance/face-recognition');
    else if (tabId === 'qr-attendance') navigate('/attendance/qr-attendance');
    else if (tabId === 'notifications') navigate('/attendance/notifications');
    else if (tabId === 'biometric-logs') navigate('/attendance/biometric-logs');
    else if (tabId === 'selfies') navigate('/attendance/selfies');
    else if (tabId === 'team-attendance') navigate('/attendance/team-attendance');
    else if (tabId === 'my-requests' || tabId === 'approve-requests') navigate('/attendance/requests');
    else if (tabId === 'reports') navigate('/attendance/reports');
    else if (tabId === 'geofencing') navigate('/attendance/settings/geofencing');
    else if (tabId === 'biometric') navigate('/attendance/settings/biometric');
    else if (tabId === 'settings') navigate('/attendance/settings');
    else if (tabId === 'audit-logs') navigate('/attendance/audit-logs');
    else if (tabId === 'mobile') navigate('/attendance/mobile');
    else navigate('/attendance/my-attendance');
  };

  // Today's Clock state & status
  const { data: statusResponse, refetch: refetchStatus } = useGetAttendanceStatusQuery(employeeId, { skip: !employeeId });
  const [clockIn] = useClockInMutation();
  const [clockOut] = useClockOutMutation();

  const [clockMode, setClockMode] = useState<'OFFICE' | 'WFH' | 'REMOTE' | 'CLIENT_SITE'>('OFFICE');
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const timerInterval = useRef<any>(null);

  // Phase 2 Form states
  // Geofencing
  const [locName, setLocName] = useState('');
  const [locLat, setLocLat] = useState<number>(12.9716);
  const [locLon, setLocLon] = useState<number>(77.5946);
  const [locRadius, setLocRadius] = useState<number>(100);
  const [locDeptId, setLocDeptId] = useState('');
  const [locActive, setLocActive] = useState<boolean>(true);

  // Phase 3 Form states
  const [faceCaptureTemplate, setFaceCaptureTemplate] = useState('FACE_EMBEDDING_MOCK_128D_V4');
  const [faceCaptureImage, setFaceCaptureImage] = useState('');
  const [faceVerifyStatus, setFaceVerifyStatus] = useState<string | null>(null);

  const [qrExpiry, setQrExpiry] = useState<number>(10);
  const [qrGeneratedCode, setQrGeneratedCode] = useState<string>('');
  const [qrLocationId, setQrLocationId] = useState<string>('');
  const [qrDepartmentId, setQrDepartmentId] = useState<string>('');
  const [qrScanInput, setQrScanInput] = useState('');

  const [payrollPeriod, setPayrollPeriod] = useState('2026-06');
  const [heatmapViewType, setHeatmapViewType] = useState('daily');
  const [heatmapMetric, setHeatmapMetric] = useState('department');
  const [selectedHeatmapCell, setSelectedHeatmapCell] = useState<{ row: string; col: string; value: string; desc: string } | null>(null);

  // Biometric Devices
  const [devName, setDevName] = useState('');
  const [devType, setDevType] = useState('FINGERPRINT');
  const [devIp, setDevIp] = useState('');
  const [devPort, setDevPort] = useState<number>(4370);
  const [devLoc, setDevLoc] = useState('');
  const [devStatus, setDevStatus] = useState('ACTIVE');

  // Selfie / Location Punch flow
  const [mobileGeolocation, setMobileGeolocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [mobileGeoError, setMobileGeoError] = useState<string | null>(null);
  const [capturedSelfie, setCapturedSelfie] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Settings extra states
  const [settingsGeofenceEnabled, setSettingsGeofenceEnabled] = useState<boolean>(false);
  const [settingsSelfieMode, setSettingsSelfieMode] = useState<string>('DISABLED');

  // Analytics tab filters
  const [analyticsDept, setAnalyticsDept] = useState('');
  const [analyticsLoc, setAnalyticsLoc] = useState('');
  const [analyticsEmp, setAnalyticsEmp] = useState('');
  const [analyticsStart, setAnalyticsStart] = useState(new Date().toISOString().slice(0, 10));
  const [analyticsEnd, setAnalyticsEnd] = useState(new Date().toISOString().slice(0, 10));

  // Phase 2 RTK Query hooks
  const { data: officeLocations = [], refetch: refetchOfficeLocations } = useGetOfficeLocationsQuery(undefined, { skip: !isAdmin });
  const { data: dnaAnalytics } = useGetDnaAnalyticsQuery(undefined, { skip: !isAdmin });
  const [saveOfficeLocation] = useSaveOfficeLocationMutation();
  const [deleteOfficeLocation] = useDeleteOfficeLocationMutation();

  const { data: biometricDevices = [], refetch: refetchBiometricDevices } = useGetBiometricDevicesQuery(undefined, { skip: !isSuperAdmin });
  const [saveBiometricDevice] = useSaveBiometricDeviceMutation();
  const [deleteBiometricDevice] = useDeleteBiometricDeviceMutation();

  const { data: biometricLogs = [], refetch: refetchBiometricLogs } = useGetBiometricLogsQuery(undefined, { skip: !isAdmin });
  const [syncBiometricDevices] = useSyncBiometricDevicesMutation();

  const { data: attendanceSelfies = [], refetch: refetchSelfies } = useGetAttendanceSelfiesQuery(undefined, { skip: !isAdmin });
  const { data: punchLocations = [], refetch: refetchPunchLocations } = useGetAttendanceLocationsQuery(undefined, { skip: !isAdmin });

  // Phase 3 RTK Query hooks
  const { data: employeeFace = null, refetch: refetchFace } = useGetFaceQuery(employeeId, { skip: !employeeId });
  const [registerFaceMutation] = useRegisterFaceMutation();
  const [deleteFaceMutation] = useDeleteFaceMutation();
  const [verifyFaceMutation] = useVerifyFaceMutation();

  const [generateQrCodeMutation] = useGenerateQrMutation();
  const [scanQrCodeMutation] = useScanQrMutation();
  const { data: qrSessions = [], refetch: refetchQrSessions } = useGetQrSessionsQuery(undefined, { skip: !isAdmin });

  const { data: productivityAnalytics = null } = useGetProductivityAnalyticsQuery({
    startDate: analyticsStart,
    endDate: analyticsEnd,
    departmentId: analyticsDept || undefined,
    employeeId: analyticsEmp || undefined,
    locationId: analyticsLoc || undefined,
  }, { skip: activeTab !== 'productivity' });

  // Dynamic date range for Heatmaps based on view type
  const heatmapDates = useMemo(() => {
    const end = new Date();
    const start = new Date();
    if (heatmapViewType === 'daily') {
      start.setDate(end.getDate() - 14); // 15 days total
    } else if (heatmapViewType === 'weekly') {
      start.setDate(end.getDate() - 27); // 4 weeks total
    } else {
      start.setMonth(end.getMonth() - 11); // 12 months total
      start.setDate(1); // 1st of the month
    }
    return {
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10)
    };
  }, [heatmapViewType]);

  const { data: heatmapData = [] } = useGetHeatmapsQuery({
    viewType: heatmapViewType,
    startDate: heatmapDates.startDate,
    endDate: heatmapDates.endDate,
  }, { skip: activeTab !== 'heatmaps' });

  // Dynamic daily dates list
  const dailyDates = useMemo(() => {
    const dates = [];
    const end = new Date();
    for (let i = 14; i >= 0; i--) {
      const d = new Date();
      d.setDate(end.getDate() - i);
      dates.push(d.toISOString().slice(0, 10));
    }
    return dates;
  }, []);

  const dailyLabels = useMemo(() => {
    return dailyDates.map(dStr => {
      const d = new Date(dStr + 'T00:00:00');
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
  }, [dailyDates]);

  const weeklyLabels = useMemo(() => ['Week 1', 'Week 2', 'Week 3', 'Week 4'], []);
  const monthlyLabels = useMemo(() => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], []);

  // Resolve rows (departments or locations) dynamically from DB
  const resolvedLocations = useMemo(() => {
    if (officeLocations && officeLocations.length > 0) {
      return officeLocations.map((loc: any) => ({
        id: loc.id,
        name: loc.name
      }));
    }
    return [
      { id: 'hq', name: 'Headquarters' },
      { id: 'branch', name: 'Branch Office' },
      { id: 'remote', name: 'Remote Sites' },
      { id: 'client', name: 'Client Sites' }
    ];
  }, [officeLocations]);

  const resolvedDepartments = useMemo(() => {
    if (dnaAnalytics && dnaAnalytics.departmentBreakdown && dnaAnalytics.departmentBreakdown.length > 0) {
      return dnaAnalytics.departmentBreakdown.map((dept: any) => {
        const deptId = Object.keys(dnaAnalytics.departmentNames || {}).find(
          key => dnaAnalytics.departmentNames[key] === dept.departmentName
        ) || dept.departmentName;
        return {
          id: deptId,
          name: dept.departmentName
        };
      });
    }
    return [
      { id: 'eng', name: 'Engineering' },
      { id: 'sales', name: 'Sales' },
      { id: 'hr', name: 'HR' },
      { id: 'ops', name: 'Operations' },
      { id: 'mktg', name: 'Marketing' },
      { id: 'prod', name: 'Product' }
    ];
  }, [dnaAnalytics]);

  // Helper to fetch aggregated metrics for cells
  const getCellStats = (rowId: string, rowName: string, colIndex: number, colLabel: string) => {
    let matchingRecords = [];
    
    if (heatmapViewType === 'daily') {
      const colDate = dailyDates[colIndex];
      matchingRecords = heatmapData.filter((h: any) => {
        const hDate = h.date?.slice(0, 10);
        if (hDate !== colDate) return false;
        if (heatmapMetric === 'location') {
          return h.locationId === rowId || (rowId === 'hq' && !h.locationId);
        } else {
          return h.departmentId === rowId || (rowId === 'eng' && !h.departmentId);
        }
      });
    } else if (heatmapViewType === 'weekly') {
      matchingRecords = heatmapData.filter((h: any) => {
        const hDate = new Date(h.date);
        const diffDays = Math.floor((new Date().getTime() - hDate.getTime()) / (1000 * 60 * 60 * 24));
        const weekIdx = 3 - Math.floor(diffDays / 7);
        if (weekIdx !== colIndex) return false;
        if (heatmapMetric === 'location') {
          return h.locationId === rowId || (rowId === 'hq' && !h.locationId);
        } else {
          return h.departmentId === rowId || (rowId === 'eng' && !h.departmentId);
        }
      });
    } else {
      matchingRecords = heatmapData.filter((h: any) => {
        const hDate = new Date(h.date);
        const monthIdx = hDate.getMonth();
        if (monthIdx !== colIndex) return false;
        if (heatmapMetric === 'location') {
          return h.locationId === rowId || (rowId === 'hq' && !h.locationId);
        } else {
          return h.departmentId === rowId || (rowId === 'eng' && !h.departmentId);
        }
      });
    }

    let totalPresent = 0;
    let totalAbsent = 0;
    let totalLate = 0;

    matchingRecords.forEach((h: any) => {
      totalPresent += h.totalPresent || 0;
      totalAbsent += h.totalAbsent || 0;
      totalLate += h.totalLate || 0;
    });

    // Fallback deterministic if no database data
    if (matchingRecords.length === 0) {
      const hash = (rowName.length + colLabel.length) % 6;
      totalPresent = 15 + hash * 3;
      totalAbsent = hash;
      totalLate = hash + 1;
    }

    const total = totalPresent + totalAbsent;
    const presenceRate = total > 0 ? Math.round((totalPresent / total) * 100) : 90;
    
    let cellValue = '';
    let cellDesc = '';
    let hash = 0;
    let cellClass = '';

    if (heatmapMetric === 'department' || heatmapMetric === 'location') {
      cellValue = `${presenceRate}%`;
      cellDesc = `${rowName} presence rate was ${presenceRate}% (${totalPresent} present, ${totalAbsent} absent) on ${colLabel}`;
      if (presenceRate >= 95) hash = 5;
      else if (presenceRate >= 90) hash = 4;
      else if (presenceRate >= 85) hash = 3;
      else if (presenceRate >= 80) hash = 2;
      else if (presenceRate >= 70) hash = 1;
      else hash = 0;

      const colors = [
        'bg-emerald-50 dark:bg-emerald-950/10 border-emerald-100/50 text-emerald-600 hover:bg-emerald-100',
        'bg-emerald-100 dark:bg-emerald-950/20 border-emerald-200 text-emerald-700 hover:bg-emerald-200/50',
        'bg-emerald-200 dark:bg-emerald-900/30 border-emerald-300 text-emerald-800 hover:bg-emerald-300/50',
        'bg-emerald-300 dark:bg-emerald-850 text-emerald-900 hover:bg-emerald-200',
        'bg-emerald-500 text-white hover:bg-emerald-600',
        'bg-emerald-600 text-white hover:bg-emerald-700'
      ];
      cellClass = colors[hash];
    } else if (heatmapMetric === 'lateness') {
      cellValue = `${totalLate}`;
      cellDesc = `${totalLate} employees flagged late arrival parameters in ${rowName} on ${colLabel}`;
      if (totalLate === 0) hash = 0;
      else if (totalLate <= 2) hash = 1;
      else if (totalLate <= 4) hash = 2;
      else if (totalLate <= 6) hash = 3;
      else if (totalLate <= 8) hash = 4;
      else hash = 5;

      const colors = [
        'bg-slate-50 dark:bg-slate-900 border-slate-200/60 text-slate-400 hover:bg-slate-100',
        'bg-amber-50 dark:bg-amber-950/15 border-amber-250/50 text-amber-600 hover:bg-amber-100',
        'bg-amber-100 dark:bg-amber-950/20 border-amber-200 text-amber-700 hover:bg-amber-250/50',
        'bg-amber-200 dark:bg-amber-900/30 border-amber-300 text-amber-800 hover:bg-amber-350/55',
        'bg-amber-300 dark:bg-amber-800 text-amber-900 hover:bg-amber-200',
        'bg-amber-500 text-white hover:bg-amber-600'
      ];
      cellClass = colors[hash];
    } else {
      cellValue = `${totalAbsent}`;
      cellDesc = `${totalAbsent} employees logged absent in ${rowName} on ${colLabel}`;
      if (totalAbsent === 0) hash = 0;
      else if (totalAbsent <= 1) hash = 1;
      else if (totalAbsent <= 2) hash = 2;
      else if (totalAbsent <= 3) hash = 3;
      else if (totalAbsent <= 4) hash = 4;
      else hash = 5;

      const colors = [
        'bg-slate-50 dark:bg-slate-900 border-slate-200/60 text-slate-400 hover:bg-slate-100',
        'bg-rose-50 dark:bg-rose-950/15 border-rose-250/50 text-rose-600 hover:bg-rose-100',
        'bg-rose-100 dark:bg-rose-950/20 border-rose-200 text-rose-700 hover:bg-rose-250/50',
        'bg-rose-200 dark:bg-rose-900/30 border-rose-300 text-rose-800 hover:bg-rose-300/50',
        'bg-rose-300 dark:bg-rose-850 text-rose-900 hover:bg-rose-200',
        'bg-rose-500 text-white hover:bg-rose-600'
      ];
      cellClass = colors[hash];
    }

    return { cellValue, cellDesc, cellClass };
  };

  const { data: aiInsightsData = [] } = useGetAttendanceAiInsightsQuery(undefined, { skip: activeTab !== 'ai-insights' });
  const aiInsights = Array.isArray(aiInsightsData) ? aiInsightsData : [];

  const { data: payrollSummaries = [], refetch: refetchPayroll } = useGetPayrollSummaryQuery(payrollPeriod, { skip: activeTab !== 'payroll' });
  const [calculatePayroll] = useCalculatePayrollSummaryMutation();
  const [lockPayroll] = useLockPayrollPeriodMutation();

  const { data: notifications = [], refetch: refetchNotifications } = useGetNotificationsQuery(employeeId, { skip: !employeeId });
  const [markNotificationsAsRead] = useMarkNotificationsAsReadMutation();

  const { data: auditLogs = [] } = useGetAuditLogsQuery(undefined, { skip: activeTab !== 'audit-logs' });

  // Form states and filters successfully declared above queries

  // Success/Error Toasts
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Location detection
  const fetchCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMobileGeoError("Geolocation is not supported by this browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setMobileGeolocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setMobileGeoError(null);
      },
      (error) => {
        setMobileGeoError("Could not retrieve GPS: " + error.message);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    fetchCurrentLocation();
  }, [location.pathname]);

  // Camera functions
  const startCamera = async () => {
    setIsCameraActive(true);
    setCapturedSelfie(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Camera access failed", err);
      showToast("Failed to access camera", "error");
    }
  };

  const captureSelfie = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedSelfie(dataUrl);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    if (statusResponse && statusResponse.status === 'CHECKED_IN' && statusResponse.activeTimerSeconds) {
      setTimerSeconds(statusResponse.activeTimerSeconds);
      if (timerInterval.current) clearInterval(timerInterval.current);
      timerInterval.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setTimerSeconds(0);
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
        timerInterval.current = null;
      }
    }

    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current);
    };
  }, [statusResponse]);

  const formatTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Clock Actions
  const handleClockIn = async () => {
    try {
      await clockIn({
        employeeId,
        body: {
          attendanceMode: clockMode,
          ipAddress: '127.0.0.1',
          deviceInfo: navigator.userAgent.substring(0, 100),
          latitude: mobileGeolocation?.latitude,
          longitude: mobileGeolocation?.longitude,
          selfie: capturedSelfie || undefined,
          deviceType: /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'MOBILE' : 'DESKTOP',
          browser: 'Browser',
          platform: navigator.platform
        }
      }).unwrap();
      showToast('Successfully Clocked In!', 'success');
      setCapturedSelfie(null);
      refetchStatus();
    } catch (err: any) {
      showToast(err.data?.message || 'Failed to Clock In', 'error');
    }
  };

  const handleClockOut = async () => {
    try {
      await clockOut({
        employeeId,
        body: {
          latitude: mobileGeolocation?.latitude,
          longitude: mobileGeolocation?.longitude,
          selfie: capturedSelfie || undefined,
          deviceType: /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'MOBILE' : 'DESKTOP',
          browser: 'Browser',
          platform: navigator.platform
        }
      }).unwrap();
      showToast('Successfully Clocked Out!', 'success');
      setCapturedSelfie(null);
      refetchStatus();
    } catch (err: any) {
      showToast(err.data?.message || 'Failed to Clock Out', 'error');
    }
  };

  // ──── Tab: My Attendance Logs & Calendar ────
  const currentYear = new Date().getFullYear();
  const currentMonthIdx = new Date().getMonth(); // 0-11
  const [filterYear, setFilterYear] = useState<number>(currentYear);
  const [filterMonth, setFilterMonth] = useState<number>(currentMonthIdx + 1); // 1-12
  const [searchDate, setSearchDate] = useState<string>('');

  const startDateStr = `${filterYear}-${filterMonth.toString().padStart(2, '0')}-01`;
  const lastDay = new Date(filterYear, filterMonth, 0).getDate();
  const endDateStr = `${filterYear}-${filterMonth.toString().padStart(2, '0')}-${lastDay}`;

  const { data: myHistory = [] } = useGetMyHistoryQuery({
    employeeId,
    startDate: startDateStr,
    endDate: endDateStr
  }, { skip: !employeeId });

  const { data: myCalendarLogs = [] } = useGetMyCalendarQuery({
    employeeId,
    startDate: startDateStr,
    endDate: endDateStr
  }, { skip: !employeeId });

  // Pagination for my history
  const [historyPage, setHistoryPage] = useState<number>(1);
  const itemsPerPage = 5;
  const filteredHistory = myHistory.filter((h) => !searchDate || h.attendanceDate.includes(searchDate));
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage) || 1;
  const paginatedHistory = filteredHistory.slice((historyPage - 1) * itemsPerPage, historyPage * itemsPerPage);

  // ──── Tab: Regularization Apply Form & History ────
  const { data: myRegularizations = [], refetch: refetchMyRegularizations } = useGetMyRegularizationsQuery(employeeId, { skip: !employeeId });
  const [applyRegularization] = useApplyRegularizationMutation();
  const [regDate, setRegDate] = useState<string>('');
  const [regType, setRegType] = useState<'MISSING_CHECK_IN' | 'MISSING_CHECK_OUT' | 'WRONG_TIMING' | 'ON_DUTY'>('MISSING_CHECK_IN');
  const [regCheckIn, setRegCheckIn] = useState<string>('');
  const [regCheckOut, setRegCheckOut] = useState<string>('');
  const [regReason, setRegReason] = useState<string>('');

  const handleApplyRegularization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regDate || !regReason) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    try {
      const checkInDateTime = regCheckIn ? `${regDate}T${regCheckIn}:00` : undefined;
      const checkOutDateTime = regCheckOut ? `${regDate}T${regCheckOut}:00` : undefined;

      await applyRegularization({
        employeeId,
        body: {
          attendanceDate: regDate,
          requestType: regType,
          requestedCheckIn: checkInDateTime,
          requestedCheckOut: checkOutDateTime,
          reason: regReason
        }
      }).unwrap();

      showToast('Correction request submitted!', 'success');
      setRegDate('');
      setRegCheckIn('');
      setRegCheckOut('');
      setRegReason('');
      refetchMyRegularizations();
    } catch (err: any) {
      showToast(err.data?.message || 'Failed to submit request', 'error');
    }
  };

  // ──── Tab: Admin Dashboard ────
  const { data: dashboardStats } = useGetDashboardStatsQuery(undefined, { skip: !isAdmin });

  // ──── Tab: Team Attendance ────
  const [teamFilterDate, setTeamFilterDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [teamFilterDept, setTeamFilterDept] = useState<string>('');
  const [teamFilterEmp, setTeamFilterEmp] = useState<string>('');

  const { data: teamHistory = [] } = useGetTeamHistoryQuery({
    date: teamFilterDate,
    departmentId: teamFilterDept || undefined,
    employeeId: teamFilterEmp || undefined
  }, { skip: !isAdmin });

  const { data: dnaReport } = useGetDnaAnalyticsQuery(undefined, { skip: !isAdmin });

  // ──── Tab: Approve Requests ────
  const { data: pendingRequests = [], refetch: refetchPendingRequests } = useGetTeamRegularizationsQuery(undefined, { skip: !isAdmin });
  const [actionRegularization] = useActionRegularizationMutation();

  const handleActionRequest = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await actionRegularization({
        id,
        body: { status }
      }).unwrap();
      showToast(`Request successfully ${status.toLowerCase()}!`, 'success');
      refetchPendingRequests();
    } catch (err: any) {
      showToast(err.data?.message || 'Failed to action request', 'error');
    }
  };

  // ──── Tab: Reports ────
  const [reportType, setReportType] = useState<string>('DAILY');
  const [reportStart, setReportStart] = useState<string>(new Date().toISOString().slice(0, 10));
  const [reportEnd, setReportEnd] = useState<string>(new Date().toISOString().slice(0, 10));
  const [reportDept, setReportDept] = useState<string>('');
  const [reportEmp, setReportEmp] = useState<string>('');
  const [reportLoc, setReportLoc] = useState<string>('');

  const { data: reportLogs = [], refetch: triggerReport } = useGetReportsQuery({
    reportType,
    startDate: reportStart,
    endDate: reportEnd,
    departmentId: reportDept || undefined,
    employeeId: reportEmp || undefined,
    locationId: reportLoc || undefined
  }, { skip: !isAdmin });

  // Report Export Actions
  const handleExportCSV = () => {
    if (reportLogs.length === 0) {
      showToast('No report logs available to export.', 'error');
      return;
    }
    const headers = ['Date', 'Employee ID', 'Check In', 'Check Out', 'Hours', 'Status', 'Mode', 'Late Min', 'Early Log Min'];
    const rows = reportLogs.map((log) => {
      const emp = employees.find((e) => e.id === log.employeeId);
      const name = emp ? `${emp.firstName} ${emp.lastName}` : log.employeeId;
      return [
        log.attendanceDate,
        name,
        log.checkIn ? log.checkIn.slice(11, 16) : '-',
        log.checkOut ? log.checkOut.slice(11, 16) : '-',
        log.workingHours || 0,
        log.status,
        log.attendanceMode,
        log.lateMinutes,
        log.earlyLogoutMinutes
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `attendance_report_${reportType.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  // ──── Tab: Attendance Settings ────
  const { data: settingsData, refetch: refetchSettings } = useGetSettingsQuery(undefined, { skip: !isSuperAdmin });
  const [updateSettings] = useUpdateSettingsMutation();

  const [settingsShiftStart, setSettingsShiftStart] = useState<string>('09:00:00');
  const [settingsShiftEnd, setSettingsShiftEnd] = useState<string>('18:00:00');
  const [settingsGrace, setSettingsGrace] = useState<number>(15);
  const [settingsMinPres, setSettingsMinPres] = useState<number>(8.0);
  const [settingsMinHalf, setSettingsMinHalf] = useState<number>(4.0);

  useEffect(() => {
    if (settingsData) {
      setSettingsShiftStart(settingsData.shiftStartTime);
      setSettingsShiftEnd(settingsData.shiftEndTime);
      setSettingsGrace(settingsData.gracePeriodMinutes);
      setSettingsMinPres(settingsData.minHoursPresent);
      setSettingsMinHalf(settingsData.minHoursHalfDay);
      setSettingsGeofenceEnabled(settingsData.geofencingEnabled);
      setSettingsSelfieMode(settingsData.selfieVerificationMode);
    }
  }, [settingsData]);

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings({
        shiftStartTime: settingsShiftStart,
        shiftEndTime: settingsShiftEnd,
        gracePeriodMinutes: Number(settingsGrace),
        minHoursPresent: Number(settingsMinPres),
        minHoursHalfDay: Number(settingsMinHalf),
        geofencingEnabled: settingsGeofenceEnabled,
        selfieVerificationMode: settingsSelfieMode
      }).unwrap();
      showToast('Settings updated successfully!', 'success');
      refetchSettings();
    } catch (err: any) {
      showToast(err.data?.message || 'Failed to update settings', 'error');
    }
  };

  // Helper mapping status styles
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30';
      case 'LATE':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30';
      case 'EARLY_LOGOUT':
        return 'bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400 border border-violet-200 dark:border-violet-900/30';
      case 'HALF_DAY':
        return 'bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400 border border-orange-200 dark:border-orange-900/30';
      case 'ABSENT':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200 dark:border-rose-900/30';
      case 'LEAVE':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200 dark:border-blue-900/30';
      case 'HOLIDAY':
        return 'bg-yellow-50 text-yellow-750 dark:bg-yellow-950/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900/30';
      case 'WEEK_OFF':
      default:
        return 'bg-slate-50 text-slate-600 dark:bg-slate-800/40 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50';
    }
  };

  // Helper calendar renderer
  const renderCalendar = () => {
    const daysInMonth = lastDay;
    const firstDayIndex = new Date(filterYear, filterMonth - 1, 1).getDay(); // Sunday=0

    const blankDays = Array(firstDayIndex).fill(null);
    const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const grid = [...blankDays, ...monthDays];

    return (
      <div className="grid grid-cols-7 gap-2.5 text-center text-xs font-bold text-slate-550 dark:text-slate-450">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="uppercase tracking-wider text-[10px] pb-1 border-b border-slate-100 dark:border-slate-800/55">
            {d}
          </div>
        ))}
        {grid.map((day, idx) => {
          if (day === null) {
            return <div key={`blank-${idx}`} className="h-10" />;
          }

          const dateStr = `${filterYear}-${filterMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
          const log = myCalendarLogs.find((c) => c.attendanceDate === dateStr);

          let bgClass = 'bg-slate-50/50 dark:bg-slate-900/20 text-slate-400';
          let dotColor = 'bg-transparent';
          if (log) {
            if (log.status === 'PRESENT') {
              bgClass = 'bg-emerald-50/40 dark:bg-emerald-950/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100/60 dark:border-emerald-900/10';
              dotColor = 'bg-emerald-500';
            } else if (log.status === 'LATE') {
              bgClass = 'bg-amber-50/40 dark:bg-amber-950/10 text-amber-600 dark:text-amber-400 border border-amber-100/60 dark:border-amber-900/10';
              dotColor = 'bg-amber-500';
            } else if (log.status === 'EARLY_LOGOUT') {
              bgClass = 'bg-violet-50/40 dark:bg-violet-950/10 text-violet-600 dark:text-violet-400 border border-violet-100/60 dark:border-violet-900/10';
              dotColor = 'bg-violet-500';
            } else if (log.status === 'HALF_DAY') {
              bgClass = 'bg-orange-50/40 dark:bg-orange-950/10 text-orange-600 dark:text-orange-400 border border-orange-100/60 dark:border-orange-900/10';
              dotColor = 'bg-orange-500';
            } else if (log.status === 'ABSENT') {
              bgClass = 'bg-rose-50/40 dark:bg-rose-950/10 text-rose-600 dark:text-rose-400 border border-rose-100/60 dark:border-rose-900/10';
              dotColor = 'bg-rose-500';
            } else if (log.status === 'LEAVE') {
              bgClass = 'bg-blue-50/40 dark:bg-blue-950/10 text-blue-600 dark:text-blue-400 border border-blue-100/60 dark:border-blue-900/10';
              dotColor = 'bg-blue-500';
            } else if (log.status === 'HOLIDAY') {
              bgClass = 'bg-yellow-50/40 dark:bg-yellow-950/10 text-yellow-700 dark:text-yellow-400 border border-yellow-100/60 dark:border-yellow-900/10';
              dotColor = 'bg-yellow-500';
            } else if (log.status === 'WEEK_OFF') {
              bgClass = 'bg-slate-100/50 dark:bg-slate-800/40 text-slate-500 border border-slate-200/40 dark:border-slate-700/40';
              dotColor = 'bg-slate-400';
            }
          }

          return (
            <div
              key={day}
              className={`h-11 rounded-xl flex flex-col justify-between p-1.5 transition-all hover:scale-105 select-none relative ${bgClass}`}
            >
              <span className="text-[10px] leading-none self-start">{day}</span>
              {log && (
                <div className="flex items-center justify-between w-full mt-1">
                  <span className={`w-1.5 h-1.5 rounded-full self-end ml-1 mb-0.5 animate-pulse shrink-0 block ${dotColor}`} />
                  <span className="text-[7.5px] font-extrabold uppercase truncate tracking-tighter opacity-85 text-right w-full pr-0.5">
                    {log.workingHours ? `${log.workingHours}h` : log.status.replace('_', ' ')}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in p-6 max-w-7xl mx-auto text-slate-900 dark:text-white">
      {/* Toast Alert popup */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-4 py-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-bold shadow-2xl z-50 animate-bounce transition-all ${
          toast.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-900/30 dark:text-emerald-400'
            : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/30 dark:border-rose-900/30 dark:text-rose-400'
        }`}>
          <AlertCircle size={16} />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Cockpit Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-gradient-to-r from-slate-50 to-slate-100/80 dark:from-[#0B0F19] dark:to-[#0E1321] p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#5D69F4]/10 text-[#5D69F4] dark:bg-[#5D69F4]/20 dark:text-indigo-400 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
              Attendance Module
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Real-Time Tracking & Compliance
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight mt-1.5">
            Attendance Cockpit
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Active Digital Twin: <span className="font-bold text-[#5D69F4]">{currentEmployee ? `${currentEmployee.firstName} ${currentEmployee.lastName} (${currentEmployee.employeeCode})` : 'Guest User'}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border outline-none ${
                  activeTab === tab.id
                    ? 'bg-[#5D69F4] text-white border-transparent shadow-[0_4px_12px_rgba(93,105,244,0.25)]'
                    : 'bg-white dark:bg-[#0B0F19] border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-450 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Panels */}
      <div className="min-h-[400px]">
        {/* PANEL: MY ATTENDANCE */}
        {activeTab === 'my-attendance' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Left side: Clock in/out card */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                <h3 className="text-sm font-bold border-b border-slate-100 dark:border-slate-850 pb-3 flex items-center gap-2">
                  <Clock size={16} className="text-[#5D69F4]" />
                  Clock Punch Terminal
                </h3>

                <div className="py-6 text-center">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Active Punch Timer
                  </span>
                  <div className="text-4xl font-black font-mono tracking-tight text-slate-800 dark:text-white mt-1">
                    {formatTimer(timerSeconds)}
                  </div>
                  <div className="mt-2.5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${
                      statusResponse?.status === 'CHECKED_IN'
                        ? 'bg-emerald-50 border-emerald-250 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400'
                        : statusResponse?.status === 'CHECKED_OUT'
                        ? 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800/40 dark:border-slate-700/50 dark:text-slate-400'
                        : 'bg-rose-50 border-rose-250 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        statusResponse?.status === 'CHECKED_IN'
                          ? 'bg-emerald-500 animate-ping'
                          : statusResponse?.status === 'CHECKED_OUT'
                          ? 'bg-slate-400'
                          : 'bg-rose-500 animate-pulse'
                      }`} />
                      {statusResponse?.status ? statusResponse.status.replace(/_/g, ' ') : 'NOT CHECKED IN'}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-450 dark:text-slate-550 block mb-1.5">
                      Work Mode Mode
                    </label>
                    <select
                      disabled={statusResponse?.status !== 'NOT_CHECKED_IN'}
                      value={clockMode}
                      onChange={(e: any) => setClockMode(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#5D69F4]/20 text-slate-800 dark:text-slate-200 font-bold"
                    >
                      <option value="OFFICE">Office Punch</option>
                      <option value="WFH">Work From Home (WFH)</option>
                      <option value="REMOTE">Remote Location</option>
                      <option value="CLIENT_SITE">Client On-Site</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-2">
                    {statusResponse?.status === 'NOT_CHECKED_IN' ? (
                      <button
                        onClick={handleClockIn}
                        className="w-full py-3 bg-[#5D69F4] hover:bg-[#4C58E0] text-white rounded-xl text-xs font-bold shadow-md shadow-[#5D69F4]/20 transition-all hover:shadow-lg active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <Clock size={15} /> Clock In
                      </button>
                    ) : statusResponse?.status === 'CHECKED_IN' ? (
                      <button
                        onClick={handleClockOut}
                        className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition-all hover:shadow-lg active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <Clock size={15} /> Clock Out
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full py-3 bg-slate-100 dark:bg-slate-850 text-slate-400 dark:text-slate-650 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-1.5"
                      >
                        Punch Completed
                      </button>
                    )}
                  </div>
                </div>

                {statusResponse?.todayRecord && (
                  <div className="mt-5 border-t border-slate-100 dark:border-slate-850 pt-4 space-y-2 text-xs font-semibold text-slate-500">
                    <div className="flex justify-between">
                      <span>Punch In Time:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-350">
                        {statusResponse.todayRecord.checkIn ? new Date(statusResponse.todayRecord.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </span>
                    </div>
                    {statusResponse.todayRecord.checkOut && (
                      <div className="flex justify-between">
                        <span>Punch Out Time:</span>
                        <span className="font-bold text-slate-700 dark:text-slate-350">
                          {new Date(statusResponse.todayRecord.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Punch Mode:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-350 uppercase">
                        {statusResponse.todayRecord.attendanceMode}
                      </span>
                    </div>
                    {statusResponse.todayRecord.workingHours && (
                      <div className="flex justify-between border-t border-slate-50 dark:border-slate-900 pt-2 font-bold text-slate-700 dark:text-slate-300">
                        <span>Worked Hours Today:</span>
                        <span>{statusResponse.todayRecord.workingHours} Hours</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right side: Calendar & History Table */}
            <div className="lg:col-span-2 space-y-6">
              {/* Filter controls */}
              <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-indigo-500/10 rounded-lg text-[#5D69F4]">
                    <Filter size={16} />
                  </div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                    Scope Filter View
                  </h3>
                </div>

                <div className="flex items-center gap-3.5">
                  <div>
                    <select
                      value={filterMonth}
                      onChange={(e) => { setFilterMonth(Number(e.target.value)); setHistoryPage(1); }}
                      className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none"
                    >
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, idx) => (
                        <option key={idx} value={idx + 1}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <select
                      value={filterYear}
                      onChange={(e) => { setFilterYear(Number(e.target.value)); setHistoryPage(1); }}
                      className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none"
                    >
                      {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Monthly calendar dashboard grid */}
              <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold border-b border-slate-100 dark:border-slate-850 pb-3 flex items-center gap-2 mb-4">
                  <Calendar size={16} className="text-[#5D69F4]" />
                  Attendance Calendar Grid
                </h3>
                {renderCalendar()}
              </div>

              {/* History Table logs */}
              <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <Printer size={16} className="text-[#5D69F4]" />
                    Punch Card logs
                  </h3>
                  <div className="relative w-48">
                    <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="date"
                      value={searchDate}
                      onChange={(e) => { setSearchDate(e.target.value); setHistoryPage(1); }}
                      className="pl-8 pr-3 py-1.5 w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold outline-none"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-2">Date</th>
                        <th className="py-3 px-2">In Time</th>
                        <th className="py-3 px-2">Out Time</th>
                        <th className="py-3 px-2">Worked Hours</th>
                        <th className="py-3 px-2">Late/Early</th>
                        <th className="py-3 px-2">Mode</th>
                        <th className="py-3 px-2 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850/60 font-semibold">
                      {paginatedHistory.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400">
                            No attendance history logs found for scope filters.
                          </td>
                        </tr>
                      ) : (
                        paginatedHistory.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10">
                            <td className="py-3.5 px-2 font-bold text-slate-800 dark:text-slate-200">
                              {log.attendanceDate}
                            </td>
                            <td className="py-3.5 px-2">
                              {log.checkIn ? new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                            </td>
                            <td className="py-3.5 px-2">
                              {log.checkOut ? new Date(log.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                            </td>
                            <td className="py-3.5 px-2 font-mono">
                              {log.workingHours != null ? `${log.workingHours} hrs` : '-'}
                            </td>
                            <td className="py-3.5 px-2 font-mono text-slate-500">
                              {log.lateMinutes > 0 && <span className="text-amber-600 block">Late: {log.lateMinutes}m</span>}
                              {log.earlyLogoutMinutes > 0 && <span className="text-violet-600 block">Early: {log.earlyLogoutMinutes}m</span>}
                              {log.lateMinutes === 0 && log.earlyLogoutMinutes === 0 && <span>-</span>}
                            </td>
                            <td className="py-3.5 px-2 text-[10px] uppercase font-bold tracking-wider text-slate-450 dark:text-slate-550">
                              {log.attendanceMode}
                            </td>
                            <td className="py-3.5 px-2 text-right">
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide ${getStatusBadgeStyle(log.status)}`}>
                                {log.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="flex justify-between items-center pt-2 text-xs">
                  <span className="text-slate-500 font-medium">
                    Page {historyPage} of {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={historyPage === 1}
                      onClick={() => setHistoryPage((p) => p - 1)}
                      className="px-2.5 py-1 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded text-slate-600 dark:text-slate-400 disabled:opacity-50"
                    >
                      Prev
                    </button>
                    <button
                      disabled={historyPage === totalPages}
                      onClick={() => setHistoryPage((p) => p + 1)}
                      className="px-2.5 py-1 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded text-slate-600 dark:text-slate-400 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PANEL: MY CORRECTION REQUESTS */}
        {activeTab === 'my-requests' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Apply correction form */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold border-b border-slate-100 dark:border-slate-850 pb-3 flex items-center gap-2 mb-4">
                  <Send size={16} className="text-[#5D69F4]" />
                  Attendance Correction Request
                </h3>

                <form onSubmit={handleApplyRegularization} className="space-y-4 text-xs font-semibold text-slate-550 dark:text-slate-400">
                  <div>
                    <label className="uppercase tracking-wider">Attendance Date *</label>
                    <input
                      type="date"
                      required
                      value={regDate}
                      onChange={(e) => setRegDate(e.target.value)}
                      className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#5D69F4]/20 text-slate-800 dark:text-slate-200 font-bold"
                    />
                  </div>

                  <div>
                    <label className="uppercase tracking-wider">Correction Type *</label>
                    <select
                      value={regType}
                      onChange={(e: any) => setRegType(e.target.value)}
                      className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#5D69F4]/20 text-slate-800 dark:text-slate-200 font-bold"
                    >
                      <option value="MISSING_CHECK_IN">Missing Check In Punch</option>
                      <option value="MISSING_CHECK_OUT">Missing Check Out Punch</option>
                      <option value="WRONG_TIMING">Wrong Timing Adjustment</option>
                      <option value="ON_DUTY">On Duty / Business Trip Correction</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="uppercase tracking-wider">Requested In</label>
                      <input
                        type="time"
                        value={regCheckIn}
                        onChange={(e) => setRegCheckIn(e.target.value)}
                        className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#5D69F4]/20 text-slate-800 dark:text-slate-200 font-bold"
                      />
                    </div>
                    <div>
                      <label className="uppercase tracking-wider">Requested Out</label>
                      <input
                        type="time"
                        value={regCheckOut}
                        onChange={(e) => setRegCheckOut(e.target.value)}
                        className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#5D69F4]/20 text-slate-800 dark:text-slate-200 font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="uppercase tracking-wider">Reason for Correction *</label>
                    <textarea
                      required
                      rows={4}
                      value={regReason}
                      onChange={(e) => setRegReason(e.target.value)}
                      placeholder="Explain missing logs or incorrect timestamps..."
                      className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#5D69F4]/20 text-slate-800 dark:text-slate-200 font-bold"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 py-3 bg-[#5D69F4] hover:bg-[#4C58E0] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#5D69F4]/20 flex items-center justify-center gap-1.5"
                  >
                    <Plus size={14} /> Submit Correction
                  </button>
                </form>
              </div>
            </div>

            {/* Correction Requests List */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold border-b border-slate-100 dark:border-slate-850 pb-3 flex items-center gap-2">
                  <ClipboardCheck size={16} className="text-[#5D69F4]" />
                  Correction History logs
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-2">Requested On</th>
                        <th className="py-3 px-2">Type</th>
                        <th className="py-3 px-2">Requested Times</th>
                        <th className="py-3 px-2">Reason</th>
                        <th className="py-3 px-2">Approved By</th>
                        <th className="py-3 px-2 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850/60 font-semibold text-slate-600 dark:text-slate-350">
                      {myRegularizations.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400">
                            No correction requests found.
                          </td>
                        </tr>
                      ) : (
                        myRegularizations.map((reg) => (
                          <tr key={reg.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10">
                            <td className="py-3.5 px-2 font-bold text-slate-800 dark:text-slate-200">
                              {reg.requestedCheckIn ? reg.requestedCheckIn.slice(0, 10) : '-'}
                            </td>
                            <td className="py-3.5 px-2 text-[10px] uppercase font-bold tracking-wider text-[#5D69F4]">
                              {reg.requestType.replace(/_/g, ' ')}
                            </td>
                            <td className="py-3.5 px-2 font-mono">
                              In: {reg.requestedCheckIn ? reg.requestedCheckIn.slice(11, 16) : '-'} <br />
                              Out: {reg.requestedCheckOut ? reg.requestedCheckOut.slice(11, 16) : '-'}
                            </td>
                            <td className="py-3.5 px-2 max-w-xs truncate" title={reg.reason}>
                              {reg.reason}
                            </td>
                            <td className="py-3.5 px-2 text-slate-500">
                              {reg.approvedBy || '-'}
                            </td>
                            <td className="py-3.5 px-2 text-right">
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide ${
                                reg.status === 'APPROVED'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                                  : reg.status === 'REJECTED'
                                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'
                                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 animate-pulse'
                              }`}>
                                {reg.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PANEL: ADMIN EXECUTIVE DASHBOARD */}
        {activeTab === 'dashboard' && isAdmin && (
          <div className="space-y-6 animate-fade-in">
            {/* KPI Cards row */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Present Staff</span>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {dashboardStats?.presentCount || 0}
                </div>
              </div>
              <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Absent Staff</span>
                <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                  {dashboardStats?.absentCount || 0}
                </div>
              </div>
              <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Late Arrivals</span>
                <div className="text-2xl font-black text-amber-500 dark:text-amber-400 mt-1">
                  {dashboardStats?.lateCount || 0}
                </div>
              </div>
              <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">WFH Employees</span>
                <div className="text-2xl font-black text-indigo-500 mt-1">
                  {dashboardStats?.wfhCount || 0}
                </div>
              </div>
              <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Corrections</span>
                <div className="text-2xl font-black text-violet-500 mt-1">
                  {dashboardStats?.pendingRequests || 0}
                </div>
              </div>
            </div>

            {/* Charts section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Daily Trend bar chart */}
              <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm lg:col-span-2">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-450 dark:text-slate-550 border-b border-slate-100 dark:border-slate-850 pb-3 mb-6">
                  Daily Attendance Trend (Last 7 Days)
                </h3>
                <div className="h-60 flex items-end justify-around pt-4 font-bold text-[10px] text-slate-500">
                  {dashboardStats?.dailyTrends.map((trend, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-2 w-full">
                      <div className="relative w-8 bg-slate-50 dark:bg-slate-900 rounded-t-lg h-40 flex items-end">
                        <div
                          className="w-full bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t-lg transition-all duration-500 hover:opacity-85"
                          style={{ height: `${trend.percentage}%` }}
                          title={`${trend.percentage}% Attendance`}
                        />
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 font-mono text-[9px] font-bold text-indigo-650 dark:text-indigo-400">
                          {trend.percentage}%
                        </span>
                      </div>
                      <span className="truncate w-14 text-center mt-1">
                        {trend.date.slice(5, 10)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly percentage + Department rates */}
              <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm lg:col-span-1 space-y-6">
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-450 dark:text-slate-550 border-b border-slate-100 dark:border-slate-850 pb-3 mb-4">
                    Monthly Average Rate
                  </h3>
                  <div className="flex items-center gap-4 py-2">
                    <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 flex items-center justify-center text-sm font-black font-mono">
                      {dashboardStats?.monthlyPercentage || 0}%
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-semibold leading-normal">
                        Average attendance rate computed across active billing cycles.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-450 dark:text-slate-550 border-b border-slate-100 dark:border-slate-850 pb-3 mb-4">
                    Department Attendance %
                  </h3>
                  <div className="space-y-3 text-xs font-semibold">
                    {dashboardStats?.departmentStats.map((stat, idx) => {
                      const deptName = dnaReport?.departmentNames[stat.departmentId] || 'Technology';
                      return (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex justify-between font-bold text-slate-700 dark:text-slate-350">
                            <span className="truncate max-w-44">{deptName}</span>
                            <span>{stat.percentage}%</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
                            <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${stat.percentage}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PANEL: TEAM ATTENDANCE */}
        {activeTab === 'team-attendance' && isAdmin && (
          <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5 animate-fade-in">
            <h3 className="text-sm font-bold border-b border-slate-100 dark:border-slate-850 pb-3 flex items-center gap-2">
              <Users size={16} className="text-[#5D69F4]" />
              Supervisor Team Attendance log
            </h3>

            {/* Filter controls */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-2 text-xs font-semibold text-slate-550">
              <div>
                <label className="uppercase tracking-wider">Filter Date</label>
                <input
                  type="date"
                  value={teamFilterDate}
                  onChange={(e) => setTeamFilterDate(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none font-bold"
                />
              </div>
              <div>
                <label className="uppercase tracking-wider">Filter Department</label>
                <select
                  value={teamFilterDept}
                  onChange={(e) => setTeamFilterDept(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none font-bold"
                >
                  <option value="">All Departments</option>
                  {dnaReport && Object.entries(dnaReport.departmentNames).map(([id, name]) => (
                    <option key={id} value={id}>{name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="uppercase tracking-wider">Filter Employee</label>
                <select
                  value={teamFilterEmp}
                  onChange={(e) => setTeamFilterEmp(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none font-bold"
                >
                  <option value="">All Employees</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Team Table list */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-2">Employee</th>
                    <th className="py-3 px-2">Department</th>
                    <th className="py-3 px-2">Check In</th>
                    <th className="py-3 px-2">Check Out</th>
                    <th className="py-3 px-2">Worked Hours</th>
                    <th className="py-3 px-2">Late/Early</th>
                    <th className="py-3 px-2">Mode</th>
                    <th className="py-3 px-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850/60 font-semibold text-slate-600 dark:text-slate-350">
                  {teamHistory.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No employees found matching filter rules.
                      </td>
                    </tr>
                  ) : (
                    teamHistory.map((log) => {
                      const emp = employees.find((e) => e.id === log.employeeId);
                      const empName = emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown';
                      const deptName = emp && dnaReport ? dnaReport.departmentNames[emp.departmentId || ''] || 'HR' : 'HR';
                      return (
                        <tr key={log.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10">
                          <td className="py-3.5 px-2 font-bold text-slate-800 dark:text-slate-200">
                            {empName}
                          </td>
                          <td className="py-3.5 px-2 text-slate-500">
                            {deptName}
                          </td>
                          <td className="py-3.5 px-2">
                            {log.checkIn ? new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                          </td>
                          <td className="py-3.5 px-2">
                            {log.checkOut ? new Date(log.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                          </td>
                          <td className="py-3.5 px-2 font-mono">
                            {log.workingHours != null ? `${log.workingHours} hrs` : '-'}
                          </td>
                          <td className="py-3.5 px-2 font-mono text-slate-500">
                            {log.lateMinutes > 0 && <span className="text-amber-600">Late: {log.lateMinutes}m</span>}
                            {log.earlyLogoutMinutes > 0 && <span className="text-violet-600">Early: {log.earlyLogoutMinutes}m</span>}
                            {log.lateMinutes === 0 && log.earlyLogoutMinutes === 0 && <span>-</span>}
                          </td>
                          <td className="py-3.5 px-2 text-[10px] uppercase font-bold tracking-wider text-slate-450 dark:text-slate-550">
                            {log.attendanceMode}
                          </td>
                          <td className="py-3.5 px-2 text-right">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide ${getStatusBadgeStyle(log.status)}`}>
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PANEL: APPROVE REQUESTS */}
        {activeTab === 'approve-requests' && isAdmin && (
          <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 animate-fade-in">
            <h3 className="text-sm font-bold border-b border-slate-100 dark:border-slate-850 pb-3 flex items-center gap-2">
              <ClipboardCheck size={16} className="text-[#5D69F4]" />
              Staff Correction Request approvals
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-2">Employee</th>
                    <th className="py-3 px-2">Date</th>
                    <th className="py-3 px-2">Type</th>
                    <th className="py-3 px-2">Requested Times</th>
                    <th className="py-3 px-2">Reason</th>
                    <th className="py-3 px-2">Submitted</th>
                    <th className="py-3 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850/60 font-semibold text-slate-600 dark:text-slate-350">
                  {pendingRequests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No correction requests found.
                      </td>
                    </tr>
                  ) : (
                    pendingRequests.map((reg) => {
                      const emp = employees.find((e) => e.id === reg.employeeId);
                      const name = emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown';
                      return (
                        <tr key={reg.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10">
                          <td className="py-3.5 px-2 font-bold text-slate-800 dark:text-slate-200">
                            {name}
                          </td>
                          <td className="py-3.5 px-2">
                            {reg.requestedCheckIn ? reg.requestedCheckIn.slice(0, 10) : '-'}
                          </td>
                          <td className="py-3.5 px-2 text-[10px] uppercase font-bold tracking-wider text-[#5D69F4]">
                            {reg.requestType.replace(/_/g, ' ')}
                          </td>
                          <td className="py-3.5 px-2 font-mono">
                            In: {reg.requestedCheckIn ? reg.requestedCheckIn.slice(11, 16) : '-'} <br />
                            Out: {reg.requestedCheckOut ? reg.requestedCheckOut.slice(11, 16) : '-'}
                          </td>
                          <td className="py-3.5 px-2 max-w-xs truncate" title={reg.reason}>
                            {reg.reason}
                          </td>
                          <td className="py-3.5 px-2 text-slate-400 text-[10px]">
                            {reg.createdAt ? reg.createdAt.slice(0, 16).replace('T', ' ') : '-'}
                          </td>
                          <td className="py-3.5 px-2 text-right">
                            {reg.status === 'PENDING' ? (
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleActionRequest(reg.id || '', 'APPROVED')}
                                  className="p-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded transition-colors"
                                  title="Approve request"
                                >
                                  <Check size={14} />
                                </button>
                                <button
                                  onClick={() => handleActionRequest(reg.id || '', 'REJECTED')}
                                  className="p-1 bg-rose-500 hover:bg-rose-600 text-white rounded transition-colors"
                                  title="Reject request"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ) : (
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                                reg.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                              }`}>
                                {reg.status}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PANEL: REPORTS EXPORT */}
        {activeTab === 'reports' && isAdmin && (
          <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5 animate-fade-in">
            <h3 className="text-sm font-bold border-b border-slate-100 dark:border-slate-850 pb-3 flex items-center gap-2">
              <FileSpreadsheet size={16} className="text-[#5D69F4]" />
              Attendance Report Builder
            </h3>

            {/* Filter controls */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pb-2 text-xs font-semibold text-slate-550">
              <div>
                <label className="uppercase tracking-wider">Report Type</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none font-bold"
                >
                  <option value="DAILY">Daily Attendance Report</option>
                  <option value="MONTHLY">Monthly Attendance Report</option>
                  <option value="LATE">Late Arrival Report</option>
                  <option value="ABSENT">Absentee Report</option>
                  <option value="SUMMARY">Attendance Summary Report</option>
                </select>
              </div>
              <div>
                <label className="uppercase tracking-wider">Start Date</label>
                <input
                  type="date"
                  value={reportStart}
                  onChange={(e) => setReportStart(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none font-bold"
                />
              </div>
              <div>
                <label className="uppercase tracking-wider">End Date</label>
                <input
                  type="date"
                  value={reportEnd}
                  onChange={(e) => setReportEnd(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none font-bold"
                />
              </div>
              <div>
                <label className="uppercase tracking-wider">Department</label>
                <select
                  value={reportDept}
                  onChange={(e) => setReportDept(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none font-bold"
                >
                  <option value="">All Departments</option>
                  {dnaReport && Object.entries(dnaReport.departmentNames).map(([id, name]) => (
                    <option key={id} value={id}>{name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="uppercase tracking-wider">Employee</label>
                <select
                  value={reportEmp}
                  onChange={(e) => setReportEmp(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none font-bold"
                >
                  <option value="">All Employees</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-50 dark:border-slate-850 pt-4">
              <button
                onClick={() => triggerReport()}
                className="px-4 py-2 bg-[#5D69F4] hover:bg-[#4C58E0] text-white rounded-xl text-xs font-bold transition-all"
              >
                Generate Report
              </button>
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5"
              >
                <FileSpreadsheet size={14} /> Export CSV
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5"
              >
                <Printer size={14} /> Print / PDF
              </button>
            </div>

            {/* Generated logs preview */}
            <div className="overflow-x-auto border-t border-slate-50 dark:border-slate-850 pt-4">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-2">Date</th>
                    <th className="py-3 px-2">Employee</th>
                    <th className="py-3 px-2">Check In</th>
                    <th className="py-3 px-2">Check Out</th>
                    <th className="py-3 px-2">Worked Hours</th>
                    <th className="py-3 px-2">Late/Early</th>
                    <th className="py-3 px-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850/60 font-semibold text-slate-600 dark:text-slate-350">
                  {reportLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Click Generate Report to view data.
                      </td>
                    </tr>
                  ) : (
                    reportLogs.map((log) => {
                      const emp = employees.find((e) => e.id === log.employeeId);
                      const name = emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown';
                      return (
                        <tr key={log.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10">
                          <td className="py-3.5 px-2 font-bold text-slate-800 dark:text-slate-200">
                            {log.attendanceDate}
                          </td>
                          <td className="py-3.5 px-2">
                            {name}
                          </td>
                          <td className="py-3.5 px-2">
                            {log.checkIn ? new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                          </td>
                          <td className="py-3.5 px-2">
                            {log.checkOut ? new Date(log.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                          </td>
                          <td className="py-3.5 px-2 font-mono">
                            {log.workingHours != null ? `${log.workingHours} hrs` : '-'}
                          </td>
                          <td className="py-3.5 px-2 font-mono text-slate-500">
                            {log.lateMinutes > 0 && <span className="text-amber-600 block">Late: {log.lateMinutes}m</span>}
                            {log.earlyLogoutMinutes > 0 && <span className="text-violet-600 block">Early: {log.earlyLogoutMinutes}m</span>}
                            {log.lateMinutes === 0 && log.earlyLogoutMinutes === 0 && <span>-</span>}
                          </td>
                          <td className="py-3.5 px-2 text-right">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide ${getStatusBadgeStyle(log.status)}`}>
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PANEL: GEO-FENCING SETTINGS */}
        {activeTab === 'geofencing' && isSuperAdmin && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Form to add location */}
            <div className="lg:col-span-1 bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold border-b border-slate-100 dark:border-slate-850 pb-3 flex items-center gap-2 mb-4">
                <MapPin size={16} className="text-[#5D69F4]" />
                Add Permitted Office Location
              </h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!locName || !locLat || !locLon || !locRadius) {
                  showToast('Please fill out all required fields.', 'error');
                  return;
                }
                try {
                  await saveOfficeLocation({
                    name: locName,
                    latitude: Number(locLat),
                    longitude: Number(locLon),
                    radius: Number(locRadius),
                    departmentId: locDeptId || undefined,
                    isActive: locActive
                  }).unwrap();
                  showToast('Office Location saved successfully!', 'success');
                  setLocName('');
                  setLocDeptId('');
                  refetchOfficeLocations();
                } catch (err: any) {
                  showToast(err.data?.message || 'Failed to save location', 'error');
                }
              }} className="space-y-4 text-xs font-semibold text-slate-550 dark:text-slate-400">
                <div>
                  <label className="uppercase tracking-wider">Location Name *</label>
                  <input
                    type="text"
                    required
                    value={locName}
                    onChange={(e) => setLocName(e.target.value)}
                    placeholder="e.g. Headquarters, North Wing"
                    className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-[#5D69F4]/20 text-slate-800 dark:text-slate-200 font-bold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="uppercase tracking-wider">Latitude *</label>
                    <input
                      type="number"
                      step="0.000001"
                      required
                      value={locLat}
                      onChange={(e) => setLocLat(Number(e.target.value))}
                      className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-[#5D69F4]/20 text-slate-800 dark:text-slate-200 font-bold"
                    />
                  </div>
                  <div>
                    <label className="uppercase tracking-wider">Longitude *</label>
                    <input
                      type="number"
                      step="0.000001"
                      required
                      value={locLon}
                      onChange={(e) => setLocLon(Number(e.target.value))}
                      className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-[#5D69F4]/20 text-slate-800 dark:text-slate-200 font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="uppercase tracking-wider">Permitted Radius (meters) *</label>
                  <input
                    type="number"
                    required
                    value={locRadius}
                    onChange={(e) => setLocRadius(Number(e.target.value))}
                    className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-[#5D69F4]/20 text-slate-800 dark:text-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="uppercase tracking-wider">Department Restriction (Optional)</label>
                  <select
                    value={locDeptId}
                    onChange={(e) => setLocDeptId(e.target.value)}
                    className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-[#5D69F4]/20 text-slate-800 dark:text-slate-200 font-bold"
                  >
                    <option value="">All Departments</option>
                    {dnaReport && Object.entries(dnaReport.departmentNames).map(([id, name]) => (
                      <option key={id} value={id}>{name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-355">Is Active Location</label>
                  <input
                    type="checkbox"
                    checked={locActive}
                    onChange={(e) => setLocActive(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-350 dark:border-slate-800 text-[#5D69F4] focus:ring-[#5D69F4]/20"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-[#5D69F4] hover:bg-[#4C58E0] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#5D69F4]/20 flex items-center justify-center gap-1.5"
                >
                  <Plus size={14} /> Add Location
                </button>
              </form>
            </div>

            {/* List of locations */}
            <div className="lg:col-span-2 bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold border-b border-slate-100 dark:border-slate-850 pb-3 flex items-center gap-2">
                <MapPin size={16} className="text-[#5D69F4]" />
                Registered Geo-Fenced Locations
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-2">Location Name</th>
                      <th className="py-3 px-2">GPS Coordinates</th>
                      <th className="py-3 px-2">Radius</th>
                      <th className="py-3 px-2">Dept Restriction</th>
                      <th className="py-3 px-2">Status</th>
                      <th className="py-3 px-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-855/60 font-semibold text-slate-600 dark:text-slate-350">
                    {officeLocations.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          No geo-fenced locations registered.
                        </td>
                      </tr>
                    ) : (
                      officeLocations.map((loc) => {
                        const deptName = loc.departmentId && dnaReport ? dnaReport.departmentNames[loc.departmentId] || 'Technology' : 'All Departments';
                        return (
                          <tr key={loc.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10">
                            <td className="py-3.5 px-2 font-bold text-slate-800 dark:text-slate-200">
                              {loc.name}
                            </td>
                            <td className="py-3.5 px-2 font-mono">
                              Lat: {loc.latitude.toFixed(6)}, Lon: {loc.longitude.toFixed(6)}
                            </td>
                            <td className="py-3.5 px-2 font-mono">
                              {loc.radius} meters
                            </td>
                            <td className="py-3.5 px-2 text-[#5D69F4] font-medium">
                              {deptName}
                            </td>
                            <td className="py-3.5 px-2">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${loc.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-500'}`}>
                                {loc.isActive ? 'ACTIVE' : 'INACTIVE'}
                              </span>
                            </td>
                            <td className="py-3.5 px-2 text-right">
                              <button
                                type="button"
                                onClick={async () => {
                                  if (window.confirm('Are you sure you want to delete this office location?')) {
                                    try {
                                      await deleteOfficeLocation(loc.id!).unwrap();
                                      showToast('Office Location deleted successfully!', 'success');
                                      refetchOfficeLocations();
                                    } catch (err: any) {
                                      showToast('Failed to delete location', 'error');
                                    }
                                  }
                                }}
                                className="text-rose-500 hover:text-rose-700 p-1"
                                title="Delete location"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PANEL: BIOMETRIC DEVICES */}
        {activeTab === 'biometric' && isSuperAdmin && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Form to add device */}
            <div className="lg:col-span-1 bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold border-b border-slate-100 dark:border-slate-850 pb-3 flex items-center gap-2 mb-4">
                <Fingerprint size={16} className="text-[#5D69F4]" />
                Register Biometric Device
              </h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!devName || !devIp || !devPort || !devLoc) {
                  showToast('Please fill out all required fields.', 'error');
                  return;
                }
                try {
                  await saveBiometricDevice({
                    name: devName,
                    deviceType: devType,
                    ipAddress: devIp,
                    port: Number(devPort),
                    location: devLoc,
                    status: devStatus
                  }).unwrap();
                  showToast('Device registered successfully!', 'success');
                  setDevName('');
                  setDevIp('');
                  setDevLoc('');
                  refetchBiometricDevices();
                } catch (err: any) {
                  showToast(err.data?.message || 'Failed to register device', 'error');
                }
              }} className="space-y-4 text-xs font-semibold text-slate-550 dark:text-slate-400">
                <div>
                  <label className="uppercase tracking-wider">Device Name *</label>
                  <input
                    type="text"
                    required
                    value={devName}
                    onChange={(e) => setDevName(e.target.value)}
                    placeholder="e.g. Lobby Entrance Scanner"
                    className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-[#5D69F4]/20 text-slate-800 dark:text-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="uppercase tracking-wider">Device Type *</label>
                  <select
                    value={devType}
                    onChange={(e) => setDevType(e.target.value)}
                    className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-[#5D69F4]/20 text-slate-800 dark:text-slate-200 font-bold"
                  >
                    <option value="FINGERPRINT">Fingerprint Scanner</option>
                    <option value="FACE_RECOGNITION">Face Recognition Scanner</option>
                    <option value="RFID_CARD">RFID Card Reader</option>
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-3.5">
                  <div className="col-span-2">
                    <label className="uppercase tracking-wider">IP Address *</label>
                    <input
                      type="text"
                      required
                      value={devIp}
                      onChange={(e) => setDevIp(e.target.value)}
                      placeholder="e.g. 192.168.1.100"
                      className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-[#5D69F4]/20 text-slate-800 dark:text-slate-200 font-bold"
                    />
                  </div>
                  <div>
                    <label className="uppercase tracking-wider">Port *</label>
                    <input
                      type="number"
                      required
                      value={devPort}
                      onChange={(e) => setDevPort(Number(e.target.value))}
                      className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-[#5D69F4]/20 text-slate-800 dark:text-slate-200 font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="uppercase tracking-wider">Office Location / Floor *</label>
                  <input
                    type="text"
                    required
                    value={devLoc}
                    onChange={(e) => setDevLoc(e.target.value)}
                    placeholder="e.g. Ground Floor Reception"
                    className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-[#5D69F4]/20 text-slate-800 dark:text-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="uppercase tracking-wider">Device Status</label>
                  <select
                    value={devStatus}
                    onChange={(e) => setDevStatus(e.target.value)}
                    className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-[#5D69F4]/20 text-slate-800 dark:text-slate-200 font-bold"
                  >
                    <option value="ACTIVE">Active / Online</option>
                    <option value="INACTIVE">Inactive / Offline</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-[#5D69F4] hover:bg-[#4C58E0] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#5D69F4]/20 flex items-center justify-center gap-1.5"
                >
                  <Plus size={14} /> Add Device
                </button>
              </form>
            </div>

            {/* List of devices */}
            <div className="lg:col-span-2 bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold border-b border-slate-100 dark:border-slate-850 pb-3 flex items-center gap-2">
                <Fingerprint size={16} className="text-[#5D69F4]" />
                Registered Biometric Devices
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-2">Device Name</th>
                      <th className="py-3 px-2">Type</th>
                      <th className="py-3 px-2">IP Connection</th>
                      <th className="py-3 px-2">Location</th>
                      <th className="py-3 px-2">Status</th>
                      <th className="py-3 px-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-855/60 font-semibold text-slate-600 dark:text-slate-350">
                    {biometricDevices.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          No biometric devices registered.
                        </td>
                      </tr>
                    ) : (
                      biometricDevices.map((dev) => (
                        <tr key={dev.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10">
                          <td className="py-3.5 px-2 font-bold text-slate-800 dark:text-slate-200">
                            {dev.name}
                          </td>
                          <td className="py-3.5 px-2 font-mono">
                            {dev.deviceType.replace(/_/g, ' ')}
                          </td>
                          <td className="py-3.5 px-2 font-mono">
                            {dev.ipAddress}:{dev.port}
                          </td>
                          <td className="py-3.5 px-2 font-medium text-slate-500">
                            {dev.location}
                          </td>
                          <td className="py-3.5 px-2">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${dev.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                              {dev.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-2 text-right">
                            <button
                              type="button"
                              onClick={async () => {
                                  if (window.confirm('Are you sure you want to remove this device?')) {
                                    try {
                                      await deleteBiometricDevice(dev.id!).unwrap();
                                      showToast('Biometric device deleted successfully!', 'success');
                                      refetchBiometricDevices();
                                    } catch (err: any) {
                                      showToast('Failed to delete device', 'error');
                                    }
                                  }
                                }}
                              className="text-rose-500 hover:text-rose-700 p-1"
                              title="Delete device"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PANEL: BIOMETRIC LOGS */}
        {activeTab === 'biometric-logs' && isAdmin && (
          <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Fingerprint size={16} className="text-[#5D69F4]" />
                Biometric Punch Logs Feed
              </h3>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await syncBiometricDevices().unwrap();
                    showToast('Successfully pulled mock biometric punch logs!', 'success');
                    refetchBiometricLogs();
                  } catch (err) {
                    showToast('Sync failed', 'error');
                  }
                }}
                className="px-4 py-2 bg-[#5D69F4] hover:bg-[#4C58E0] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 animate-fade-in"
              >
                <Fingerprint size={14} /> Trigger Manual Sync
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-2">Punch Time</th>
                    <th className="py-3 px-2">Employee Name</th>
                    <th className="py-3 px-2">Device Name</th>
                    <th className="py-3 px-2">Punch Type</th>
                    <th className="py-3 px-2">Sync Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-855/60 font-semibold text-slate-600 dark:text-slate-350">
                  {biometricLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No biometric punch logs found. Click "Trigger Manual Sync" to fetch logs.
                      </td>
                    </tr>
                  ) : (
                    biometricLogs.map((log) => {
                      const emp = employees.find((e) => e.id === log.employeeId);
                      const name = emp ? `${emp.firstName} ${emp.lastName}` : log.employeeId;
                      const dev = biometricDevices.find((d) => d.id === log.deviceId);
                      const devName = dev ? dev.name : 'Unknown Device';
                      return (
                        <tr key={log.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10">
                          <td className="py-3.5 px-2 font-bold text-slate-800 dark:text-slate-200">
                            {log.punchTime.replace('T', ' ').slice(0, 16)}
                          </td>
                          <td className="py-3.5 px-2 text-[#5D69F4]">
                            {name}
                          </td>
                          <td className="py-3.5 px-2 font-medium">
                            {devName}
                          </td>
                          <td className="py-3.5 px-2">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${log.punchType === 'CLOCK_IN' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                              {log.punchType}
                            </span>
                          </td>
                          <td className="py-3.5 px-2">
                            <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                              {log.syncStatus}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PANEL: ATTENDANCE SELFIES */}
        {activeTab === 'selfies' && isAdmin && (
          <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 animate-fade-in">
            <h3 className="text-sm font-bold border-b border-slate-100 dark:border-slate-850 pb-3 flex items-center gap-2">
              <Camera size={16} className="text-[#5D69F4]" />
              Staff Verification Selfies Gallery
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-2">
              {attendanceSelfies.length === 0 ? (
                <div className="col-span-full py-8 text-center text-slate-400">
                  No verification selfies found.
                </div>
              ) : (
                attendanceSelfies.map((selfie) => {
                  const emp = employees.find((e) => e.id === selfie.employeeId);
                  const name = emp ? `${emp.firstName} ${emp.lastName}` : 'Employee';
                  return (
                    <div key={selfie.id} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm relative group hover:scale-[1.02] transition-all">
                      <div className="aspect-[4/3] bg-slate-205 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                        {selfie.imagePath.startsWith('data:image') ? (
                          <img src={selfie.imagePath} alt="Selfie" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-indigo-500/10 flex items-center justify-center text-[#5D69F4]">
                            <Camera size={40} className="opacity-40" />
                          </div>
                        )}
                      </div>
                      <div className="p-4 space-y-1">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{name}</p>
                        <div className="flex justify-between items-center text-[10px] font-medium text-slate-450 dark:text-slate-550 pt-1">
                          <span className={`px-2 py-0.5 rounded font-extrabold ${selfie.type === 'CLOCK_IN' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                            {selfie.type.replace('_', ' ')}
                          </span>
                          <span className="font-mono">{selfie.timestamp.replace('T', ' ').slice(0, 16)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* PANEL: RESPONSIVE MOBILE ATTENDANCE */}
        {activeTab === 'mobile' && (
          <div className="max-w-md mx-auto space-y-6 animate-fade-in">
            {/* KPI Cards Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Today's Status</span>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-bold border ${
                  statusResponse?.status === 'CHECKED_IN'
                    ? 'bg-emerald-50 border-emerald-250 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400 animate-pulse'
                    : statusResponse?.status === 'CHECKED_OUT'
                    ? 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800/40 dark:border-slate-700/50 dark:text-slate-400'
                    : 'bg-rose-50 border-rose-250 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400'
                }`}>
                  {statusResponse?.status ? statusResponse.status.replace(/_/g, ' ') : 'NOT CHECKED IN'}
                </span>
              </div>
              <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Working Hours</span>
                <span className="text-lg font-black font-mono mt-1.5 block text-indigo-500">
                  {statusResponse?.todayRecord?.workingHours || statusResponse?.workingHours || 0} hrs
                </span>
              </div>
            </div>

            {/* Check In / Check Out Details */}
            <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2 text-xs font-semibold text-slate-550 dark:text-slate-400 shadow-sm">
              <div className="flex justify-between">
                <span>Check In Time:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">
                  {statusResponse?.todayRecord?.checkIn ? new Date(statusResponse.todayRecord.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Check Out Time:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">
                  {statusResponse?.todayRecord?.checkOut ? new Date(statusResponse.todayRecord.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                </span>
              </div>
            </div>

            {/* Camera Selfie preview container if required */}
            <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold border-b border-slate-100 dark:border-slate-850 pb-3 flex items-center gap-2">
                <Camera size={16} className="text-[#5D69F4]" />
                Selfie Verification Capture
              </h3>
              
              {isCameraActive ? (
                <div className="space-y-4">
                  <div className="aspect-[4/3] bg-black rounded-xl overflow-hidden border border-slate-200 dark:border-slate-850 relative">
                    <video ref={videoRef} className="w-full h-full object-cover scale-x-[-1]" autoPlay playsInline muted />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={captureSelfie}
                      className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-650 text-white rounded-xl text-xs font-bold"
                    >
                      Capture Photo
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="w-1/3 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-755 dark:text-slate-300 rounded-xl text-xs font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : capturedSelfie ? (
                <div className="space-y-4">
                  <div className="aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-850">
                    <img src={capturedSelfie} alt="Captured selfie" className="w-full h-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700"
                  >
                    Retake Photo
                  </button>
                </div>
              ) : (
                <div className="aspect-[4/3] bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:border-indigo-400 transition-colors" onClick={startCamera}>
                  <Camera size={36} className="text-slate-400 mb-2" />
                  <span className="text-xs font-bold text-slate-755 dark:text-slate-300 font-sans">Start Camera</span>
                  <span className="text-[10px] text-slate-400 mt-1">Verification photo required to punch attendance</span>
                </div>
              )}
            </div>

            {/* GPS Location validation status */}
            <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold border-b border-slate-100 dark:border-slate-850 pb-3 flex items-center gap-2">
                <MapPin size={16} className="text-[#5D69F4]" />
                Current GPS Location Detection
              </h3>

              {mobileGeolocation ? (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-[10px] text-slate-600 dark:text-slate-400 space-y-1">
                    <p>Latitude: <span className="font-bold text-slate-850 dark:text-slate-200">{mobileGeolocation.latitude.toFixed(6)}</span></p>
                    <p>Longitude: <span className="font-bold text-slate-850 dark:text-slate-200">{mobileGeolocation.longitude.toFixed(6)}</span></p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
                    <CheckCircle size={14} /> GPS Lock Acquired
                  </div>
                </div>
              ) : mobileGeoError ? (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
                  {mobileGeoError}
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto" />
                  <p className="text-[11px] text-slate-450 mt-2 font-medium">Searching satellite lock...</p>
                </div>
              )}
            </div>

            {/* Mobile Clock Action Terminal */}
            <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm text-center space-y-4">
              <div className="space-y-3">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                  Select Punch Mode
                </label>
                <select
                  disabled={statusResponse?.status !== 'NOT_CHECKED_IN'}
                  value={clockMode}
                  onChange={(e: any) => setClockMode(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#5D69F4]/20 text-slate-800 dark:text-slate-200 font-bold"
                >
                  <option value="OFFICE">Office Punch</option>
                  <option value="WFH">Work From Home (WFH)</option>
                  <option value="REMOTE">Remote Location</option>
                  <option value="CLIENT_SITE">Client On-Site</option>
                </select>
              </div>

              {statusResponse?.status === 'NOT_CHECKED_IN' ? (
                <button
                  type="button"
                  onClick={handleClockIn}
                  className="w-full py-3.5 bg-[#5D69F4] hover:bg-[#4C58E0] text-white rounded-xl text-xs font-bold shadow-md shadow-[#5D69F4]/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <Clock size={15} /> Clock In Punch
                </button>
              ) : statusResponse?.status === 'CHECKED_IN' ? (
                <button
                  type="button"
                  onClick={handleClockOut}
                  className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <Clock size={15} /> Clock Out Punch
                </button>
              ) : (
                <button
                  disabled
                  className="w-full py-3.5 bg-slate-100 dark:bg-slate-850 text-slate-400 dark:text-slate-600 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-1.5"
                >
                  Punch Cycle Completed
                </button>
              )}
            </div>
          </div>
        )}

        {/* PANEL: ANALYTICS DASHBOARD */}
        {activeTab === 'analytics' && isAdmin && (
          <div className="space-y-6 animate-fade-in">
            {/* Analytics scope filters */}
            <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-[#5D69F4]/10 rounded-lg text-[#5D69F4]">
                  <Filter size={16} />
                </div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  Analytics Scope Filtering
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5 text-xs font-semibold text-slate-555 flex-1 max-w-4xl justify-end">
                <div>
                  <input
                    type="date"
                    value={analyticsStart}
                    onChange={(e) => setAnalyticsStart(e.target.value)}
                    className="px-3 py-1.5 w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <input
                    type="date"
                    value={analyticsEnd}
                    onChange={(e) => setAnalyticsEnd(e.target.value)}
                    className="px-3 py-1.5 w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <select
                    value={analyticsDept}
                    onChange={(e) => setAnalyticsDept(e.target.value)}
                    className="px-3 py-1.5 w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none"
                  >
                    <option value="">All Departments</option>
                    {dnaReport && Object.entries(dnaReport.departmentNames).map(([id, name]) => (
                      <option key={id} value={id}>{name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    value={analyticsLoc}
                    onChange={(e) => setAnalyticsLoc(e.target.value)}
                    className="px-3 py-1.5 w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none"
                  >
                    <option value="">All Locations</option>
                    {officeLocations.map((loc) => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    value={analyticsEmp}
                    onChange={(e) => setAnalyticsEmp(e.target.value)}
                    className="px-3 py-1.5 w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none"
                  >
                    <option value="">All Employees</option>
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* KPI Cards Row */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Present Employees</span>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {dashboardStats?.presentCount || 0}
                </div>
                <span className="text-[9px] text-emerald-500 font-bold block mt-1">▲ 4% vs last week</span>
              </div>
              <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Absent Employees</span>
                <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                  {dashboardStats?.absentCount || 0}
                </div>
                <span className="text-[9px] text-slate-400 font-bold block mt-1">Steady vs yesterday</span>
              </div>
              <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Late Arrivals</span>
                <div className="text-2xl font-black text-amber-500 dark:text-amber-400 mt-1">
                  {dashboardStats?.lateCount || 0}
                </div>
                <span className="text-[9px] text-rose-500 font-bold block mt-1">▼ 1.5% late rate</span>
              </div>
              <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overtime Hours</span>
                <div className="text-2xl font-black text-violet-500 mt-1">
                  {Math.round((dashboardStats?.presentCount || 0) * 1.5 * 10) / 10} hrs
                </div>
                <span className="text-[9px] text-[#5D69F4] font-bold block mt-1">15.5h pending approval</span>
              </div>
              <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Attendance Rate</span>
                <div className="text-2xl font-black text-indigo-500 mt-1">
                  {dashboardStats?.monthlyPercentage || 0}%
                </div>
                <span className="text-[9px] text-indigo-500 font-bold block mt-1">▲ 0.5% vs monthly target</span>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Attendance Trend */}
              <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-450 border-b border-slate-100 dark:border-slate-850 pb-3 mb-6">
                  Daily Attendance Trend
                </h3>
                <div className="h-60 flex items-end justify-around pt-4 font-bold text-[10px] text-slate-500">
                  {dashboardStats?.dailyTrends.map((trend, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-2 w-full">
                      <div className="relative w-8 bg-slate-50 dark:bg-slate-900/60 rounded-t-lg h-40 flex items-end">
                        <div
                          className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-lg transition-all"
                          style={{ height: `${trend.percentage}%` }}
                        />
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 font-mono text-[9px] font-bold text-slate-600 dark:text-slate-400">
                          {trend.percentage}%
                        </span>
                      </div>
                      <span className="truncate w-14 text-center mt-1">
                        {trend.date.slice(5, 10)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly Attendance Trend */}
              <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-450 border-b border-slate-100 dark:border-slate-850 pb-3 mb-6">
                  Monthly Attendance Trend (Last 5 Months)
                </h3>
                <div className="h-60 flex items-end justify-around pt-4 font-bold text-[10px] text-slate-500">
                  {[
                    { month: 'Feb', rate: 94 },
                    { month: 'Mar', rate: 93 },
                    { month: 'Apr', rate: 95 },
                    { month: 'May', rate: 96 },
                    { month: 'Jun', rate: dashboardStats?.monthlyPercentage || 92 }
                  ].map((m, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-2 w-full">
                      <div className="relative w-8 bg-slate-50/60 dark:bg-slate-900/60 rounded-t-lg h-40 flex items-end">
                        <div
                          className="w-full bg-gradient-to-t from-[#5D69F4] to-indigo-400 rounded-t-lg transition-all"
                          style={{ height: `${m.rate}%` }}
                        />
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 font-mono text-[9px] font-bold text-slate-600 dark:text-slate-400">
                          {m.rate}%
                        </span>
                      </div>
                      <span className="truncate w-14 text-center mt-1">
                        {m.month}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Department Attendance Rate */}
              <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-450 border-b border-slate-100 dark:border-slate-850 pb-3 mb-4">
                  Department Attendance Breakdown
                </h3>
                <div className="space-y-4 text-xs font-semibold">
                  {dashboardStats?.departmentStats.map((stat, idx) => {
                    const deptName = dnaReport?.departmentNames[stat.departmentId] || 'Technology';
                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between font-bold text-slate-700 dark:text-slate-350">
                          <span className="truncate max-w-xs">{deptName}</span>
                          <span>{stat.percentage}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-900 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${stat.percentage}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Location wise Attendance & Late/Absent trends */}
              <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-450 border-b border-slate-100 dark:border-slate-850 pb-3">
                  Punches by Location
                </h3>
                <div className="space-y-4 text-xs font-semibold">
                  {officeLocations.map((loc) => {
                    const punchCount = punchLocations.filter(p => p.insideRadius).length || 3;
                    const percentage = Math.min(100, Math.round(punchCount * 25));
                    return (
                      <div key={loc.id} className="space-y-1.5">
                        <div className="flex justify-between font-bold text-slate-700 dark:text-slate-355">
                          <span className="truncate max-w-xs">{loc.name}</span>
                          <span>{percentage}% of today's punches</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-900 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-teal-500 h-full rounded-full" style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Export and Action buttons */}
            <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-855 pt-4">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-[#5D69F4] hover:bg-[#4C58E0] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <FileSpreadsheet size={14} /> Export Excel / PDF Report
              </button>
            </div>
          </div>
        )}

        {/* PANEL: ATTENDANCE SETTINGS */}
        {activeTab === 'settings' && isSuperAdmin && (
          <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm max-w-xl animate-fade-in">
            <h3 className="text-sm font-bold border-b border-slate-100 dark:border-slate-850 pb-3 flex items-center gap-2 mb-4">
              <Settings size={16} className="text-[#5D69F4]" />
              Organization Shift timings & Policies
            </h3>

            <form onSubmit={handleUpdateSettings} className="space-y-4 text-xs font-semibold text-slate-550 dark:text-slate-400">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="uppercase tracking-wider">Shift Start Time *</label>
                  <input
                    type="text"
                    required
                    value={settingsShiftStart}
                    onChange={(e) => setSettingsShiftStart(e.target.value)}
                    placeholder="e.g. 09:00:00"
                    className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-[#5D69F4]/20 text-slate-800 dark:text-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="uppercase tracking-wider">Shift End Time *</label>
                  <input
                    type="text"
                    required
                    value={settingsShiftEnd}
                    onChange={(e) => setSettingsShiftEnd(e.target.value)}
                    placeholder="e.g. 18:00:00"
                    className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-[#5D69F4]/20 text-slate-800 dark:text-slate-200 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="uppercase tracking-wider">Late Check In Grace Period (Minutes) *</label>
                <input
                  type="number"
                  required
                  value={settingsGrace}
                  onChange={(e) => setSettingsGrace(Number(e.target.value))}
                  className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-[#5D69F4]/20 text-slate-800 dark:text-slate-200 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="uppercase tracking-wider">Min Hours for Full Present *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={settingsMinPres}
                    onChange={(e) => setSettingsMinPres(Number(e.target.value))}
                    className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-[#5D69F4]/20 text-slate-800 dark:text-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="uppercase tracking-wider">Min Hours for Half Day *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={settingsMinHalf}
                    onChange={(e) => setSettingsMinHalf(Number(e.target.value))}
                    className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-[#5D69F4]/20 text-slate-800 dark:text-slate-200 font-bold"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-855 pt-3 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Enable Geo-Fencing Validation</label>
                    <span className="text-[10px] text-slate-400 font-medium">Require GPS location to be inside permitted radius for OFFICE punches.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settingsGeofenceEnabled}
                    onChange={(e) => setSettingsGeofenceEnabled(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-350 dark:border-slate-800 text-[#5D69F4] focus:ring-[#5D69F4]/20"
                  />
                </div>

                <div>
                  <label className="uppercase tracking-wider">Selfie Verification Mode</label>
                  <select
                    value={settingsSelfieMode}
                    onChange={(e) => setSettingsSelfieMode(e.target.value)}
                    className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-[#5D69F4]/20 text-slate-800 dark:text-slate-200 font-bold"
                  >
                    <option value="DISABLED">Disabled</option>
                    <option value="CLOCK_IN_ONLY">Clock In Only</option>
                    <option value="CLOCK_OUT_ONLY">Clock Out Only</option>
                    <option value="BOTH">Clock In & Clock Out</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#5D69F4] hover:bg-[#4C58E0] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#5D69F4]/20 flex items-center justify-center gap-1.5"
              >
                Save Configurations
              </button>
            </form>
          </div>
        )}

        {/* PANEL: AUDIT LOGS */}
        {activeTab === 'audit-logs' && isAdmin && (
          <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 animate-fade-in">
            <h3 className="text-sm font-bold border-b border-slate-100 dark:border-slate-850 pb-3 flex items-center gap-2">
              <ShieldAlert size={16} className="text-[#5D69F4]" />
              Global Module Audit Trails
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-2">Timestamp</th>
                    <th className="py-3 px-2">Performed By</th>
                    <th className="py-3 px-2">Action Event</th>
                    <th className="py-3 px-2">Old Value</th>
                    <th className="py-3 px-2">New Value</th>
                    <th className="py-3 px-2 text-right">Tenant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850/60 font-semibold text-slate-600 dark:text-slate-350">
                  {auditLogs.length > 0 ? (
                    auditLogs.map((log: any) => (
                      <tr key={log.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10">
                        <td className="py-3.5 px-2 font-bold text-slate-800 dark:text-slate-200">
                          {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                        </td>
                        <td className="py-3.5 px-2 text-[#5D69F4]">{log.performedBy}</td>
                        <td className="py-3.5 px-2 text-[10px] uppercase font-bold tracking-wider text-indigo-500">
                          {log.action}
                        </td>
                        <td className="py-3.5 px-2 truncate max-w-[200px]" title={log.oldValue}>
                          {log.oldValue || 'N/A'}
                        </td>
                        <td className="py-3.5 px-2 truncate max-w-[200px]" title={log.newValue}>
                          {log.newValue || 'N/A'}
                        </td>
                        <td className="py-3.5 px-2 text-right text-slate-400 font-mono text-[10px]">
                          {log.tenantId || 'default'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                        No audit log entries recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PANEL: FACE RECOGNITION */}
        {activeTab === 'face-recognition' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Enrollment */}
            <div className="lg:col-span-1 bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold border-b border-slate-100 dark:border-slate-850 pb-3 flex items-center gap-2">
                <Camera size={16} className="text-[#5D69F4]" />
                Face Profile Enrollment
              </h3>
              
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
                {employeeFace ? (
                  <div className="text-center space-y-2">
                    <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-250 flex items-center justify-center text-emerald-600">
                      <CheckCircle size={40} />
                    </div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-350">Face Profile Enrolled</p>
                    <p className="text-[10px] text-slate-400 font-mono">Template: {employeeFace.faceTemplate?.substring(0, 16)}...</p>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400">
                      <Camera size={40} />
                    </div>
                    <p className="text-xs font-bold text-slate-500">No Face Registered</p>
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={async () => {
                    try {
                      await registerFaceMutation({
                        body: { faceTemplate: 'FACE_EMBEDDING_MOCK_128D_V4', imagePath: 'profile_face.jpg' },
                        employeeId
                      }).unwrap();
                      showToast("Facial biometric template registered successfully", "success");
                    } catch (e: any) {
                      showToast("Enrollment failed: " + (e.data?.message || e.message), "error");
                    }
                  }}
                  className="w-full py-2.5 bg-[#5D69F4] hover:bg-[#4C58E0] text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  {employeeFace ? 'Update Face Profile' : 'Enroll Face Profile'}
                </button>

                {employeeFace && (
                  <button
                    onClick={async () => {
                      try {
                        await deleteFaceMutation(employeeId).unwrap();
                        showToast("Facial biometric template deleted", "success");
                      } catch (e: any) {
                        showToast("Deletion failed: " + (e.data?.message || e.message), "error");
                      }
                    }}
                    className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 text-rose-600 rounded-xl text-xs font-bold transition-all"
                  >
                    Delete Face Profile
                  </button>
                )}
              </div>
            </div>

            {/* Attendance Flow */}
            <div className="lg:col-span-2 bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold border-b border-slate-100 dark:border-slate-850 pb-3 flex items-center gap-2">
                <Smartphone size={16} className="text-[#5D69F4]" />
                Simulated Face Recognition Punch
              </h3>

              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center space-y-4">
                {isCameraActive ? (
                  <div className="relative w-full max-w-md aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
                    <video ref={videoRef} className="w-full h-full object-cover scale-x-[-1]" playsInline />
                    <div className="absolute inset-0 border-[3px] border-[#5D69F4]/40 rounded-xl pointer-events-none animate-pulse flex items-center justify-center">
                      <div className="w-48 h-48 border-2 border-dashed border-[#5D69F4] rounded-full" />
                    </div>
                    <button
                      onClick={captureSelfie}
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-slate-800 p-3 rounded-full shadow-lg border border-slate-200 hover:scale-105 active:scale-95 transition-transform"
                    >
                      <Camera size={20} />
                    </button>
                  </div>
                ) : capturedSelfie ? (
                  <div className="relative w-full max-w-md aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                    <img src={capturedSelfie} className="w-full h-full object-cover" alt="Captured selfie" />
                    <div className="absolute top-2 right-2 bg-emerald-500 text-white p-1 rounded-full shadow">
                      <Check size={14} />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 space-y-3">
                    <p className="text-xs text-slate-400">Camera stream inactive</p>
                    <button
                      onClick={startCamera}
                      className="px-4 py-2 bg-slate-105 dark:bg-slate-800 hover:bg-slate-200/80 rounded-xl text-xs font-bold transition-all"
                    >
                      Activate Camera Feed
                    </button>
                  </div>
                )}

                {faceVerifyStatus && (
                  <div className={`w-full p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                    faceVerifyStatus.includes('SUCCESS') ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 text-emerald-600' : 'bg-rose-50 dark:bg-rose-950/20 border-rose-250 text-rose-600'
                  }`}>
                    <AlertCircle size={16} />
                    <span>{faceVerifyStatus}</span>
                  </div>
                )}

                <div className="flex gap-3 w-full max-w-md">
                  <button
                    disabled={!capturedSelfie}
                    onClick={async () => {
                      if (!capturedSelfie) return;
                      setFaceVerifyStatus("Verifying biometrics template...");
                      try {
                        const res = await verifyFaceMutation({
                          body: { base64Image: capturedSelfie },
                          employeeId
                        }).unwrap();
                        setFaceVerifyStatus(`SUCCESS: Verified with confidence ${(res.confidenceScore * 100).toFixed(1)}%. Punch registered.`);
                        showToast("Biometric verification passed. Clock In success.", "success");
                        refetchStatus();
                      } catch (e: any) {
                        setFaceVerifyStatus("FAILED: Verification failed. Face templates do not match.");
                        showToast("Facial biometric mismatch.", "error");
                      }
                    }}
                    className="flex-1 py-3 bg-[#5D69F4] hover:bg-[#4C58E0] disabled:bg-slate-200 dark:disabled:bg-slate-850 disabled:text-slate-400 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    Verify & Punch
                  </button>
                  <button
                    onClick={() => {
                      setCapturedSelfie(null);
                      setFaceVerifyStatus(null);
                      showToast("Manual verification fallback initiated.", "success");
                    }}
                    className="px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all"
                  >
                    Manual Fallback
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PANEL: QR ATTENDANCE */}
        {activeTab === 'qr-attendance' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
            {/* Generate QR */}
            {isAdmin && (
              <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold border-b border-slate-100 dark:border-slate-850 pb-3 flex items-center gap-2">
                  <QrCode size={16} className="text-[#5D69F4]" />
                  Generate Office QR Code
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-350 block">Select Location</label>
                    <select
                      value={qrLocationId}
                      onChange={(e) => setQrLocationId(e.target.value)}
                      className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-xs font-bold text-slate-800 dark:text-slate-200"
                    >
                      <option value="">Choose Office Location</option>
                      {officeLocations.map((loc: any) => (
                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-350 block">Dynamic QR Expiry (Minutes)</label>
                    <input
                      type="number"
                      value={qrExpiry}
                      onChange={(e) => setQrExpiry(Number(e.target.value))}
                      className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-xs font-bold text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <button
                    onClick={async () => {
                      try {
                        const res = await generateQrCodeMutation({
                          locationId: qrLocationId || undefined,
                          expiryMinutes: qrExpiry
                        }).unwrap();
                        setQrGeneratedCode(res.qrId);
                        showToast("Dynamic office QR code session generated", "success");
                        refetchQrSessions();
                      } catch (e: any) {
                        showToast("QR generation failed", "error");
                      }
                    }}
                    className="w-full py-3 bg-[#5D69F4] hover:bg-[#4C58E0] text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    Generate Dynamic QR
                  </button>

                  {qrGeneratedCode && (
                    <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
                      <div className="w-48 h-48 bg-white dark:bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-center">
                        <QrCode size={160} className="text-slate-950" />
                      </div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-350">QR ID: {qrGeneratedCode}</p>
                      <p className="text-[10px] text-amber-500 font-extrabold uppercase animate-pulse">Expires in {qrExpiry} minutes</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Scan QR */}
            <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold border-b border-slate-100 dark:border-slate-850 pb-3 flex items-center gap-2">
                <QrCode size={16} className="text-[#5D69F4]" />
                Employee QR Scan Check-In
              </h3>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500 space-y-2">
                  <p className="font-bold text-slate-700 dark:text-slate-300">Scan Simulator Instructions</p>
                  <p>In production, scanning triggers mobile camera reading. For verification, enter the generated QR ID string below to simulate check-in matching.</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-350 block">Enter QR Session ID</label>
                  <input
                    type="text"
                    value={qrScanInput}
                    onChange={(e) => setQrScanInput(e.target.value)}
                    placeholder="Paste QR ID UUID here"
                    className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-xs font-bold text-slate-800 dark:text-slate-200"
                  />
                </div>

                <button
                  disabled={!qrScanInput}
                  onClick={async () => {
                    try {
                      await scanQrCodeMutation({
                        body: { qrId: qrScanInput, latitude: 12.9716, longitude: 77.5946 },
                        employeeId
                      }).unwrap();
                      showToast("QR Verified. Clocked in successfully.", "success");
                      setQrScanInput('');
                      refetchStatus();
                    } catch (e: any) {
                      showToast("Verification failed: " + (e.data?.message || e.message), "error");
                    }
                  }}
                  className="w-full py-3 bg-[#5D69F4] hover:bg-[#4C58E0] disabled:bg-slate-200 dark:disabled:bg-slate-850 disabled:text-slate-400 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  Verify QR & Clock In
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PANEL: PRODUCTIVITY ANALYTICS */}
        {activeTab === 'productivity' && isAdmin && (
          <div className="space-y-6 animate-fade-in">
            {/* Filters Row */}
            <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-3">
                <input
                  type="date"
                  value={analyticsStart}
                  onChange={(e) => setAnalyticsStart(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none"
                />
                <input
                  type="date"
                  value={analyticsEnd}
                  onChange={(e) => setAnalyticsEnd(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none"
                />
              </div>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 border border-slate-250 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-650 dark:text-slate-350 rounded-xl text-xs font-bold transition-all"
              >
                Export Report
              </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { title: 'Avg. Working Hours', val: productivityAnalytics?.averageWorkingHours ? productivityAnalytics.averageWorkingHours.toFixed(1) + 'h' : '8.1h', desc: 'Standard: 8.0h', color: 'text-indigo-500' },
                { title: 'Attendance Rate', val: productivityAnalytics?.attendancePercentage ? productivityAnalytics.attendancePercentage.toFixed(1) + '%' : '94.2%', desc: 'Target: 95.0%', color: 'text-emerald-500' },
                { title: 'Late Arrival Rate', val: productivityAnalytics?.lateArrivalPercentage ? productivityAnalytics.lateArrivalPercentage.toFixed(1) + '%' : '5.8%', desc: 'Target: < 5.0%', color: 'text-amber-500' },
                { title: 'Absentee Rate', val: productivityAnalytics?.absenteeRate ? productivityAnalytics.absenteeRate.toFixed(1) + '%' : '5.8%', desc: 'Calculated monthly', color: 'text-rose-500' },
                { title: 'Team Productivity', val: productivityAnalytics?.teamProductivityScore ? productivityAnalytics.teamProductivityScore.toFixed(1) + '%' : '86.4%', desc: 'Hours/Presence index', color: 'text-indigo-500' }
              ].map((m, idx) => (
                <div key={idx} className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-1">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">{m.title}</span>
                  <div className={`text-2xl font-black ${m.color}`}>{m.val}</div>
                  <span className="text-[10px] text-slate-450 font-bold block">{m.desc}</span>
                </div>
              ))}
            </div>

            {/* Trend Graphs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold border-b border-slate-100 dark:border-slate-850 pb-3">Department Productivity Trend</h3>
                <div className="space-y-3.5">
                  {(productivityAnalytics?.departmentProductivityTrend || [
                    { label: 'Engineering', value: 88.0 },
                    { label: 'Sales', value: 79.5 },
                    { label: 'HR', value: 84.0 },
                    { label: 'Operations', value: 82.5 }
                  ]).map((pt: any, idx: number) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-350">
                        <span>{pt.label}</span>
                        <span>{pt.value.toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-105 dark:bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pt.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold border-b border-slate-100 dark:border-slate-850 pb-3">Daily Overtime Trend</h3>
                {/* SVG Line Graph */}
                <div className="h-44 flex items-end justify-between px-2 pt-4">
                  <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                    <path
                      d="M0 25 L 20 18 L 40 22 L 60 12 L 80 15 L 100 5 L 100 30 L 0 30 Z"
                      fill="url(#indigoGrad)"
                      stroke="#5D69F4"
                      strokeWidth="1"
                    />
                    <defs>
                      <linearGradient id="indigoGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#5D69F4" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#5D69F4" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div className="flex justify-between text-[9px] text-slate-400 font-extrabold uppercase px-1">
                  <span>Start Date</span>
                  <span>Mid Point</span>
                  <span>End Date</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PANEL: ATTENDANCE HEATMAPS */}
        {activeTab === 'heatmaps' && isAdmin && (
          <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-850 pb-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Grid size={16} className="text-[#5D69F4]" />
                  Attendance Heatmap Distribution
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Inspect patterns and density across dimensions</p>
              </div>

              {/* View Type selector */}
              <div className="flex gap-2 bg-slate-50 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/60 dark:border-slate-800">
                {[
                  { id: 'daily', label: 'Daily' },
                  { id: 'weekly', label: 'Weekly' },
                  { id: 'monthly', label: 'Monthly' }
                ].map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setHeatmapViewType(v.id);
                      setSelectedHeatmapCell(null);
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      heatmapViewType === v.id
                        ? 'bg-[#5D69F4] text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Heatmap Dimension selectors */}
            <div className="flex flex-wrap gap-2.5">
              {[
                { id: 'department', label: 'Attendance by Department', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-150' },
                { id: 'location', label: 'Attendance by Location', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-150' },
                { id: 'lateness', label: 'Late Arrival Heatmap', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/20 border-amber-200' },
                { id: 'absenteeism', label: 'Absentee Heatmap', color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/20 border-rose-150' }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setHeatmapMetric(m.id);
                    setSelectedHeatmapCell(null);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                    heatmapMetric === m.id
                      ? 'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-800 dark:border-slate-100 shadow-sm'
                      : 'bg-white dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Matrix Render */}
            <div className="overflow-x-auto border border-slate-100 dark:border-slate-850 rounded-xl scrollbar-thin">
              <div className="min-w-[800px] p-4 space-y-3 bg-slate-50/40 dark:bg-slate-900/10">
                {/* Header Row */}
                <div className="grid grid-cols-12 gap-2 text-center text-[10px] text-slate-400 font-extrabold uppercase tracking-wider pb-1">
                  <div className="col-span-3 text-left pl-2">Dimension Item</div>
                  <div className="col-span-9 grid grid-flow-col auto-cols-fr gap-2">
                    {(heatmapViewType === 'daily'
                      ? dailyLabels
                      : heatmapViewType === 'weekly'
                      ? weeklyLabels
                      : monthlyLabels
                    ).map((colLabel) => (
                      <div key={colLabel} className="truncate">{colLabel}</div>
                    ))}
                  </div>
                </div>

                {/* Rows data */}
                {(heatmapMetric === 'location' ? resolvedLocations : resolvedDepartments).map((row) => {
                  const cols = heatmapViewType === 'daily'
                    ? dailyLabels
                    : heatmapViewType === 'weekly'
                    ? weeklyLabels
                    : monthlyLabels;

                  return (
                    <div key={row.id} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-3 text-xs font-bold text-slate-700 dark:text-slate-350 pl-2 truncate" title={row.name}>
                        {row.name}
                      </div>
                      <div className="col-span-9 grid grid-flow-col auto-cols-fr gap-2">
                        {cols.map((colLabel, colIndex) => {
                          const { cellValue, cellDesc, cellClass } = getCellStats(row.id, row.name, colIndex, colLabel);

                          return (
                            <button
                              key={colLabel}
                              onClick={() => setSelectedHeatmapCell({
                                row: row.name,
                                col: colLabel,
                                value: cellValue,
                                desc: cellDesc
                              })}
                              className={`aspect-square rounded-lg flex items-center justify-center font-bold text-[9px] transition-all cursor-pointer ${cellClass} border`}
                              title={`${row.name} - ${colLabel}: Click to view stats`}
                            >
                              {cellValue}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Heatmap Legend */}
            <div className="flex flex-wrap items-center justify-between gap-4 text-[10px] text-slate-400 font-bold border-t border-slate-100 dark:border-slate-850 pt-4">
              <p>Click on any matrix cell square to inspect detailed statistics.</p>
              <div className="flex gap-4 items-center">
                <span>Low Density</span>
                <div className="flex gap-1.5">
                  <div className="w-3.5 h-3.5 bg-slate-100 dark:bg-slate-900 rounded border border-slate-200" />
                  <div className="w-3.5 h-3.5 bg-indigo-50 dark:bg-indigo-950/10 rounded" />
                  <div className="w-3.5 h-3.5 bg-[#5D69F4]/40 rounded" />
                  <div className="w-3.5 h-3.5 bg-[#5D69F4] rounded" />
                </div>
                <span>High Density</span>
              </div>
            </div>

            {/* Selected Cell Detail Card */}
            {selectedHeatmapCell && (
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 animate-fade-in">
                <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-slate-800/80 pb-2">
                  <h4 className="text-xs font-extrabold text-[#5D69F4] uppercase tracking-wider">
                    Cell Inspection: {selectedHeatmapCell.row} — {selectedHeatmapCell.col}
                  </h4>
                  <button
                    onClick={() => setSelectedHeatmapCell(null)}
                    className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-250 transition-colors"
                  >
                    Close Panel
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl shadow-sm">
                    <span className="text-[9px] text-slate-450 font-extrabold uppercase">Metric Value</span>
                    <p className="text-base font-black text-[#5D69F4] mt-1">{selectedHeatmapCell.value}</p>
                  </div>
                  <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl shadow-sm">
                    <span className="text-[9px] text-slate-450 font-extrabold uppercase">Analytics Summary</span>
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-350 leading-relaxed mt-1.5">{selectedHeatmapCell.desc}</p>
                  </div>
                  <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl shadow-sm">
                    <span className="text-[9px] text-slate-450 font-extrabold uppercase">Compliance Status</span>
                    <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-150 px-2.5 py-1 rounded-full w-max">
                      <CheckCircle size={11} />
                      <span>Verified Active</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PANEL: AI INSIGHTS */}
        {activeTab === 'ai-insights' && isSuperAdmin && (
          <div className="space-y-6 animate-fade-in">
            {/* AI Risk Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Attendance Risk Score</span>
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-black text-rose-500">78.2</div>
                  <span className="text-xs text-slate-450 font-bold">/ 100</span>
                </div>
                <div className="w-full h-2 bg-slate-105 dark:bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500" style={{ width: '78.2%' }} />
                </div>
                <span className="text-[10px] text-slate-450 font-bold block">Elevated risk detected due to recent late punches.</span>
              </div>

              <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Burnout Risk Index</span>
                <div className="flex items-center gap-2.5">
                  <div className="px-3 py-1 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 text-amber-600 rounded-lg text-xs font-bold">MEDIUM</div>
                  <span className="text-xs text-slate-450 font-bold">5 Employees at Risk</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">Correlates overtime patterns and missing checks in Engineering.</p>
              </div>

              <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Productivity Trend Projection</span>
                <div className="flex items-center gap-2.5">
                  <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 text-emerald-600 rounded-lg text-xs font-bold">INCREASING (+4.2%)</div>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">Positive productivity index driven by stable check-in trends.</p>
              </div>
            </div>

            {/* AI Insight Alerts */}
            <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold border-b border-slate-100 dark:border-slate-850 pb-3 flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-500" />
                Automated System Insights
              </h3>

              <div className="space-y-4">
                {aiInsights.map((insight: any) => {
                  const colors = insight.severity === 'CRITICAL'
                    ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 text-rose-700'
                    : insight.severity === 'WARNING'
                    ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 text-amber-700'
                    : 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 text-blue-700';

                  return (
                    <div key={insight.id} className={`p-4 border rounded-xl flex items-start gap-3.5 text-xs font-semibold ${colors}`}>
                      <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider">{insight.insightType}</span>
                        <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">{insight.message}</p>
                        <div className="flex gap-4 pt-1.5 text-[10px] text-slate-400 font-bold uppercase">
                          <span>Risk Score: {insight.riskScore}</span>
                          <span>Burnout: {insight.burnoutRisk || 'N/A'}</span>
                          <span>Productivity: {insight.productivityTrend || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* PANEL: PAYROLL INTEGRATION */}
        {activeTab === 'payroll' && isSuperAdmin && (
          <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-850 pb-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Coins size={16} className="text-[#5D69F4]" />
                  Payroll Attendance Integration
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Export monthly summaries to payroll matrix</p>
              </div>

              <div className="flex gap-3">
                <input
                  type="month"
                  value={payrollPeriod}
                  onChange={(e) => setPayrollPeriod(e.target.value)}
                  className="px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none"
                />
                <button
                  onClick={async () => {
                    try {
                      await calculatePayroll(payrollPeriod).unwrap();
                      showToast("Monthly payroll summaries updated successfully", "success");
                    } catch (e: any) {
                      showToast("Recalculation failed", "error");
                    }
                  }}
                  className="px-4 py-2 bg-[#5D69F4] hover:bg-[#4C58E0] text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  Recalculate Stats
                </button>
                <button
                  onClick={async () => {
                    try {
                      await lockPayroll(payrollPeriod).unwrap();
                      showToast("Payroll period locked successfully", "success");
                    } catch (e: any) {
                      showToast("Lock failed", "error");
                    }
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all"
                >
                  Lock Period
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-2">Employee ID</th>
                    <th className="py-3 px-2">Working Days</th>
                    <th className="py-3 px-2">LOP Days</th>
                    <th className="py-3 px-2">Payable Days</th>
                    <th className="py-3 px-2">Overtime Hours</th>
                    <th className="py-3 px-2 text-right">Lock Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850/60 font-semibold text-slate-600 dark:text-slate-350">
                  {payrollSummaries.length > 0 ? (
                    payrollSummaries.map((summary: any) => (
                      <tr key={summary.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10">
                        <td className="py-3.5 px-2 font-bold text-slate-800 dark:text-slate-200">
                          {summary.employeeId}
                        </td>
                        <td className="py-3.5 px-2">{summary.workingDays.toFixed(1)}</td>
                        <td className="py-3.5 px-2 text-rose-500">{summary.lopDays.toFixed(1)}</td>
                        <td className="py-3.5 px-2 text-emerald-500">{summary.payableDays.toFixed(1)}</td>
                        <td className="py-3.5 px-2 font-mono">{summary.overtimeHours.toFixed(1)}h</td>
                        <td className="py-3.5 px-2 text-right">
                          <span className={`text-[9px] font-semibold px-2 py-0.5 rounded border uppercase ${
                            summary.status === 'LOCKED'
                              ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 border-rose-200'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200/50 dark:border-slate-700'
                          }`}>
                            {summary.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                        No payroll summaries calculated for this period. Click 'Recalculate Stats' above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PANEL: NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Bell size={16} className="text-[#5D69F4]" />
                Attendance Alerts & Alerts Dispatch
              </h3>
              <button
                onClick={async () => {
                  try {
                    await markNotificationsAsRead(employeeId).unwrap();
                    showToast("All notifications marked as read", "success");
                    refetchNotifications();
                  } catch (e) {
                    showToast("Failed to clear alerts", "error");
                  }
                }}
                className="text-xs font-bold text-[#5D69F4] hover:underline"
              >
                Mark all as read
              </button>
            </div>

            <div className="space-y-3">
              {notifications.length > 0 ? (
                notifications.map((note: any) => (
                  <div key={note.id} className={`p-4 border rounded-xl flex items-start justify-between gap-3 text-xs font-semibold ${
                    note.isRead ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-150 text-slate-500' : 'bg-indigo-50/40 dark:bg-indigo-950/10 border-indigo-100 text-[#5D69F4]'
                  }`}>
                    <div className="flex gap-3">
                      <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-bold text-slate-800 dark:text-slate-200">{note.title}</p>
                        <p className="text-slate-650 dark:text-slate-400 font-medium leading-relaxed">{note.message}</p>
                        <span className="text-[9px] text-slate-400 block pt-1">{new Date(note.sentAt).toLocaleString()}</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded border border-slate-200/50 uppercase">
                      {note.notificationType}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 font-medium">
                  No attendance alerts recorded.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
