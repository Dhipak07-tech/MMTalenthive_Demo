import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Building2, Shield, Calendar, ArrowUpRight,
  MapPin, Clock, Briefcase, ChevronRight, Activity, AlertCircle
} from 'lucide-react';
import { useGetEmployeesQuery } from '../employees/employeesApi';
import { useGetOrganizationsQuery } from '../org-dna/orgDnaApi';
import { useGetUsersQuery } from '../security/securityApi';
import { useAppSelector } from '../../app/hooks';

export function Dashboard() {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const [time, setTime] = useState(new Date());

  // RTK Query endpoints
  const { data: rawEmployees, isLoading: loadingEmployees } = useGetEmployeesQuery();
  const { data: organizations, isLoading: loadingOrgs } = useGetOrganizationsQuery();
  const { data: users, isLoading: loadingUsers } = useGetUsersQuery();

  const employees = (rawEmployees || []).map((emp: any) => ({
    ...emp,
    displayName: emp.displayName || `${emp.firstName} ${emp.lastName}`,
    department: emp.department || emp.departmentId || 'Frontend Engineering',
    location: emp.location || emp.locationId || 'San Francisco, CA',
    designation: emp.designation || emp.designationId || 'Senior Staff Engineer'
  }));

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hrs = time.getHours();
    if (hrs < 12) return 'Good Morning';
    if (hrs < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatDate = () => {
    return time.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = () => {
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Dynamic Data Calculation
  const totalEmployeesCount = employees?.length || 0;
  const activeTwinsCount = employees?.filter(e => e.employmentStatus === 'ACTIVE').length || 0;
  const totalOrgsCount = organizations?.length || 0;
  const totalUsersCount = users?.length || 0;

  // Department Distribution
  const departmentCounts: Record<string, number> = {};
  employees?.forEach(emp => {
    const dept = emp.department || 'Unassigned';
    departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
  });
  const departmentStats = Object.entries(departmentCounts).map(([name, count]) => ({
    name,
    count,
    percentage: totalEmployeesCount > 0 ? Math.round((count / totalEmployeesCount) * 100) : 0
  })).sort((a, b) => b.count - a.count);

  // Location Distribution
  const locationCounts: Record<string, number> = {};
  employees?.forEach(emp => {
    const loc = emp.location || 'Remote';
    locationCounts[loc] = (locationCounts[loc] || 0) + 1;
  });
  const locationStats = Object.entries(locationCounts).map(([name, count]) => ({
    name,
    count,
    percentage: totalEmployeesCount > 0 ? Math.round((count / totalEmployeesCount) * 100) : 0
  })).sort((a, b) => b.count - a.count);

  // Employment Status counts
  const statusCounts = {
    ACTIVE: employees?.filter(e => e.employmentStatus === 'ACTIVE').length || 0,
    ON_PROBATION: employees?.filter(e => e.employmentStatus === 'ON_PROBATION').length || 0,
    ON_NOTICE: employees?.filter(e => e.employmentStatus === 'ON_NOTICE').length || 0,
    TERMINATED: employees?.filter(e => e.employmentStatus === 'TERMINATED').length || 0
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto animate-fade-in">

      {/* Upper Dashboard Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0B0F19] p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            {getGreeting()}, {user?.name || 'Administrator'}! 👋
          </h1>
          <p className="text-xs text-slate-450 mt-1 font-medium">
            Here is a platform-wide operational overview of the HR Operating System.
          </p>
        </div>
        <div className="flex items-center gap-3 text-right">
          <Calendar className="w-5 h-5 text-indigo-500 shrink-0" />
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{formatDate()}</p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{formatTime()}</p>
          </div>
        </div>
      </div>

      {/* KPI Metrics Dashboard Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Metric 1 */}
        <div className="bg-white dark:bg-[#0B0F19] border border-slate-200/80 dark:border-slate-850 rounded-xl p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all group relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block">Total Headcount</span>
              {loadingEmployees ? (
                <div className="h-8 w-16 bg-slate-100 dark:bg-slate-800 rounded animate-pulse mt-2" />
              ) : (
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1.5">{totalEmployeesCount}</p>
              )}
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[10px] text-slate-450 font-semibold mt-3 flex items-center gap-1.5">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> Live
            </span>
            <span>Digital Twin instances</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-[#0B0F19] border border-slate-200/80 dark:border-slate-850 rounded-xl p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all group relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block">Active Twins</span>
              {loadingEmployees ? (
                <div className="h-8 w-16 bg-slate-100 dark:bg-slate-800 rounded animate-pulse mt-2" />
              ) : (
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1.5">{activeTwinsCount}</p>
              )}
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
          </div>
          <div className="text-[10px] text-slate-450 font-semibold mt-3">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              {totalEmployeesCount > 0 ? Math.round((activeTwinsCount / totalEmployeesCount) * 100) : 0}%
            </span>{' '}
            active adoption rate
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-[#0B0F19] border border-slate-200/80 dark:border-slate-850 rounded-xl p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all group relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block">Total DNA Nodes</span>
              {loadingOrgs ? (
                <div className="h-8 w-16 bg-slate-100 dark:bg-slate-800 rounded animate-pulse mt-2" />
              ) : (
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1.5">{totalOrgsCount}</p>
              )}
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[10px] text-slate-450 font-semibold mt-3">
            Registered organization structures
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white dark:bg-[#0B0F19] border border-slate-200/80 dark:border-slate-850 rounded-xl p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all group relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block">Security Users</span>
              {loadingUsers ? (
                <div className="h-8 w-16 bg-slate-100 dark:bg-slate-800 rounded animate-pulse mt-2" />
              ) : (
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1.5">{totalUsersCount}</p>
              )}
            </div>
            <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/40 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[10px] text-slate-450 font-semibold mt-3">
            User credentials managed
          </div>
        </div>
      </div>

      {/* Main Analytics Breakdown Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Side: Department & Location DNA */}
        <div className="lg:col-span-2 space-y-6">

          {/* Department Headcount Breakdown */}
          <div className="bg-white dark:bg-[#0B0F19] border border-slate-200/80 dark:border-slate-850 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-500" />
              Departmental Headcount Breakdown
            </h3>

            {loadingEmployees ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-8 bg-slate-50 dark:bg-slate-900 rounded animate-pulse" />
                ))}
              </div>
            ) : departmentStats.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-450 font-medium border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                No departmental data recorded yet.
              </div>
            ) : (
              <div className="space-y-4">
                {departmentStats.map((dept, idx) => (
                  <div key={idx} className="space-y-1 text-xs">
                    <div className="flex justify-between items-center font-semibold text-slate-700 dark:text-slate-350">
                      <span>{dept.name}</span>
                      <span>{dept.count} ({dept.percentage}%)</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${dept.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Location Distribution */}
          <div className="bg-white dark:bg-[#0B0F19] border border-slate-200/80 dark:border-slate-850 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-500" />
              Geographic Workplaces DNA
            </h3>

            {loadingEmployees ? (
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="h-8 bg-slate-50 dark:bg-slate-900 rounded animate-pulse" />
                ))}
              </div>
            ) : locationStats.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-450 font-medium border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                No geographic distribution recorded.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {locationStats.map((loc, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-105 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{loc.name}</span>
                    </div>
                    <span className="text-xs font-extrabold text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200/50 dark:border-slate-700">
                      {loc.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Employment status & Activity feed */}
        <div className="space-y-6">

          {/* Employment status */}
          <div className="bg-white dark:bg-[#0B0F19] border border-slate-200/80 dark:border-slate-850 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-4">
              Employment Status DNA
            </h3>

            {loadingEmployees ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-6 bg-slate-50 dark:bg-slate-900 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3.5 text-xs">
                {[
                  { label: 'Active Status', count: statusCounts.ACTIVE, color: 'bg-emerald-500' },
                  { label: 'On Probation', count: statusCounts.ON_PROBATION, color: 'bg-amber-500' },
                  { label: 'On Notice', count: statusCounts.ON_NOTICE, color: 'bg-purple-500' },
                  { label: 'Terminated', count: statusCounts.TERMINATED, color: 'bg-rose-500' }
                ].map((status, idx) => {
                  const pct = totalEmployeesCount > 0 ? Math.round((status.count / totalEmployeesCount) * 100) : 0;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-center font-semibold text-slate-650 dark:text-slate-350">
                        <span className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${status.color}`} />
                          {status.label}
                        </span>
                        <span>{status.count} ({pct}%)</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                        <div className={`h-full ${status.color}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Activity Feed / Registered Accounts */}
          <div className="bg-white dark:bg-[#0B0F19] border border-slate-200/80 dark:border-slate-850 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              Registered Accounts
            </h3>

            {loadingUsers ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-10 bg-slate-50 dark:bg-slate-900 rounded animate-pulse" />
                ))}
              </div>
            ) : !users || users.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-450 font-medium border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                No user credentials found.
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[200px] overflow-y-auto pr-1">
                {users.slice(0, 5).map((u, idx) => (
                  <div key={idx} className="flex gap-2.5 items-start p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/60 border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-colors">
                    <div className="w-7 h-7 rounded bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                        {u.username ? u.username.substring(0, 2).toUpperCase() : 'US'}
                      </span>
                    </div>
                    <div className="text-[11px] min-w-0">
                      <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{u.username}</p>
                      <p className="text-slate-450 truncate">{u.email}</p>
                      <div className="flex gap-1.5 mt-1">
                        {u.roles?.map((r, rIdx) => (
                          <span key={rIdx} className="text-[8px] px-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded font-semibold uppercase">
                            {r.code.replace('ROLE_', '')}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modern Directory / Onboarded Twins preview */}
      <div className="bg-white dark:bg-[#0B0F19] border border-slate-200/80 dark:border-slate-850 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Onboarded Employee Twins</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Previewing the latest onboarding records from the registry.</p>
          </div>
          <button
            onClick={() => navigate('/employees')}
            className="flex items-center gap-1.5 text-xs text-indigo-650 dark:text-indigo-400 font-bold hover:underline self-start sm:self-auto"
          >
            Manage Directory <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/70 dark:border-slate-800/80 text-slate-450 font-bold">
                <th className="pb-3 pr-4 font-semibold">Twin Code</th>
                <th className="pb-3 px-4 font-semibold">Full Name</th>
                <th className="pb-3 px-4 font-semibold">Department</th>
                <th className="pb-3 px-4 font-semibold">Location</th>
                <th className="pb-3 px-4 font-semibold">Status</th>
                <th className="pb-3 pl-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {loadingEmployees ? (
                [1, 2, 3].map(i => (
                  <tr key={i}>
                    <td colSpan={6} className="py-4">
                      <div className="h-5 bg-slate-50 dark:bg-slate-900 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : !employees || employees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center font-medium text-slate-450">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="w-6 h-6 text-slate-350" />
                      <span>No Employee Digital Twins registered in the directory.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                employees.slice(0, 5).map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                    <td className="py-3.5 pr-4 font-mono font-bold text-indigo-650 dark:text-indigo-400">
                      {emp.employeeCode}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                      {emp.displayName || `${emp.firstName} ${emp.lastName}`}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-350 font-medium">
                      {emp.department || 'Unassigned'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-450">
                      {emp.location || 'Remote'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${emp.employmentStatus === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                        }`}>
                        {emp.employmentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 pl-4 text-right">
                      <button
                        onClick={() => navigate('/employees')}
                        className="text-indigo-600 dark:text-indigo-450 font-bold hover:underline"
                      >
                        View Twin
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
  );
}
