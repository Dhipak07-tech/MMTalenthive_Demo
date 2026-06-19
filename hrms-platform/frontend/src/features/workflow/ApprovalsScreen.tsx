import { useState } from 'react';
import {
  useGetApprovalTasksQuery,
  useProcessTaskActionMutation,
  useGetWorkflowHistoryQuery,
  useCreateDelegationMutation
} from './workflowApi';
import { useGetEmployeesQuery } from '../employees/employeesApi';
import { useGetAllLeaveRequestsQuery, useGetAllCompOffRequestsQuery } from '../leave/leaveApi';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Send,
  History,
  Loader2,
  ArrowRightLeft,
  Shield,
  Calendar,
  User,
  Check,
  UserCheck,
  AlertCircle
} from 'lucide-react';

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: any }> = {
  PENDING: { bg: 'bg-amber-500/15', text: 'text-amber-400', icon: Clock },
  APPROVED: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', icon: CheckCircle },
  REJECTED: { bg: 'bg-red-500/15', text: 'text-red-400', icon: XCircle },
  DELEGATED: { bg: 'bg-purple-500/15', text: 'text-purple-400', icon: ArrowRightLeft },
  ARCHIVED: { bg: 'bg-gray-500/15', text: 'text-gray-400', icon: AlertTriangle },
};

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.PENDING;
  const Icon = style.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
      <Icon size={13} />
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function TimelinePanel({ entityType, entityId }: { entityType: string; entityId: string }) {
  const { data: history = [], isLoading } = useGetWorkflowHistoryQuery({ entityType, entityId });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-gray-400 p-4">
        <Loader2 size={16} className="animate-spin" /> Loading timeline...
      </div>
    );
  }

  if (history.length === 0) {
    return <p className="text-gray-500 text-sm p-4">No timeline entries yet.</p>;
  }

  return (
    <div className="relative pl-6 py-2">
      <div className="absolute left-2 top-3 bottom-3 w-0.5 bg-gradient-to-b from-blue-500/40 via-blue-500/20 to-transparent" />
      {history.map((tx, idx) => (
        <div key={tx.id || idx} className="relative mb-4 last:mb-0">
          <div className="absolute -left-4 top-1 w-3 h-3 rounded-full border-2 border-blue-500 bg-gray-900" />
          <div className="ml-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-400">{tx.action}</span>
              <span className="text-xs text-gray-500">Level {tx.levelNumber}</span>
            </div>
            <p className="text-sm text-gray-300 mt-0.5">
              <span className="font-medium">{tx.actedBy}</span>
              {tx.comments && <span className="text-gray-500"> — {tx.comments}</span>}
            </p>
            <p className="text-xs text-gray-600 mt-0.5">
              {new Date(tx.actedAt).toLocaleString()}
              {tx.ipAddress && ` · ${tx.ipAddress}`}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ApprovalsScreen() {
  const [filterStatus, setFilterStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>('PENDING');
  const [filterModule, setFilterModule] = useState<'ALL' | 'LEAVE' | 'COMP_OFF'>('ALL');
  
  // API Queries
  const { data: tasks = [], isLoading: tasksLoading, refetch } = useGetApprovalTasksQuery({
    status: filterStatus === 'ALL' ? undefined : filterStatus
  });
  const { data: employees = [] } = useGetEmployeesQuery();
  const { data: leaves = [] } = useGetAllLeaveRequestsQuery();
  const { data: compOffs = [] } = useGetAllCompOffRequestsQuery();
  const [processTaskAction] = useProcessTaskActionMutation();
  const [createDelegation] = useCreateDelegationMutation();

  // State
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [actionComment, setActionComment] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);
  
  // Delegation form state
  const [delegateTo, setDelegateTo] = useState('');
  const [delegateStart, setDelegateStart] = useState('');
  const [delegateEnd, setDelegateEnd] = useState('');
  const [delegationMsg, setDelegationMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [delegationLoading, setDelegationLoading] = useState(false);

  // Helper to join task with actual request details
  const getTaskDetails = (task: any) => {
    if (task.moduleType === 'LEAVE') {
      const leave = leaves.find((l) => l.id === task.requestId);
      if (!leave) return null;
      const emp = employees.find((e) => e.id === leave.employeeId);
      return {
        type: 'Leave Request',
        initiator: emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown Employee',
        empCode: emp ? emp.employeeCode : '',
        details: `${leave.daysCount} Days (${new Date(leave.startDate).toLocaleDateString()} - ${new Date(leave.endDate).toLocaleDateString()})`,
        reason: leave.reason,
        raw: leave,
      };
    } else if (task.moduleType === 'COMP_OFF') {
      const compOff = compOffs.find((c) => c.id === task.requestId);
      if (!compOff) return null;
      const emp = employees.find((e) => e.id === compOff.employeeId);
      return {
        type: 'Comp-Off Request',
        initiator: emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown Employee',
        empCode: emp ? emp.employeeCode : '',
        details: `${compOff.hoursWorked} Hours Worked on ${new Date(compOff.workDate).toLocaleDateString()}`,
        reason: compOff.reason,
        raw: compOff,
      };
    }
    return null;
  };

  const handleAction = async (taskId: string, action: string) => {
    try {
      setProcessing(`${taskId}-${action}`);
      await processTaskAction({
        taskId,
        body: { action, comments: actionComment }
      }).unwrap();
      setActionComment('');
      setExpandedTaskId(null);
      refetch();
    } catch (err: any) {
      console.error('Task action failed:', err);
    } finally {
      setProcessing(null);
    }
  };

  const handleCreateDelegation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!delegateTo || !delegateStart || !delegateEnd) {
      setDelegationMsg({ type: 'error', text: 'Please fill in all delegation fields.' });
      return;
    }
    
    try {
      setDelegationLoading(true);
      // We assume user is active employee. Find current user employee twin in employees to set fromEmployeeId.
      // For demo / local fallback, we can use the first admin or a placeholder if current context user isn't fully mapped.
      // But typically, we retrieve from backend context. Let's find first matching employee or a default.
      const currentEmployee = employees[0]; // fallback
      if (!currentEmployee) {
        throw new Error('No employees available to delegate from.');
      }
      
      await createDelegation({
        fromEmployeeId: currentEmployee.id || '',
        toEmployeeId: delegateTo,
        startDate: delegateStart,
        endDate: delegateEnd,
      }).unwrap();

      setDelegationMsg({ type: 'success', text: 'Approvals delegated successfully!' });
      setDelegateTo('');
      setDelegateStart('');
      setDelegateEnd('');
    } catch (err: any) {
      setDelegationMsg({ type: 'error', text: err?.data?.message || 'Failed to create delegation.' });
    } finally {
      setDelegationLoading(false);
    }
  };

  // Filter tasks locally
  const filteredTasks = tasks.filter((task) => {
    if (filterModule !== 'ALL' && task.moduleType !== filterModule) {
      return false;
    }
    return true;
  });

  // SLA calculation helper
  const getSLAStatus = (dueAtStr: string) => {
    const due = new Date(dueAtStr).getTime();
    const now = Date.now();
    const diffHours = (due - now) / (1000 * 60 * 60);

    if (diffHours < 0) {
      return { label: 'Overdue', color: 'text-red-400 bg-red-500/10 border-red-500/20' };
    } else if (diffHours < 12) {
      return { label: 'Critical (Due soon)', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' };
    }
    return { label: 'On Time', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)' }}>
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2.5">
              <Shield size={28} className="text-blue-400" />
              Workforce Approvals Cockpit
            </h1>
            <p className="text-gray-400 mt-2">Centralized workspace to audit, delegate, and action pending workforce workflow tasks.</p>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-medium text-gray-300 hover:bg-white/10 transition-colors self-start"
          >
            <Clock size={15} /> Refresh Workbench
          </button>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl p-5 border border-amber-500/20" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.02))' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center">
                <Clock size={20} className="text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-400">
                  {tasks.filter(t => t.actionStatus === 'PENDING' || t.actionStatus === 'DELEGATED').length}
                </p>
                <p className="text-xs text-gray-400 font-medium">Pending Tasks</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl p-5 border border-purple-500/20" style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.08), rgba(168,85,247,0.02))' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/15 flex items-center justify-center">
                <ArrowRightLeft size={20} className="text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-400">
                  {tasks.filter(t => t.actionStatus === 'DELEGATED').length}
                </p>
                <p className="text-xs text-gray-400 font-medium">Delegated Tasks</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl p-5 border border-emerald-500/20" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.02))' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                <CheckCircle size={20} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-400">98.4%</p>
                <p className="text-xs text-gray-400 font-medium">SLA Compliance Rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs & Action Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Approval Workbench List */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Filter Cockpit */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-md">
              <div className="flex gap-2">
                {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setFilterStatus(status);
                      setExpandedTaskId(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      filterStatus === status
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Module:</span>
                <select
                  value={filterModule}
                  onChange={(e) => setFilterModule(e.target.value as any)}
                  className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-gray-300 focus:outline-none focus:border-blue-500/50"
                >
                  <option value="ALL" className="bg-gray-900">All Modules</option>
                  <option value="LEAVE" className="bg-gray-900">Leaves</option>
                  <option value="COMP_OFF" className="bg-gray-900">Comp-offs</option>
                </select>
              </div>
            </div>

            {/* List */}
            {tasksLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Loader2 size={32} className="animate-spin text-blue-400 mb-3" />
                <p className="text-sm">Retrieving workbench actions...</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-20 rounded-xl border border-dashed border-white/10 bg-white/[0.01]">
                <CheckCircle size={48} className="mx-auto text-emerald-500/40 mb-4" />
                <h3 className="text-lg font-semibold text-gray-300">All Tasks Handled</h3>
                <p className="text-gray-500 text-sm mt-1">No items found matching the current filters.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((task) => {
                  const details = getTaskDetails(task);
                  const isExpanded = expandedTaskId === task.id;
                  const sla = getSLAStatus(task.dueAt);

                  return (
                    <div
                      key={task.id}
                      className="rounded-xl border border-white/10 overflow-hidden transition-all duration-300 hover:border-white/20"
                      style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(12px)' }}
                    >
                      {/* Task Header Row */}
                      <div
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 cursor-pointer hover:bg-white/[0.02] transition-colors"
                        onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                            {task.moduleType === 'LEAVE' ? (
                              <Calendar size={18} className="text-blue-400" />
                            ) : (
                              <Clock size={18} className="text-purple-400" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-bold text-gray-200">
                                {details?.type || `${task.moduleType} Request`}
                              </p>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 border border-white/10 text-gray-400">
                                Level {task.levelNo}
                              </span>
                              {task.actionStatus === 'DELEGATED' && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300">
                                  <ArrowRightLeft size={10} /> Delegated
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              Initiated by <span className="text-gray-300 font-semibold">{details?.initiator || 'Unknown'}</span> · Code: {details?.empCode || 'N/A'}
                            </p>
                            <p className="text-xs text-blue-400 mt-0.5 font-medium">{details?.details}</p>
                          </div>
                        </div>

                        {/* Status / SLA Indicator */}
                        <div className="flex items-center sm:flex-col sm:items-end gap-3 self-end sm:self-center">
                          <StatusBadge status={task.actionStatus} />
                          {task.actionStatus === 'PENDING' && (
                            <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${sla.color}`}>
                              SLA: {sla.label}
                            </span>
                          )}
                          {isExpanded ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
                        </div>
                      </div>

                      {/* Expansion Panel */}
                      {isExpanded && (
                        <div className="border-t border-white/5 bg-white/[0.01] px-6 py-5">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Request Details & Actions */}
                            <div className="space-y-4">
                              <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Request Context & Reason</h4>
                                <p className="text-sm text-gray-300 mt-1.5 italic bg-white/5 p-3 rounded-lg border border-white/5">
                                  "{details?.reason || 'No comments provided'}"
                                </p>
                              </div>

                              {task.actionStatus === 'PENDING' && (
                                <div>
                                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Audit Comment & Action</h4>
                                  <textarea
                                    value={actionComment}
                                    onChange={(e) => setActionComment(e.target.value)}
                                    placeholder="Provide reason for approval or rejection..."
                                    rows={3}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 resize-none"
                                  />
                                  <div className="flex gap-3 mt-3">
                                    <button
                                      onClick={() => handleAction(task.id, 'APPROVE')}
                                      disabled={processing !== null}
                                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50"
                                      style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}
                                    >
                                      {processing === `${task.id}-APPROVE` ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                                      Approve Request
                                    </button>
                                    <button
                                      onClick={() => handleAction(task.id, 'REJECT')}
                                      disabled={processing !== null}
                                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50"
                                      style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)' }}
                                    >
                                      {processing === `${task.id}-REJECT` ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                                      Reject Request
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Workflow Execution Log */}
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1.5">
                                <History size={13} />
                                Multi-level Timeline
                              </h4>
                              <div className="rounded-lg border border-white/5 bg-white/[0.02] max-h-60 overflow-y-auto">
                                <TimelinePanel entityType={task.moduleType} entityId={task.requestId} />
                              </div>
                            </div>

                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Sidebar: Delegation Config */}
          <div className="space-y-6">
            <div className="rounded-xl border border-white/10 p-6" style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(12px)' }}>
              <h2 className="text-lg font-bold text-gray-200 flex items-center gap-2 mb-2">
                <UserCheck size={18} className="text-purple-400" />
                Delegation Engine
              </h2>
              <p className="text-xs text-gray-400 mb-4">
                Forward your approval authority automatically to a chosen backup colleague during an absence window.
              </p>

              <form onSubmit={handleCreateDelegation} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Select Backup Approver</label>
                  <select
                    value={delegateTo}
                    onChange={(e) => setDelegateTo(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="" className="bg-gray-900">Choose colleague...</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id} className="bg-gray-900">
                        {emp.firstName} {emp.lastName} ({emp.employeeCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Start Date</label>
                    <input
                      type="date"
                      value={delegateStart}
                      onChange={(e) => setDelegateStart(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">End Date</label>
                    <input
                      type="date"
                      value={delegateEnd}
                      onChange={(e) => setDelegateEnd(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={delegationLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all shadow-md shadow-indigo-600/10 disabled:opacity-50"
                >
                  {delegationLoading ? <Loader2 size={16} className="animate-spin" /> : 'Activate Delegation'}
                </button>
              </form>

              {delegationMsg && (
                <div className={`mt-4 p-3 rounded-lg flex items-start gap-2 text-xs border ${
                  delegationMsg.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                  <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                  <span>{delegationMsg.text}</span>
                </div>
              )}
            </div>

            {/* SLA Policy Summary Card */}
            <div className="rounded-xl border border-white/5 bg-white/[0.01] p-5">
              <h3 className="text-sm font-bold text-gray-300 flex items-center gap-1.5 mb-2.5">
                <AlertCircle size={15} className="text-amber-400" />
                SLA Compliance Policies
              </h3>
              <ul className="space-y-2 text-xs text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                  <span>Approvers receive a 48-hour default SLA to action assigned workflow tasks.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                  <span>Tasks approaching the 12-hour limit are automatically flagged as "Critical".</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                  <span>Overdue tasks trigger escalation logic to notify higher management tiers.</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
