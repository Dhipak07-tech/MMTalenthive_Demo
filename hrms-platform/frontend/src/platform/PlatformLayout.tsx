import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import {
  LayoutDashboard, Users, Calendar, Award, Building2, Shield, FileText,
  Bell, Settings, ChevronLeft, ChevronRight, ChevronDown, Search, Moon, Sun,
  BarChart3, LogOut, Command, CreditCard,
  GitPullRequest, User, AlertCircle, ClipboardCheck
} from 'lucide-react';
import { useTheme } from '../app/ThemeContext';
import clsx from 'clsx';

interface NavItem {
  name: string;
  icon: any;
  path: string;
  minRole?: string;
}

interface NavSection {
  section: string;
  items: NavItem[];
}

type NavEntry = NavItem | NavSection;

const getNavigationForRole = (role: string): NavEntry[] => {
  switch (role) {
    case 'ROLE_ULTRA_SUPER_ADMIN':
      return [
        { name: 'Platform Dashboard', icon: LayoutDashboard, path: '/platform/dashboard' },
        {
          section: 'PLATFORM MANAGEMENT',
          items: [
            { name: 'Organizations', icon: Building2, path: '/org-dna' },
            { name: 'Subscriptions', icon: CreditCard, path: '/subscriptions' },
            { name: 'Global Analytics', icon: BarChart3, path: '/analytics' },
            { name: 'RBAC Settings', icon: Shield, path: '/rbac' },
            { name: 'Settings', icon: Settings, path: '/settings' },
          ]
        }
      ];
    case 'ROLE_SUPER_ADMIN':
      return [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        {
          section: 'EMPLOYEE MANAGEMENT',
          items: [
            { name: 'Employee Directory', icon: Users, path: '/employees' },
            { name: 'Organization DNA', icon: Building2, path: '/org-dna' },
            { name: 'Onboarding', icon: GitPullRequest, path: '/onboarding' },
          ]
        },
        {
          section: 'WORKFORCE OPS',
          items: [
            { name: 'Leave Management', icon: Calendar, path: '/leave' },
            { name: 'My Approvals', icon: ClipboardCheck, path: '/approvals' },
            { name: 'Recognition', icon: Award, path: '/recognition' },
            { name: 'Analytics', icon: BarChart3, path: '/analytics' },
          ]
        }
      ];
    case 'ROLE_ADMIN':
      return [
        {
          section: 'EMPLOYEE MANAGEMENT',
          items: [
            { name: 'Employee Directory', icon: Users, path: '/employees' },
            { name: 'Onboarding', icon: GitPullRequest, path: '/onboarding' },
          ]
        },
        {
          section: 'WORKFORCE OPS',
          items: [
            { name: 'Leave Management', icon: Calendar, path: '/leave' },
            { name: 'My Approvals', icon: ClipboardCheck, path: '/approvals' },
            { name: 'Recognition', icon: Award, path: '/recognition' },
            { name: 'Documents', icon: FileText, path: '/documents' },
          ]
        }
      ];
    case 'ROLE_EMPLOYEE':
    default:
      return [
        { name: 'My Profile', icon: User, path: '/my-profile' },
        {
          section: 'MY WORKSPACE',
          items: [
            { name: 'My Leave', icon: Calendar, path: '/leave' },
            { name: 'My Documents', icon: FileText, path: '/documents' },
            { name: 'Recognition', icon: Award, path: '/recognition' },
          ]
        }
      ];
  }
};

export function PlatformLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const darkMode = theme === 'dark';
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Inactivity Timer State
  const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 mins
  const WARNING_LIMIT = 13 * 60 * 1000;    // 13 mins
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(120); // 2 mins in seconds

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  // Fallback default details if not fully set
  let displayName = 'Guest User';
  let initials = 'GU';
  let displayRoleName = 'Guest';

  if (user) {
    if (user.role) {
      displayRoleName = user.role.replace('ROLE_', '').replace(/_/g, ' ');
    }
    displayName = user.name || user.email || 'User';

    // Initials calc
    const parts = displayName.split(' ');
    let calcInitials = '';
    if (parts[0]) calcInitials += parts[0][0];
    if (parts[1]) calcInitials += parts[1][0];
    initials = (calcInitials || displayName.slice(0, 2) || 'US').toUpperCase();
  }

  // Session activity listeners
  useEffect(() => {
    if (!user) return;

    const resetTimer = () => {
      setLastActivity(Date.now());
      setShowSessionWarning(false);
    };

    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'mousedown', 'touchstart'];
    activityEvents.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    const interval = setInterval(() => {
      const now = Date.now();
      const inactiveDuration = now - lastActivity;

      if (inactiveDuration >= INACTIVITY_LIMIT) {
        dispatch(logout());
        resetTimer();
        navigate('/login');
      } else if (inactiveDuration >= WARNING_LIMIT) {
        setShowSessionWarning(true);
        const secLeft = Math.max(0, Math.floor((INACTIVITY_LIMIT - inactiveDuration) / 1000));
        setRemainingTime(secLeft);
      } else {
        setShowSessionWarning(false);
      }
    }, 1000);

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
      clearInterval(interval);
    };
  }, [lastActivity, user, dispatch, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navItems = getNavigationForRole(user?.role || 'ROLE_EMPLOYEE');

  return (
    <div className={clsx('flex h-screen overflow-hidden font-sans antialiased selection:bg-indigo-500/10 selection:text-indigo-650', darkMode && 'dark')}>
      {/* ── Sidebar ─────────────────── */}
      <aside
        className={clsx(
          'flex flex-col bg-white dark:bg-[#0B0F19] text-slate-700 dark:text-slate-300 transition-all duration-300 ease-in-out relative border-r border-slate-200 dark:border-slate-800',
          collapsed ? 'w-[72px]' : 'w-[260px]'
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center h-16 px-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F19] shrink-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-[0_2px_8px_rgba(99,102,241,0.25)]">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
              <path d="M12 2C6.477 2 2 6.023 2 11c0 2.279 1.026 4.35 2.766 5.86L3.13 20.91A1 1 0 004.1 22c.168 0 .335-.042.489-.126l4.246-2.324A10.873 10.873 0 0012 20c5.523 0 10-4.023 10-9s-4.477-9-10-9z" />
            </svg>
          </div>
          {!collapsed && (
            <div className="ml-3 animate-fade-in">
              <h1 className="text-sm font-extrabold tracking-tight text-slate-800 dark:text-white flex items-center gap-1.5 leading-none">
                ManageMyOpz
              </h1>
              <p className="text-[10px] text-slate-400 font-bold mt-1.5">HR Management</p>
            </div>
          )}
        </div>

        {/* Navigation Area */}
        <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-850 scrollbar-track-transparent">
          {navItems.map((entry, idx) => {
            if ('path' in entry) {
              const item = entry as NavItem;
              const Icon = item.icon;
              return (
                <NavLink
                  key={idx}
                  to={item.path}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 group relative',
                      isActive
                        ? 'bg-[#5D69F4] text-white shadow-[0_4px_12px_rgba(93,105,244,0.25)]'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-100'
                    )
                  }
                >
                  <Icon className="w-4.5 h-4.5 shrink-0 transition-transform group-hover:scale-105" />
                  {!collapsed && <span className="truncate">{item.name}</span>}
                  {collapsed && (
                    <div className="absolute left-16 bg-[#0B0F19] text-white text-xs px-2.5 py-1 rounded shadow-xl border border-slate-800 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                      {item.name}
                    </div>
                  )}
                </NavLink>
              );
            }

            const section = entry as NavSection;
            return (
              <div key={idx} className="pt-3 first:pt-0">
                {!collapsed ? (
                  <p className="px-3 pb-2 text-[10px] font-extrabold tracking-wider text-slate-450 dark:text-slate-550 uppercase">
                    {section.section}
                  </p>
                ) : (
                  <div className="border-t border-slate-200 dark:border-slate-800 my-2 mx-2" />
                )}
                <div className="space-y-1">
                  {section.items.map((subItem, subIdx) => {
                    const SubIcon = subItem.icon;
                    return (
                      <NavLink
                        key={subIdx}
                        to={subItem.path}
                        className={({ isActive }) =>
                          clsx(
                            'flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 group relative',
                            isActive
                              ? 'bg-[#5D69F4] text-white shadow-[0_4px_12px_rgba(93,105,244,0.25)]'
                              : 'text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-100'
                          )
                        }
                      >
                        <SubIcon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" />
                        {!collapsed && <span className="truncate">{subItem.name}</span>}
                        {collapsed && (
                          <div className="absolute left-16 bg-[#0B0F19] text-white text-xs px-2.5 py-1 rounded shadow-xl border border-slate-800 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                            {subItem.name}
                          </div>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Sidebar Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-[#1E293B] border border-slate-250 dark:border-slate-700 rounded-full flex items-center justify-center text-slate-500 hover:bg-indigo-600 hover:text-white transition-all z-20 shadow-md active:scale-90"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        {/* User Profile Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-[#0E1321]/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-teal-500 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm">
              {initials}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0 animate-fade-in">
                <p className="text-xs font-bold truncate text-slate-700 dark:text-slate-200">{displayName}</p>
                <p className="text-[9px] text-slate-400 dark:text-slate-550 font-bold uppercase tracking-wider mt-0.5">{displayRoleName}</p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={handleLogout}
                title="Log Out"
                className="text-slate-405 hover:text-rose-500 transition-colors p-1.5 rounded hover:bg-slate-200/40 dark:hover:bg-slate-850"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ── Workspace ─────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#F3F7FA] dark:bg-[#07090e] text-slate-900 dark:text-slate-100">

        {/* Global Search Header */}
        <header className="h-16 bg-white dark:bg-[#0B0F19] border-b border-slate-200/80 dark:border-slate-850 flex items-center justify-between px-6 shrink-0 relative z-30 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
          {/* Global Search */}
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 rounded-full px-4 py-1.5 flex-1 group hover:border-slate-350 dark:hover:border-slate-700 transition-all">
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-550" />
              <input
                type="text"
                placeholder="Search employees, departments, reports..."
                className="bg-transparent border-none outline-none text-xs text-slate-750 dark:text-slate-200 placeholder-slate-400 w-full font-medium"
              />
              <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700 rounded text-[9px] font-mono text-slate-400">
                <Command className="w-2.5 h-2.5" />K
              </kbd>
            </div>
          </div>

          {/* Quick Actions & Profile */}
          <div className="flex items-center gap-4">

            <button className="relative p-1.5 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850/60 border border-slate-200/40 dark:border-transparent rounded-lg transition-colors">
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border border-white dark:border-[#0B0F19]" />
            </button>

            <button
              onClick={toggleTheme}
              className="p-1.5 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850/60 border border-slate-200/40 dark:border-transparent rounded-lg transition-colors"
            >
              {darkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-800 mx-1" />

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 p-1 hover:bg-slate-50 dark:hover:bg-slate-850/60 border border-slate-200/45 dark:border-transparent rounded-xl transition-all"
              >
                <div className="w-7.5 h-7.5 rounded-lg bg-gradient-to-tr from-indigo-500 to-teal-500 flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0">
                  {initials}
                </div>
                <div className="hidden lg:block text-left pr-1">
                  <p className="text-[11px] font-extrabold text-slate-800 dark:text-white leading-none">Acme Corp</p>
                  <p className="text-[9px] text-slate-400 font-bold mt-1">Enterprise Plan</p>
                </div>
                <ChevronDown size={12} className="text-slate-400 hidden md:block" />
              </button>

              {profileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#0B0F19] border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xl py-1.5 z-50 animate-fade-in text-xs text-slate-700 dark:text-slate-200">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80">
                      <p className="font-bold text-slate-900 dark:text-white">{displayName}</p>
                      <p className="text-[10px] text-slate-455 truncate mt-0.5">{user?.email}</p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 rounded border border-indigo-100 dark:border-indigo-900/40 uppercase">
                          {displayRoleName}
                        </span>
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded border border-slate-200/50 dark:border-slate-700">
                          {user?.tenantId || 'SYSTEM'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        navigate('/my-profile');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-850/60 transition-colors flex items-center gap-2"
                    >
                      <User size={14} className="text-slate-400" />
                      My Profile
                    </button>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        navigate('/settings');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-850/60 transition-colors flex items-center gap-2"
                    >
                      <Settings size={14} className="text-slate-400" />
                      Settings
                    </button>
                    <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-850/60 transition-colors text-rose-650 dark:text-rose-400 font-bold flex items-center gap-2"
                    >
                      <LogOut size={14} />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>



        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* ── Inactivity Warning Modal ─────────────────── */}
      {showSessionWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4 space-y-4 animate-fade-in">
            <div className="flex items-center gap-3 text-amber-500">
              <span className="p-2 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-100 dark:border-amber-900/50">
                <AlertCircle size={20} />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Session Expiring Soon</h3>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Security Compliance</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Your session has been inactive. To protect corporate multi-tenant data, you will be logged out automatically in{' '}
              <span className="font-mono font-bold text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded">
                {Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, '0')}
              </span>.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setLastActivity(Date.now());
                  setShowSessionWarning(false);
                }}
                className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-all shadow-sm active:scale-95"
              >
                Keep Logged In
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2 px-3 bg-slate-105 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 text-xs font-semibold rounded-lg transition-all active:scale-95"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
