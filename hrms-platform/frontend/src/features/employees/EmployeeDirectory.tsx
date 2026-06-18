import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, SlidersHorizontal, MapPin, Building, ShieldCheck, 
  Award, FileText, Network, Clock, Plus, Edit2, Key, CheckCircle,
  Mail, Briefcase, AlertCircle
} from 'lucide-react';
import { useGetEmployeesQuery } from './employeesApi';

export function EmployeeDirectory() {
  const { data: liveEmployees, isLoading, error } = useGetEmployeesQuery();
  
  const employees = (liveEmployees || []).map((emp: any) => ({
    ...emp,
    displayName: emp.displayName || `${emp.firstName} ${emp.lastName}`,
    department: emp.department || 'Frontend Engineering',
    location: emp.location || 'San Francisco, CA',
    designation: emp.designation || 'Senior Staff Engineer',
    skills: emp.skills || [],
    documents: emp.documents || [],
    relationships: emp.relationships || [],
    timeline: emp.timeline || [],
    customFields: emp.customFields || []
  }));

  const navigate = useNavigate();
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'identity' | 'dna' | 'skills' | 'documents' | 'relationships' | 'timeline'>('identity');
  const [maskSensitive, setMaskSensitive] = useState(true);

  const filteredEmployees = employees.filter(emp => 
    emp.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRandomGradient = (name: string) => {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      'from-indigo-500 to-teal-400',
      'from-emerald-500 to-cyan-500',
      'from-purple-500 to-indigo-500',
      'from-rose-500 to-amber-500',
      'from-indigo-600 to-indigo-700'
    ];
    return colors[hash % colors.length];
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Directory View */}
      {!selectedEmployee ? (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Employee Digital Twins</h1>
              <p className="text-xs text-slate-450 mt-1 font-medium">
                Manage single-source-of-truth Digital Twins and employment profiles.
              </p>
            </div>
            <button 
              onClick={() => navigate('/onboarding/new')}
              className="flex items-center gap-1.5 bg-[#18181B] hover:bg-[#27272A] dark:bg-indigo-650 dark:hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm hover:shadow transition-all active:scale-[0.98] self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" /> Start Onboarding
            </button>
          </div>

          {/* Search and Filters */}
          <div className="bg-white dark:bg-[#0B0F19] border border-slate-200/80 dark:border-slate-850 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-center shadow-sm">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by code, name, department..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 rounded-lg text-xs outline-none focus:border-slate-350 dark:focus:border-slate-700 transition-colors"
              />
            </div>
            <button className="flex items-center gap-2 border border-slate-250 dark:border-slate-800 px-4 py-2 rounded-lg text-xs text-slate-650 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/40 w-full sm:w-auto justify-center font-bold">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
            </button>
          </div>

          {/* Loading States */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white dark:bg-[#0B0F19] border border-slate-200/80 dark:border-slate-850 rounded-xl p-5 shadow-sm space-y-4 animate-pulse">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-105 dark:bg-slate-800 rounded w-2/3" />
                      <div className="h-3 bg-slate-100 dark:bg-slate-850 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-6 bg-slate-50 dark:bg-slate-900 rounded" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-white dark:bg-[#0B0F19] border border-slate-200/85 dark:border-slate-855 rounded-xl p-12 text-center max-w-lg mx-auto space-y-4 shadow-sm">
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">API Connection Failure</h3>
              <p className="text-xs text-slate-450 leading-relaxed">
                Could not retrieve employee registry records. Ensure the backend HRMS application and database are running.
              </p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="bg-white dark:bg-[#0B0F19] border border-slate-200/85 dark:border-slate-855 rounded-xl p-12 text-center max-w-lg mx-auto space-y-4 shadow-sm">
              <div className="text-4xl">👥</div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Employees Found</h3>
              <p className="text-xs text-slate-455 leading-relaxed">
                There are no Digital Twins registered matching your criteria. Start the onboarding process to register new employee twins.
              </p>
              <button 
                onClick={() => navigate('/onboarding/new')}
                className="bg-indigo-650 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm active:scale-95 transition-all"
              >
                Start Employee Onboarding
              </button>
            </div>
          ) : (
            /* Employee Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredEmployees.map(emp => (
                <div 
                  key={emp.id}
                  onClick={() => setSelectedEmployee(emp)}
                  className="bg-white dark:bg-[#0B0F19] rounded-xl border border-slate-200/80 dark:border-slate-850 p-5 hover:shadow-lg hover:border-slate-350 dark:hover:border-slate-755 transition-all duration-300 cursor-pointer group hover:-translate-y-0.5"
                >
                  <div className="flex items-start gap-4">
                    {emp.avatarUrl ? (
                      <img 
                        src={emp.avatarUrl} 
                        alt={emp.displayName} 
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500/10 group-hover:ring-indigo-500/30 transition-all shrink-0" 
                      />
                    ) : (
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-tr ${getRandomGradient(emp.displayName)} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                        {getInitials(emp.displayName)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400">{emp.employeeCode}</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          emp.employmentStatus === 'ACTIVE' 
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' 
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-955/20 dark:text-amber-400'
                        }`}>
                          {emp.employmentStatus}
                        </span>
                      </div>
                      <h3 className="text-sm font-extrabold text-slate-800 dark:text-white mt-1 group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">
                        {emp.displayName}
                      </h3>
                      <p className="text-xs text-slate-450 font-semibold mt-0.5">{emp.designation}</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 mt-4 pt-3.5 grid grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5 min-w-0 font-medium">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{emp.department}</span>
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{emp.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ── Employee 360 Cockpit View ───────────────── */
        <div className="space-y-6 animate-fade-in">
          {/* Header Action Bar */}
          <div className="flex items-center justify-between">
            <button 
              onClick={() => { setSelectedEmployee(null); setActiveTab('identity'); }}
              className="flex items-center gap-1.5 text-xs text-slate-450 hover:text-slate-800 dark:hover:text-white font-bold transition-colors"
            >
              ← Back to Twin Directory
            </button>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setMaskSensitive(!maskSensitive)}
                className="flex items-center gap-1.5 border border-slate-250 dark:border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-650 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-905 transition-colors font-bold"
              >
                <Key className="w-3.5 h-3.5" /> {maskSensitive ? 'Reveal Sensitive Data' : 'Mask Sensitive Data'}
              </button>
              <button className="flex items-center gap-1.5 bg-[#18181B] hover:bg-[#27272A] dark:bg-indigo-650 dark:hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all">
                <Edit2 className="w-3.5 h-3.5" /> Edit Profile
              </button>
            </div>
          </div>

          {/* Employee Core Banner card */}
          <div className="bg-white dark:bg-[#0B0F19] rounded-xl border border-slate-200/80 dark:border-slate-850 p-6 flex flex-col sm:flex-row gap-6 items-center sm:items-start shadow-sm">
            {selectedEmployee.avatarUrl ? (
              <img 
                src={selectedEmployee.avatarUrl} 
                alt={selectedEmployee.displayName} 
                className="w-20 h-20 rounded-xl object-cover ring-4 ring-indigo-500/10 shadow" 
              />
            ) : (
              <div className={`w-20 h-20 rounded-xl bg-gradient-to-tr ${getRandomGradient(selectedEmployee.displayName)} flex items-center justify-center text-white text-2xl font-bold shadow shrink-0`}>
                {getInitials(selectedEmployee.displayName)}
              </div>
            )}
            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">{selectedEmployee.displayName}</h2>
                <span className="text-[9px] font-mono font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-900/40 inline-flex items-center justify-center self-center uppercase">
                  {selectedEmployee.employeeCode}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-550 dark:text-slate-300">{selectedEmployee.designation}</p>
              
              <div className="flex flex-wrap gap-4 text-[10px] text-slate-450 justify-center sm:justify-start pt-1.5 font-medium">
                <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5" /> {selectedEmployee.department}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {selectedEmployee.location}</span>
                {selectedEmployee.workEmail && (
                  <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {selectedEmployee.workEmail}</span>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-slate-200 dark:border-slate-800 flex flex-wrap gap-1.5">
            {[
              { id: 'identity', label: 'Identity & Banking', icon: ShieldCheck },
              { id: 'dna', label: 'Employment DNA', icon: Briefcase },
              { id: 'skills', label: 'Skills Cloud', icon: Award },
              { id: 'documents', label: 'Document Vault', icon: FileText },
              { id: 'relationships', label: 'Relationship Graph', icon: Network },
              { id: 'timeline', label: 'Timeline Log', icon: Clock }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all outline-none ${
                  activeTab === tab.id
                    ? 'border-indigo-550 text-indigo-650 dark:text-indigo-400 font-semibold'
                    : 'border-transparent text-slate-450 hover:text-slate-700 dark:hover:text-white hover:border-slate-300'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Dynamic Tab Content Area */}
          <div className="bg-white dark:bg-[#0B0F19] rounded-xl border border-slate-200/80 dark:border-slate-850 p-6 min-h-[300px] shadow-sm">
            
            {activeTab === 'identity' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">Identity Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <div>
                      <p className="text-[10px] text-slate-450 font-bold uppercase">Date of Birth</p>
                      <p className="mt-1">{selectedEmployee.dateOfBirth || 'Not registered'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-450 font-bold uppercase">Gender</p>
                      <p className="mt-1">{selectedEmployee.gender || 'Not registered'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-450 font-bold uppercase">Nationality</p>
                      <p className="mt-1">{selectedEmployee.nationality || 'United States'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-450 font-bold uppercase">Marital Status</p>
                      <p className="mt-1">{selectedEmployee.maritalStatus || 'Single'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">Compliance & Banking</h3>
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <div>
                      <p className="text-[10px] text-slate-455 font-bold uppercase">Tax ID (PAN)</p>
                      <p className="mt-1 font-mono font-bold">
                        {maskSensitive ? '••••••••••' : selectedEmployee.panNumber || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-455 font-bold uppercase">National ID (Aadhaar)</p>
                      <p className="mt-1 font-mono font-bold">
                        {maskSensitive ? '••••-••••-••••' : selectedEmployee.aadhaarNumber || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-455 font-bold uppercase">UAN (Provident Fund)</p>
                      <p className="mt-1 font-mono font-bold">
                        {maskSensitive ? '••••••••••••' : selectedEmployee.uanNumber || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-455 font-bold uppercase">Bank Account</p>
                      <p className="mt-1">
                        {selectedEmployee.bankName || 'N/A'} <br />
                        <span className="text-[10px] font-mono font-bold mt-0.5 block text-slate-450">
                          {maskSensitive ? '•••• •••• ••••' : selectedEmployee.bankAccountNumber || 'N/A'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'dna' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs animate-fade-in font-semibold text-slate-700 dark:text-slate-300">
                {[
                  { label: 'Business Unit', val: selectedEmployee.businessUnit || 'General Software Engineering' },
                  { label: 'Division', val: selectedEmployee.division || 'Technology Infrastructure' },
                  { label: 'Department', val: selectedEmployee.department },
                  { label: 'Sub-Department', val: selectedEmployee.subDepartment || 'Development Ops' },
                  { label: 'Cost Center', val: selectedEmployee.costCenter || 'CC-TECH-04' },
                  { label: 'Designation', val: selectedEmployee.designation },
                  { label: 'Grade Level', val: selectedEmployee.gradeId || 'Grade 4 (E4)' },
                  { label: 'Salary Band', val: selectedEmployee.bandId || 'Level 2 Band' },
                  { label: 'Date of Joining', val: selectedEmployee.dateOfJoining || 'Jan 15, 2024' }
                ].map((item, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-105 dark:border-slate-800">
                    <p className="text-[10px] text-slate-450 font-bold uppercase">{item.label}</p>
                    <p className="text-xs font-bold text-slate-850 dark:text-slate-200 mt-1.5">{item.val}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Assessed Twin Skills</h3>
                  <button className="text-xs text-indigo-650 dark:text-indigo-400 font-bold hover:underline">+ Add Skill</button>
                </div>
                {selectedEmployee.skills.length === 0 ? (
                  <div className="py-10 text-center text-xs text-slate-450 font-medium border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                    No skills cloud registered for this twin aggregate.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedEmployee.skills.map((skill: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-105 dark:border-slate-800 rounded-xl text-xs font-semibold">
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">{skill.name}</p>
                          <span className="text-[9px] uppercase font-bold text-slate-450 block mt-0.5">{skill.category}</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-750 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-100/50">
                          {skill.level}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-6 animate-fade-in font-semibold text-slate-700 dark:text-slate-350">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Verified Vault Documents</h3>
                  <button className="text-xs text-indigo-650 dark:text-indigo-400 font-bold hover:underline">+ Upload Doc</button>
                </div>
                {selectedEmployee.documents.length === 0 ? (
                  <div className="py-10 text-center text-xs text-slate-455 font-medium border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                    No compliance documents currently verified.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedEmployee.documents.map((doc: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-4 border border-slate-200/60 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-all text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded bg-rose-50 dark:bg-rose-950/20 flex items-center justify-center text-rose-600 shrink-0">
                            <FileText className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200">{doc.name}</p>
                            <p className="text-[10px] text-slate-450 mt-0.5">{doc.type} • {doc.size}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-bold">
                          <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-transparent text-[10px]">
                            <CheckCircle className="w-3 h-3" /> Verified
                          </span>
                          <span className="text-[10px] text-slate-450">Expiry: {doc.expiry}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'relationships' && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">Graph Relationships</h3>
                {selectedEmployee.relationships.length === 0 ? (
                  <div className="py-10 text-center text-xs text-slate-455 font-medium border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                    No active relationship DNA links.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {selectedEmployee.relationships.map((rel: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-4 p-4 border border-slate-200/60 dark:border-slate-800 rounded-xl">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold shrink-0">
                          {getInitials(rel.name)}
                        </div>
                        <div className="flex-1 min-w-0 font-semibold">
                          <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{rel.name}</p>
                          <p className="text-[10px] text-slate-450 mt-0.5">{rel.role}</p>
                        </div>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200/50 dark:border-slate-700">
                          {rel.type}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">Digital Twin Timeline</h3>
                {selectedEmployee.timeline.length === 0 ? (
                  <div className="py-10 text-center text-xs text-slate-455 font-medium border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                    No lifecycle timeline entries recorded yet.
                  </div>
                ) : (
                  <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 space-y-6 py-2">
                    {selectedEmployee.timeline.map((evt: any, idx: number) => (
                      <div key={idx} className="relative pl-6">
                        <div className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-indigo-600 ring-4 ring-white dark:ring-[#0B0F19]" />
                        <span className="text-[10px] font-mono font-semibold text-slate-450">{evt.date}</span>
                        <h4 className="text-xs font-bold text-slate-850 dark:text-slate-200 mt-0.5">{evt.title}</h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{evt.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
