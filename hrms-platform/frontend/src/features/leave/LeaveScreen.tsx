import React, { useState } from 'react';
import { 
  Calendar, Send, Plus, FileText, UserCheck 
} from 'lucide-react';

export function LeaveScreen() {
  const [balances, setBalances] = useState([
    { type: 'Annual Leave', allocated: 20, used: 5, pending: 2, balance: 13, color: 'from-blue-500 to-indigo-500' },
    { type: 'Sick Leave', allocated: 10, used: 2, pending: 0, balance: 8, color: 'from-emerald-500 to-teal-500' },
    { type: 'Casual Leave', allocated: 5, used: 1, pending: 1, balance: 3, color: 'from-amber-500 to-orange-500' }
  ]);

  const [requests, setRequests] = useState([
    { id: '1', type: 'Annual Leave', start: '2026-06-20', end: '2026-06-24', days: 5, status: 'PENDING', reason: 'Family vacation', workflowStep: 'Manager Approval (Michael Chen)' },
    { id: '2', type: 'Sick Leave', start: '2026-05-14', end: '2026-05-15', days: 2, status: 'APPROVED', reason: 'Medical appointment', workflowStep: 'Completed' }
  ]);

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [newRequest, setNewRequest] = useState({
    type: 'Annual Leave',
    start: '',
    end: '',
    reason: ''
  });

  const handleSubmittingRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const start = new Date(newRequest.start);
    const end = new Date(newRequest.end);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const req = {
      id: String(requests.length + 1),
      type: newRequest.type,
      start: newRequest.start,
      end: newRequest.end,
      days: diffDays,
      status: 'PENDING',
      reason: newRequest.reason,
      workflowStep: 'Manager Approval (Michael Chen)'
    };

    setRequests([req, ...requests]);
    
    // Update Pending Balance
    setBalances(balances.map(b => {
      if (b.type === newRequest.type) {
        return {
          ...b,
          pending: b.pending + diffDays,
          balance: b.balance - diffDays
        };
      }
      return b;
    }));

    setShowRequestModal(false);
    setNewRequest({ type: 'Annual Leave', start: '', end: '', reason: '' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Leave Management Portal</h1>
          <p className="text-sm text-surface-500 mt-1">Review leave balances, request time-off, and track workflow approval chains.</p>
        </div>
        <button 
          onClick={() => setShowRequestModal(true)}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-md shadow-primary-600/15 hover:shadow-lg"
        >
          <Plus className="w-4 h-4" /> Request Leave
        </button>
      </div>

      {/* Leave Balances Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {balances.map((bal, idx) => (
          <div key={idx} className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 p-5 hover:shadow-lg transition-all relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-surface-400 font-semibold uppercase tracking-wider">{bal.type}</p>
                <p className="text-3xl font-extrabold text-surface-900 dark:text-white mt-2">{bal.balance} days</p>
              </div>
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${bal.color} flex items-center justify-center text-white shadow-md`}>
                <Calendar className="w-4 h-4" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-6 border-t border-surface-100 dark:border-surface-750 pt-4 text-center text-xs">
              <div>
                <p className="text-surface-400 font-medium">Allocated</p>
                <p className="font-bold text-surface-800 dark:text-surface-200 mt-1">{bal.allocated}</p>
              </div>
              <div>
                <p className="text-surface-400 font-medium">Used</p>
                <p className="font-bold text-surface-800 dark:text-surface-200 mt-1">{bal.used}</p>
              </div>
              <div>
                <p className="text-surface-400 font-medium">Pending</p>
                <p className="font-bold text-primary-600 dark:text-primary-400 mt-1">{bal.pending}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Requests & Workflow Chain */}
      <div className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 p-5">
        <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Leave Requests & Approval Chains</h2>
        
        <div className="space-y-4">
          {requests.map(req => (
            <div key={req.id} className="border border-surface-200 dark:border-surface-700 rounded-xl p-5 hover:bg-surface-50/50 dark:hover:bg-surface-700/10 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/20'
                }`}>
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-surface-800 dark:text-white">{req.type}</h4>
                    <span className="text-xs font-mono bg-surface-100 dark:bg-surface-700 px-2 py-0.5 rounded text-surface-500 font-medium">
                      {req.days} days
                    </span>
                  </div>
                  <p className="text-xs text-surface-500 mt-1 font-semibold">
                    {req.start} to {req.end}
                  </p>
                  <p className="text-xs text-surface-400 mt-1 italic">"{req.reason}"</p>
                </div>
              </div>

              {/* Workflow Step Tracker */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-8 border-t lg:border-t-0 border-surface-100 dark:border-surface-700/50 pt-4 lg:pt-0">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-surface-400">Current Workflow Step</p>
                  <div className="flex items-center gap-1.5 text-xs text-surface-700 dark:text-surface-200 font-semibold">
                    <UserCheck className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                    {req.workflowStep}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    req.status === 'APPROVED' 
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' 
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                  }`}>
                    {req.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Request Leave Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-surface-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 w-full max-w-md p-6 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center border-b border-surface-100 dark:border-surface-700 pb-3">
              <h3 className="text-lg font-bold text-surface-900 dark:text-white">Request Leave</h3>
              <button 
                onClick={() => setShowRequestModal(false)}
                className="text-surface-400 hover:text-surface-600 dark:hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmittingRequest} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-semibold text-surface-500 uppercase">Leave Type</label>
                <select 
                  value={newRequest.type}
                  onChange={e => setNewRequest({ ...newRequest, type: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500/30 text-surface-800 dark:text-surface-200 font-semibold"
                >
                  <option>Annual Leave</option>
                  <option>Sick Leave</option>
                  <option>Casual Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-surface-500 uppercase">Start Date</label>
                  <input 
                    type="date" 
                    required
                    value={newRequest.start}
                    onChange={e => setNewRequest({ ...newRequest, start: e.target.value })}
                    className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500/30 text-surface-800 dark:text-surface-200 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-surface-500 uppercase">End Date</label>
                  <input 
                    type="date" 
                    required
                    value={newRequest.end}
                    onChange={e => setNewRequest({ ...newRequest, end: e.target.value })}
                    className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500/30 text-surface-800 dark:text-surface-200 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-surface-500 uppercase">Reason</label>
                <textarea 
                  required
                  rows={3}
                  placeholder="Enter reason for leave..."
                  value={newRequest.reason}
                  onChange={e => setNewRequest({ ...newRequest, reason: e.target.value })}
                  className="w-full mt-1.5 px-3 py-2 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500/30 text-surface-800 dark:text-surface-200"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-surface-100 dark:border-surface-700/50">
                <button 
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 py-2 border border-surface-200 dark:border-surface-700 text-sm font-semibold rounded-lg hover:bg-surface-50 dark:hover:bg-surface-700 text-surface-600 dark:text-surface-300 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-all shadow-md shadow-primary-600/10 hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
