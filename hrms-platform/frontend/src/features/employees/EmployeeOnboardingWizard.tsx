import { useState } from 'react';
import { useOnboardEmployeeMutation, useGetEmployeesQuery } from './employeesApi';
import { 
  useGetOrganizationsQuery, 
  useGetBusinessUnitsQuery, 
  useGetDivisionsQuery, 
  useGetDepartmentsQuery, 
  useGetLocationsQuery, 
  useGetGradesQuery, 
  useGetBandsQuery 
} from '../org-dna/orgDnaApi';
import { 
  User, Briefcase, ShieldCheck, Award, FileText, Network, Clock, X, Plus, Trash2, CheckCircle2, Sparkles, Upload
} from 'lucide-react';

interface WizardProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function EmployeeOnboardingWizard({ onClose, onSuccess }: WizardProps) {
  const [step, setStep] = useState(1);
  
  // ── Step 1: Identity ────────────────────────
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [personalEmail, setPersonalEmail] = useState('');
  const [workPhone, setWorkPhone] = useState('');
  const [personalPhone, setPersonalPhone] = useState('');
  const [gender, setGender] = useState('Male');
  const [dateOfBirth, setDateOfBirth] = useState('');

  // ── Step 2: Employment DNA ──────────────────
  const [employeeCode, setEmployeeCode] = useState('');
  const [dateOfJoining, setDateOfJoining] = useState('');
  const [selectedOrg, setSelectedOrg] = useState('');
  const [selectedBU, setSelectedBU] = useState('');
  const [selectedDiv, setSelectedDiv] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedLoc, setSelectedLoc] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedBand, setSelectedBand] = useState('');
  const [managerId, setManagerId] = useState('');
  const [workMode, setWorkMode] = useState('HYBRID');
  const [designation, setDesignation] = useState('');

  // ── Step 3: Compliance ──────────────────────
  const [panNumber, setPanNumber] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [uanNumber, setUanNumber] = useState('');
  const [esicNumber, setEsicNumber] = useState('');

  // ── Step 4: Banking ─────────────────────────
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');

  // ── Step 5: Skills & Certifications ─────────
  const [skillsList, setSkillsList] = useState<any[]>([]);
  const [certificationsList, setCertificationsList] = useState<any[]>([]);
  // Local sub-form states
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory] = useState<'TECHNICAL' | 'FUNCTIONAL' | 'SOFT'>('TECHNICAL');
  const [newSkillLevel, setNewSkillLevel] = useState('INTERMEDIATE');
  
  const [newCertName, setNewCertName] = useState('');
  const [newCertAuthority, setNewCertAuthority] = useState('');
  const [newCertDate, setNewCertDate] = useState('');

  // ── Step 6: Documents ───────────────────────
  const [documentsList, setDocumentsList] = useState<any[]>([]);

  // ── Step 7: Relationships ───────────────────
  const [buddyId, setBuddyId] = useState('');
  const [mentorId, setMentorId] = useState('');
  const [hrbpId, setHrbpId] = useState('');

  // ── Cascading Queries for Org DNA ───────────
  const { data: orgs } = useGetOrganizationsQuery();
  const { data: businessUnits } = useGetBusinessUnitsQuery(selectedOrg, { skip: !selectedOrg });
  const { data: divisions } = useGetDivisionsQuery(selectedBU, { skip: !selectedBU });
  const { data: departments } = useGetDepartmentsQuery(selectedDiv, { skip: !selectedDiv });
  const { data: locations } = useGetLocationsQuery(selectedOrg, { skip: !selectedOrg });
  const { data: grades } = useGetGradesQuery(selectedOrg, { skip: !selectedOrg });
  const { data: bands } = useGetBandsQuery(selectedOrg, { skip: !selectedOrg });
  const { data: existingEmployees } = useGetEmployeesQuery();

  const [onboardEmployee, { isLoading }] = useOnboardEmployeeMutation();

  const handleNext = () => setStep(prev => Math.min(prev + 1, 8));
  const handlePrev = () => setStep(prev => Math.max(prev - 1, 1));

  // Add Skill
  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    setSkillsList(prev => [...prev, {
      skillName: newSkillName,
      skillCategory: newSkillCategory,
      proficiencyLevel: newSkillLevel
    }]);
    setNewSkillName('');
  };

  // Remove Skill
  const handleRemoveSkill = (idx: number) => {
    setSkillsList(prev => prev.filter((_, i) => i !== idx));
  };

  // Add Certification
  const handleAddCert = () => {
    if (!newCertName.trim() || !newCertAuthority.trim()) return;
    setCertificationsList(prev => [...prev, {
      certificationName: newCertName,
      issuingAuthority: newCertAuthority,
      issueDate: newCertDate
    }]);
    setNewCertName('');
    setNewCertAuthority('');
    setNewCertDate('');
  };

  // Remove Certification
  const handleRemoveCert = (idx: number) => {
    setCertificationsList(prev => prev.filter((_, i) => i !== idx));
  };

  // Mock Document upload trigger
  const handleDocUpload = (category: string, filename: string) => {
    if (!filename) return;
    setDocumentsList(prev => [
      ...prev.filter(d => d.documentType !== category), // replace if already exists
      {
        documentName: filename.split('\\').pop() || filename,
        documentType: category,
        fileSize: 1024 * 1024,
        mimeType: 'application/pdf',
        verificationStatus: 'PENDING',
        expiryDate: '2030-12-31'
      }
    ]);
  };

  // ── Calculation: Profile Strength & Completion % ──
  const calculateMetrics = () => {
    const fields = [
      firstName, lastName, workEmail, personalEmail, workPhone, personalPhone, gender, dateOfBirth,
      employeeCode, dateOfJoining, selectedOrg, selectedLoc, selectedGrade, selectedBand,
      managerId, designation,
      panNumber, aadhaarNumber, uanNumber, esicNumber,
      bankName, bankAccountNumber, bankIfsc,
      skillsList.length > 0 ? 'yes' : '',
      certificationsList.length > 0 ? 'yes' : '',
      documentsList.length > 0 ? 'yes' : '',
      buddyId || mentorId || hrbpId ? 'yes' : ''
    ];
    const filledCount = fields.filter(f => !!f).length;
    const percentage = Math.round((filledCount / fields.length) * 100);

    let strength = 'Poor';
    let strengthColor = 'text-rose-450 bg-rose-955/20 border-rose-900/30';
    if (percentage >= 80) {
      strength = 'Excellent';
      strengthColor = 'text-emerald-450 bg-emerald-950/20 border-emerald-900/30';
    } else if (percentage >= 50) {
      strength = 'Good';
      strengthColor = 'text-indigo-400 bg-indigo-950/20 border-indigo-900/30';
    } else if (percentage >= 25) {
      strength = 'Fair';
      strengthColor = 'text-amber-450 bg-amber-955/20 border-amber-900/30';
    }

    return { percentage, strength, strengthColor };
  };

  const { percentage, strength, strengthColor } = calculateMetrics();

  const handleSubmit = async () => {
    try {
      const relationships = [];
      if (managerId) {
        relationships.push({
          relationshipType: 'MANAGER',
          relatedEmployeeId: managerId
        });
      }
      if (buddyId) {
        relationships.push({
          relationshipType: 'BUDDY',
          relatedEmployeeId: buddyId
        });
      }
      if (mentorId) {
        relationships.push({
          relationshipType: 'MENTOR',
          relatedEmployeeId: mentorId
        });
      }
      if (hrbpId) {
        relationships.push({
          relationshipType: 'HRBP',
          relatedEmployeeId: hrbpId
        });
      }

      await onboardEmployee({
        firstName,
        lastName,
        displayName: `${firstName} ${lastName}`,
        workEmail,
        personalEmail: personalEmail || undefined,
        workPhone: workPhone || undefined,
        personalPhone: personalPhone || undefined,
        gender,
        dateOfBirth: dateOfBirth || undefined,
        employeeCode,
        dateOfJoining,
        organizationId: selectedOrg || undefined,
        businessUnitId: selectedBU || undefined,
        divisionId: selectedDiv || undefined,
        departmentId: selectedDept || undefined,
        locationId: selectedLoc || undefined,
        gradeId: selectedGrade || undefined,
        bandId: selectedBand || undefined,
        managerId: managerId || undefined,
        workMode,
        panNumber: panNumber || undefined,
        aadhaarNumber: aadhaarNumber || undefined,
        uanNumber: uanNumber || undefined,
        esicNumber: esicNumber || undefined,
        bankName: bankName || undefined,
        bankAccountNumber: bankAccountNumber || undefined,
        bankIfsc: bankIfsc || undefined,
        skills: skillsList,
        certifications: certificationsList,
        documents: documentsList,
        relationships: relationships,
        employmentStatus: 'ACTIVE'
      }).unwrap();
      onSuccess();
    } catch (err) {
      console.error('Failed to onboard employee twin', err);
    }
  };

  const stepsList = [
    { nr: 1, label: 'Identity', icon: User },
    { nr: 2, label: 'Employment DNA', icon: Briefcase },
    { nr: 3, label: 'Compliance', icon: ShieldCheck },
    { nr: 4, label: 'Banking Details', icon: Clock },
    { nr: 5, label: 'Skills & Certifications', icon: Award },
    { nr: 6, label: 'Documents Upload', icon: FileText },
    { nr: 7, label: 'Relationships', icon: Network },
    { nr: 8, label: 'Review & Create', icon: Sparkles }
  ];

  return (
    <div className="fixed inset-0 bg-[#F3F7FA] dark:bg-[#07090e] z-50 flex flex-col md:flex-row animate-fade-in text-slate-900 dark:text-white overflow-hidden h-screen w-screen">
      
      {/* ── Left Sidebar Navigation Pane ────────────────── */}
      <div className="w-full md:w-80 bg-white dark:bg-[#0B0F19] text-slate-700 dark:text-slate-300 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          
          {/* Logo & Headline */}
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-650 flex items-center justify-center font-bold text-white shadow-md text-sm">
                M
              </div>
              <span className="font-extrabold text-sm tracking-tight text-slate-800 dark:text-white uppercase">ManageMyOpz</span>
            </div>
            <h3 className="text-sm font-extrabold mt-4 text-slate-800 dark:text-white">Employee Onboarding</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Configure aggregate root credentials.</p>
          </div>

          {/* Steps list */}
          <div className="space-y-1.5">
            {stepsList.map((s) => {
              const Icon = s.icon;
              const isActive = step === s.nr;
              const isCompleted = step > s.nr;
              return (
                <button
                  key={s.nr}
                  onClick={() => setStep(s.nr)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs transition-all font-semibold outline-none ${
                    isActive 
                      ? 'bg-[#5D69F4] text-white shadow-[0_4px_12px_rgba(93,105,244,0.25)]' 
                      : isCompleted 
                        ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40' 
                        : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : isCompleted ? 'text-emerald-550 dark:text-emerald-455' : 'text-slate-400 dark:text-slate-550'}`} />
                    <span>{s.label}</span>
                  </div>
                  {isCompleted && (
                    <span className="text-[10px] text-emerald-550 dark:text-emerald-455 font-bold font-mono">✓</span>
                  )}
                </button>
              );
            })}
          </div>

        </div>

        {/* Completion Progress Widget */}
        <div className="space-y-2 border-t border-slate-200 dark:border-slate-800/80 pt-6">
          <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
            <span>Overall progress</span>
            <span>{percentage}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

      </div>

      {/* ── Main Form Pane ────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F3F7FA] dark:bg-[#07090e]">
        
        {/* Form Header */}
        <div className="px-8 py-4 bg-white dark:bg-[#0B0F19] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-550 dark:text-indigo-400">Step {step} of 8</span>
            <h2 className="text-sm font-extrabold text-slate-850 dark:text-white mt-0.5">
              {stepsList.find(s => s.nr === step)?.label}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center justify-center text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body Scroll Area */}
        <div className="flex-1 overflow-y-auto p-8 max-w-3xl mx-auto w-full">
          <div className="bg-white dark:bg-[#0B0F19] rounded-xl border border-slate-200/80 dark:border-slate-850 p-6 shadow-sm min-h-[400px]">
            
            {/* STEP 1: IDENTITY */}
            {step === 1 && (
              <div className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-350 animate-fade-in">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-450 uppercase block font-bold">First Name *</label>
                    <input 
                      type="text" 
                      placeholder="John"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 outline-none w-full text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-455 uppercase block font-bold">Last Name *</label>
                    <input 
                      type="text" 
                      placeholder="Doe"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 outline-none w-full text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-450 uppercase block font-bold">Work Email *</label>
                    <input 
                      type="email" 
                      placeholder="john.doe@managemyopz.com"
                      value={workEmail}
                      onChange={e => setWorkEmail(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 outline-none w-full text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-455 uppercase block font-bold">Personal Email</label>
                    <input 
                      type="email" 
                      placeholder="john.doe.personal@gmail.com"
                      value={personalEmail}
                      onChange={e => setPersonalEmail(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 outline-none w-full text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-455 uppercase block font-bold">Work Phone</label>
                    <input 
                      type="text" 
                      placeholder="+1 (555) 019-2834"
                      value={workPhone}
                      onChange={e => setWorkPhone(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 outline-none w-full text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-455 uppercase block font-bold">Personal Phone</label>
                    <input 
                      type="text" 
                      placeholder="+1 (555) 014-9988"
                      value={personalPhone}
                      onChange={e => setPersonalPhone(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 outline-none w-full text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-455 uppercase block font-bold">Gender</label>
                    <select 
                      value={gender}
                      onChange={e => setGender(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 outline-none w-full text-xs"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-455 uppercase block font-bold">Date of Birth</label>
                    <input 
                      type="date" 
                      value={dateOfBirth}
                      onChange={e => setDateOfBirth(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 outline-none w-full text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: EMPLOYMENT DNA */}
            {step === 2 && (
              <div className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-350 animate-fade-in">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-450 uppercase block font-bold">Employee Code *</label>
                    <input 
                      type="text" 
                      placeholder="EMP-0092"
                      value={employeeCode}
                      onChange={e => setEmployeeCode(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 outline-none w-full text-xs font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-455 uppercase block font-bold">Date of Joining *</label>
                    <input 
                      type="date" 
                      value={dateOfJoining}
                      onChange={e => setDateOfJoining(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 outline-none w-full text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-450 uppercase block font-bold">Organization Tenant</label>
                    <select 
                      value={selectedOrg}
                      onChange={e => {
                        setSelectedOrg(e.target.value);
                        setSelectedBU('');
                        setSelectedDiv('');
                        setSelectedDept('');
                      }}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 outline-none w-full text-xs"
                    >
                      <option value="">Select Org</option>
                      {(orgs || []).map((org: any) => (
                        <option key={org.id} value={org.id}>{org.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-455 uppercase block font-bold">Business Unit</label>
                    <select 
                      value={selectedBU}
                      onChange={e => {
                        setSelectedBU(e.target.value);
                        setSelectedDiv('');
                        setSelectedDept('');
                      }}
                      disabled={!selectedOrg}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 outline-none w-full text-xs disabled:opacity-40"
                    >
                      <option value="">Select BU</option>
                      {(businessUnits || []).map((bu: any) => (
                        <option key={bu.id} value={bu.id}>{bu.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-455 uppercase block font-bold">Division</label>
                    <select 
                      value={selectedDiv}
                      onChange={e => {
                        setSelectedDiv(e.target.value);
                        setSelectedDept('');
                      }}
                      disabled={!selectedBU}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 outline-none w-full text-xs disabled:opacity-40"
                    >
                      <option value="">Select Division</option>
                      {(divisions || []).map((div: any) => (
                        <option key={div.id} value={div.id}>{div.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-455 uppercase block font-bold">Department</label>
                    <select 
                      value={selectedDept}
                      onChange={e => setSelectedDept(e.target.value)}
                      disabled={!selectedDiv}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 outline-none w-full text-xs disabled:opacity-40"
                    >
                      <option value="">Select Department</option>
                      {(departments || []).map((dept: any) => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-455 uppercase block font-bold">Location</label>
                    <select 
                      value={selectedLoc}
                      onChange={e => setSelectedLoc(e.target.value)}
                      disabled={!selectedOrg}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 outline-none w-full text-xs disabled:opacity-40"
                    >
                      <option value="">Select Location</option>
                      {(locations || []).map((loc: any) => (
                        <option key={loc.id} value={loc.id}>{loc.name} ({loc.city})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-455 uppercase block font-bold">Grade Level</label>
                    <select 
                      value={selectedGrade}
                      onChange={e => setSelectedGrade(e.target.value)}
                      disabled={!selectedOrg}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 outline-none w-full text-xs disabled:opacity-40"
                    >
                      <option value="">Select Grade</option>
                      {(grades || []).map((g: any) => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-455 uppercase block font-bold">Salary Band</label>
                    <select 
                      value={selectedBand}
                      onChange={e => setSelectedBand(e.target.value)}
                      disabled={!selectedOrg}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 outline-none w-full text-xs disabled:opacity-40"
                    >
                      <option value="">Select Band</option>
                      {(bands || []).map((b: any) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-455 uppercase block font-bold">Work Mode</label>
                    <select 
                      value={workMode}
                      onChange={e => setWorkMode(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 outline-none w-full text-xs"
                    >
                      <option value="REMOTE">Remote Office</option>
                      <option value="HYBRID">Hybrid Ecosystem</option>
                      <option value="ONSITE">On-Site Office</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-450 uppercase block font-bold">Designation *</label>
                    <input 
                      type="text" 
                      placeholder="Senior Fullstack Dev"
                      value={designation}
                      onChange={e => setDesignation(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 outline-none w-full text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-455 uppercase block font-bold">Reporting Manager</label>
                    <select 
                      value={managerId}
                      onChange={e => setManagerId(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 outline-none w-full text-xs"
                    >
                      <option value="">Select Manager</option>
                      {(existingEmployees || []).map((emp: any) => (
                        <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.employeeCode})</option>
                      ))}
                    </select>
                  </div>
                </div>

              </div>
            )}

            {/* STEP 3: COMPLIANCE */}
            {step === 3 && (
              <div className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-350 animate-fade-in">
                
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-150 dark:border-slate-800 flex gap-2.5 items-start">
                  <ShieldCheck className="w-5 h-5 text-indigo-500 shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">Compliance & Identity Keys</h4>
                    <p className="text-[11px] text-slate-450 mt-0.5">Input federal registry tracking IDs. The data is secured using AES-256 field-level encryption on the database tier.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-455 uppercase block font-bold">PAN Number</label>
                    <input 
                      type="text" 
                      placeholder="ABCDE1234F"
                      value={panNumber}
                      onChange={e => setPanNumber(e.target.value.toUpperCase())}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 outline-none w-full text-xs font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-455 uppercase block font-bold">Aadhaar Card Number</label>
                    <input 
                      type="text" 
                      placeholder="1234 5678 9012"
                      value={aadhaarNumber}
                      onChange={e => setAadhaarNumber(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 outline-none w-full text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-455 uppercase block font-bold">UAN (Universal Account Number)</label>
                    <input 
                      type="text" 
                      placeholder="100998822112"
                      value={uanNumber}
                      onChange={e => setUanNumber(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 outline-none w-full text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-455 uppercase block font-bold">ESIC Number</label>
                    <input 
                      type="text" 
                      placeholder="31123456780011001"
                      value={esicNumber}
                      onChange={e => setEsicNumber(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 outline-none w-full text-xs font-mono"
                    />
                  </div>
                </div>

              </div>
            )}

            {/* STEP 4: BANKING DETAILS */}
            {step === 4 && (
              <div className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-350 animate-fade-in">
                
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-450 uppercase block font-bold">Bank Name</label>
                  <input 
                    type="text" 
                    placeholder="Silicon Valley Bank"
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 outline-none w-full text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-455 uppercase block font-bold">Bank Account Number</label>
                    <input 
                      type="text" 
                      placeholder="9988112233"
                      value={bankAccountNumber}
                      onChange={e => setBankAccountNumber(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 outline-none w-full text-xs font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-455 uppercase block font-bold">Bank IFSC Code</label>
                    <input 
                      type="text" 
                      placeholder="SVTX0000231"
                      value={bankIfsc}
                      onChange={e => setBankIfsc(e.target.value.toUpperCase())}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 outline-none w-full text-xs font-mono font-bold"
                    />
                  </div>
                </div>

              </div>
            )}

            {/* STEP 5: SKILLS & CERTIFICATIONS */}
            {step === 5 && (
              <div className="space-y-6 text-xs font-semibold text-slate-700 dark:text-slate-350 animate-fade-in">
                
                {/* Skills Cloud */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-905 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">Skills Cloud</h3>
                  
                  {skillsList.length > 0 && (
                    <div className="flex flex-wrap gap-2 py-2">
                      {skillsList.map((sk, idx) => (
                        <div key={idx} className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-full text-xs">
                          <span>{sk.skillName} • <span className="text-[10px] text-slate-450 uppercase font-bold">{sk.proficiencyLevel}</span></span>
                          <button onClick={() => handleRemoveSkill(idx)} className="text-rose-500 hover:text-rose-700 ml-1">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input 
                      type="text" 
                      placeholder="React Native / Kubernetes"
                      value={newSkillName}
                      onChange={e => setNewSkillName(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 outline-none text-xs md:col-span-2"
                    />
                    <select 
                      value={newSkillLevel}
                      onChange={e => setNewSkillLevel(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 outline-none text-xs"
                    >
                      <option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="EXPERT">Expert</option>
                    </select>
                    <button 
                      onClick={handleAddSkill}
                      className="bg-[#18181B] hover:bg-[#27272A] dark:bg-indigo-650 dark:hover:bg-indigo-700 text-white px-3.5 py-2 rounded-lg flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
                </div>

                {/* Certifications Vault */}
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-xs font-bold text-slate-905 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">Certifications</h3>
                  
                  {certificationsList.length > 0 && (
                    <div className="space-y-2 py-2">
                      {certificationsList.map((cert, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-xl">
                          <div>
                            <p className="font-bold text-slate-850 dark:text-white">{cert.certificationName}</p>
                            <p className="text-[10px] text-slate-450 mt-0.5">{cert.issuingAuthority} • Issued {cert.issueDate}</p>
                          </div>
                          <button onClick={() => handleRemoveCert(idx)} className="text-rose-500 hover:text-rose-700">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input 
                      type="text" 
                      placeholder="AWS Solution Architect"
                      value={newCertName}
                      onChange={e => setNewCertName(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 outline-none text-xs"
                    />
                    <input 
                      type="text" 
                      placeholder="Amazon Web Services"
                      value={newCertAuthority}
                      onChange={e => setNewCertAuthority(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 outline-none text-xs"
                    />
                    <div className="flex gap-2">
                      <input 
                        type="date" 
                        value={newCertDate}
                        onChange={e => setNewCertDate(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 outline-none flex-1 text-xs"
                      />
                      <button 
                        onClick={handleAddCert}
                        className="bg-[#18181B] hover:bg-[#27272A] dark:bg-indigo-650 dark:hover:bg-indigo-700 text-white px-3.5 rounded-lg flex items-center justify-center shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* STEP 6: DOCUMENTS */}
            {step === 6 && (
              <div className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-350 animate-fade-in">
                
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-150 dark:border-slate-800 flex gap-2.5 items-start">
                  <FileText className="w-5 h-5 text-indigo-500 shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">Employee Document Vault</h4>
                    <p className="text-[11px] text-slate-450 mt-0.5">Attach identity, education, and previous employment documents to create the verified twin profile.</p>
                  </div>
                </div>

                {/* Document rows */}
                {[
                  { key: 'IDENTITY_PROOF', label: 'Identity Document (e.g. Passport/Aadhaar/PAN)' },
                  { key: 'EDUCATION_DEGREE', label: 'Education Certificate (e.g. Bachelor/Master Degree)' },
                  { key: 'EXPERIENCE_LETTER', label: 'Employment Letter (e.g. Relieving / Payslips)' }
                ].map((docType) => {
                  const uploaded = documentsList.find(d => d.documentType === docType.key);
                  return (
                    <div key={docType.key} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 dark:text-slate-200">{docType.label}</p>
                        {uploaded ? (
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-450 mt-1 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Attached: {uploaded.documentName}
                          </p>
                        ) : (
                          <p className="text-[10px] text-slate-455 mt-1">Pending document attachment</p>
                        )}
                      </div>
                      <label className="cursor-pointer bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 border border-slate-200 dark:border-slate-800 px-3.5 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0">
                        <Upload className="w-3.5 h-3.5 text-indigo-500" />
                        {uploaded ? 'Replace' : 'Upload'}
                        <input 
                          type="file" 
                          className="hidden" 
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleDocUpload(docType.key, e.target.files[0].name);
                            }
                          }}
                        />
                      </label>
                    </div>
                  );
                })}
              </div>
            )}

            {/* STEP 7: RELATIONSHIPS */}
            {step === 7 && (
              <div className="space-y-6 text-xs font-semibold text-slate-700 dark:text-slate-355 animate-fade-in">
                
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-150 dark:border-slate-800 flex gap-2.5 items-start">
                  <Network className="w-5 h-5 text-indigo-500 shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">Workforce Relationships Graph</h4>
                    <p className="text-[11px] text-slate-450 mt-0.5">Link the new employee to managers, mentors, buddies, and HR business partners to establish organizational DNA links.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Reporting Manager */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-450 uppercase block font-bold">Reporting Manager</label>
                    <select 
                      value={managerId}
                      onChange={e => setManagerId(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2.5 outline-none w-full text-xs font-medium"
                    >
                      <option value="">Select Manager</option>
                      {(existingEmployees || []).map((emp: any) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.firstName} {emp.lastName} ({emp.employeeCode})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Onboarding Buddy */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-455 uppercase block font-bold">Onboarding Buddy</label>
                    <select 
                      value={buddyId}
                      onChange={e => setBuddyId(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2.5 outline-none w-full text-xs font-medium"
                    >
                      <option value="">Select Onboarding Buddy</option>
                      {(existingEmployees || []).map((emp: any) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.firstName} {emp.lastName} ({emp.employeeCode})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Career Mentor */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-455 uppercase block font-bold">Career Mentor</label>
                    <select 
                      value={mentorId}
                      onChange={e => setMentorId(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2.5 outline-none w-full text-xs font-medium"
                    >
                      <option value="">Select Career Mentor</option>
                      {(existingEmployees || []).map((emp: any) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.firstName} {emp.lastName} ({emp.employeeCode})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* HRBP */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-455 uppercase block font-bold">HR Business Partner (HRBP)</label>
                    <select 
                      value={hrbpId}
                      onChange={e => setHrbpId(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2.5 outline-none w-full text-xs font-medium"
                    >
                      <option value="">Select HRBP</option>
                      {(existingEmployees || []).map((emp: any) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.firstName} {emp.lastName} ({emp.employeeCode})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

              </div>
            )}

            {/* STEP 8: REVIEW & CREATE */}
            {step === 8 && (
              <div className="space-y-6 text-xs font-semibold text-slate-700 dark:text-slate-300 animate-fade-in">
                
                {/* Strength & Completion */}
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-xl border ${strengthColor} flex items-center gap-3`}>
                    <Sparkles className="w-6 h-6 shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-450">Twin Profile Strength</p>
                      <p className="text-base font-extrabold mt-0.5">{strength}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5">
                    <div className="flex justify-between items-center font-bold text-[10px] uppercase text-slate-455">
                      <span>Profile Completion</span>
                      <span>{percentage}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Summary Lists */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/20 dark:bg-slate-900/10 space-y-4 max-h-[300px] overflow-y-auto">
                  <h4 className="font-extrabold text-slate-905 dark:text-white uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800 pb-2">Profile Twin Summary</h4>
                  
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3.5 text-xs font-semibold text-slate-700 dark:text-slate-350">
                    <div>
                      <span className="text-[10px] text-slate-450 uppercase block font-bold">Full Name</span>
                      <strong className="text-slate-850 dark:text-slate-205">{firstName} {lastName}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-450 uppercase block font-bold">Employee Code</span>
                      <strong className="text-slate-850 dark:text-slate-205">{employeeCode || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-450 uppercase block font-bold">Work Email</span>
                      <strong className="text-slate-850 dark:text-slate-205">{workEmail}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-455 uppercase block font-bold">Date of Joining</span>
                      <strong className="text-slate-850 dark:text-slate-205">{dateOfJoining || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-455 uppercase block font-bold">Work Mode</span>
                      <strong className="text-slate-850 dark:text-slate-205 uppercase">{workMode}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-455 uppercase block font-bold">PAN ID</span>
                      <strong className="text-slate-850 dark:text-slate-205">{panNumber || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-455 uppercase block font-bold">Bank details</span>
                      <strong className="text-slate-850 dark:text-slate-205">{bankName || 'N/A'} ({bankAccountNumber || 'N/A'})</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-455 uppercase block font-bold">Buddy Link</span>
                      <strong className="text-slate-850 dark:text-slate-205">
                        {buddyId ? (existingEmployees || []).find((e: any) => e.id === buddyId)?.displayName || 'Assigned' : 'N/A'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-455 uppercase block font-bold">Mentor Link</span>
                      <strong className="text-slate-850 dark:text-slate-205">
                        {mentorId ? (existingEmployees || []).find((e: any) => e.id === mentorId)?.displayName || 'Assigned' : 'N/A'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-455 uppercase block font-bold">Skills Cloud</span>
                      <strong className="text-slate-850 dark:text-slate-205">{skillsList.length} skills added</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-455 uppercase block font-bold">Documents Vault</span>
                      <strong className="text-slate-850 dark:text-slate-205">{documentsList.length} files attached</strong>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-450 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                  By clicking Onboard Employee Twin, you will commit this record to the platform's immutable Single Source of Truth. Transaction audit trails and lifecycle timelines will be initialized automatically.
                </p>
              </div>
            )}

          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="px-8 py-4 bg-white dark:bg-[#0B0F19] border-t border-slate-200 dark:border-slate-800 flex justify-between shrink-0">
          <button 
            onClick={handlePrev}
            disabled={step === 1}
            className="px-5 py-2 rounded-lg text-xs font-semibold text-slate-650 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 disabled:pointer-events-none"
          >
            Back
          </button>
          
          {step < 8 ? (
            <button 
              onClick={handleNext}
              className="bg-[#18181B] hover:bg-[#27272A] dark:bg-indigo-650 dark:hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-sm"
            >
              Continue
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-sm disabled:opacity-50"
            >
              {isLoading ? 'Onboarding...' : 'Onboard Employee Twin'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
