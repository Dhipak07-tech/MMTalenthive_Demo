import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, SlidersHorizontal, MapPin, Building, ShieldCheck, 
  Award, FileText, Network, Clock, Plus, Edit2, Key, CheckCircle,
  Mail, Briefcase, AlertCircle, Eye, EyeOff, LayoutGrid, List, 
  FileSpreadsheet, Trash2, Calendar, UserPlus, LogOut, CheckCircle2, 
  ChevronRight, User, Trash, Users, ArrowLeft, PlusCircle, ShieldAlert,
  GraduationCap, BriefcaseIcon, FileWarning, HelpCircle
} from 'lucide-react';
import { 
  useGetEmployeesQuery, 
  useUpdateEmployeeMutation,
  useTransferEmployeeMutation,
  usePromoteEmployeeMutation,
  useChangeManagerMutation,
  useTerminateEmployeeMutation,
  useGetCompletionScoreQuery
} from './employeesApi';
import { 
  useGetOrganizationsQuery, 
  useGetBusinessUnitsQuery, 
  useGetDivisionsQuery, 
  useGetDepartmentsQuery, 
  useGetLocationsQuery, 
  useGetGradesQuery, 
  useGetBandsQuery,
  useGetDesignationsQuery
} from '../org-dna/orgDnaApi';

export function EmployeeDirectory() {
  const navigate = useNavigate();
  const { data: liveEmployees, isLoading, error, refetch } = useGetEmployeesQuery();
  
  // State variables
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [maskSensitive, setMaskSensitive] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'identity' | 'dna' | 'skills' | 'certs' | 'docs' | 'relations' | 'timeline' | 'audit'>('overview');
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Modals state
  const [activeModal, setActiveModal] = useState<'transfer' | 'promote' | 'manager' | 'terminate' | 'editIdentity' | 'addSkill' | 'addCert' | 'addDoc' | 'addRelation' | 'none'>('none');
  
  // Form states
  const [transferDept, setTransferDept] = useState('');
  const [transferLoc, setTransferLoc] = useState('');
  
  const [promoteDesignation, setPromoteDesignation] = useState('');
  const [promoteGrade, setPromoteGrade] = useState('');
  
  const [newManagerId, setNewManagerId] = useState('');
  
  const [terminateDate, setTerminateDate] = useState('');
  const [terminateReason, setTerminateReason] = useState('');
  
  // Skills / Certs / Docs Form states
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState<'TECHNICAL' | 'FUNCTIONAL' | 'SOFT' | 'LANGUAGE'>('TECHNICAL');
  const [newSkillLevel, setNewSkillLevel] = useState('INTERMEDIATE');
  const [newSkillRating, setNewSkillRating] = useState(7);
  const [newSkillExp, setNewSkillExp] = useState(3);

  const [newCertName, setNewCertName] = useState('');
  const [newCertAuthority, setNewCertAuthority] = useState('');
  const [newCertId, setNewCertId] = useState('');
  const [newCertIssueDate, setNewCertIssueDate] = useState('');
  const [newCertExpiryDate, setNewCertExpiryDate] = useState('');
  const [newCertUrl, setNewCertUrl] = useState('');

  const [newDocName, setNewDocName] = useState('');
  const [newDocType, setNewDocType] = useState('IDENTITY');
  const [newDocExpiry, setNewDocExpiry] = useState('');

  const [newRelType, setNewRelType] = useState<'MANAGER' | 'BUDDY' | 'MENTOR' | 'REVIEWER' | 'HRBP' | 'PROJECT_MANAGER' | 'DOTTED_LINE_MANAGER' | 'SKIP_LEVEL_MANAGER'>('BUDDY');
  const [newRelEmpId, setNewRelEmpId] = useState('');
  const [newRelNotes, setNewRelNotes] = useState('');

  // Edit Identity state
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editMiddleName, setEditMiddleName] = useState('');
  const [editDOB, setEditDOB] = useState('');
  const [editGender, setEditGender] = useState('');
  const [editNationality, setEditNationality] = useState('');
  const [editMaritalStatus, setEditMaritalStatus] = useState('');
  const [editBloodGroup, setEditBloodGroup] = useState('');
  const [editPreferredLang, setEditPreferredLang] = useState('');
  const [editPersonalEmail, setEditPersonalEmail] = useState('');
  const [editWorkPhone, setEditWorkPhone] = useState('');
  const [editPersonalPhone, setEditPersonalPhone] = useState('');
  const [editCurrentAddress, setEditCurrentAddress] = useState('');
  const [editPermanentAddress, setEditPermanentAddress] = useState('');
  const [editEmergencyName, setEditEmergencyName] = useState('');
  const [editEmergencyPhone, setEditEmergencyPhone] = useState('');
  const [editEmergencyRelation, setEditEmergencyRelation] = useState('');

  // DNA mapping queries
  const { data: orgs } = useGetOrganizationsQuery();
  const activeOrgId = selectedEmployee?.organizationId || orgs?.[0]?.id || '';
  const { data: allBUs } = useGetBusinessUnitsQuery(activeOrgId, { skip: !activeOrgId });
  const { data: allLocations } = useGetLocationsQuery(activeOrgId, { skip: !activeOrgId });
  const { data: allGrades } = useGetGradesQuery(activeOrgId, { skip: !activeOrgId });
  const { data: allBands } = useGetBandsQuery(activeOrgId, { skip: !activeOrgId });
  const { data: allDesignations } = useGetDesignationsQuery(activeOrgId, { skip: !activeOrgId });
  
  // Eager child DNA endpoints scoped to employee selection
  const { data: employeeDivs } = useGetDivisionsQuery(selectedEmployee?.businessUnitId || '', { skip: !selectedEmployee?.businessUnitId });
  const { data: employeeDepts } = useGetDepartmentsQuery(selectedEmployee?.divisionId || '', { skip: !selectedEmployee?.divisionId });

  // Completion score
  const { data: completionScore = 70 } = useGetCompletionScoreQuery(selectedEmployee?.id || '', { skip: !selectedEmployee?.id });

  // Mutations
  const [updateEmployee] = useUpdateEmployeeMutation();
  const [transferEmployee] = useTransferEmployeeMutation();
  const [promoteEmployee] = usePromoteEmployeeMutation();
  const [changeManager] = useChangeManagerMutation();
  const [terminateEmployee] = useTerminateEmployeeMutation();

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const getBUName = (id: string) => allBUs?.find(b => b.id === id)?.name || 'General Software Engineering';
  const getDivName = (id: string) => employeeDivs?.find(d => d.id === id)?.name || 'Technology Infrastructure';
  const getDeptName = (id: string) => employeeDepts?.find(d => d.id === id)?.name || 'Platform Engineering';
  const getLocName = (id: string) => allLocations?.find(l => l.id === id)?.name || 'San Francisco, CA';
  const getGradeName = (id: string) => allGrades?.find(g => g.id === id)?.name || 'Grade 4 (E4)';
  const getBandName = (id: string) => allBands?.find(b => b.id === id)?.name || 'Level 2 Band';
  const getDesigName = (id: string) => allDesignations?.find(d => d.id === id)?.name || 'Senior Staff Engineer';

  // Normalize employees
  const employees = (liveEmployees || []).map((emp: any) => {
    const des = allDesignations?.find(d => d.id === emp.designationId)?.name || emp.designation || 'Staff Engineer';
    const loc = allLocations?.find(l => l.id === emp.locationId)?.name || emp.location || 'San Francisco, CA';
    const dept = employeeDepts?.find(d => d.id === emp.departmentId)?.name || emp.department || 'Engineering';
    return {
      ...emp,
      displayName: emp.displayName || `${emp.firstName} ${emp.lastName}`,
      department: dept,
      location: loc,
      designation: des,
      skills: emp.skills || [],
      certifications: emp.certifications || [],
      documents: emp.documents || [],
      relationships: emp.relationships || [],
      timeline: emp.timeline || [],
      customFields: emp.customFields || []
    };
  });

  // Filtering, sorting and search
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter ? emp.employmentStatus === statusFilter : true;
    const matchesLocation = locationFilter ? emp.locationId === locationFilter : true;
    const matchesDept = deptFilter ? emp.departmentId === deptFilter : true;
    const matchesType = typeFilter ? emp.employmentTypeId === typeFilter : true;

    return matchesSearch && matchesStatus && matchesLocation && matchesDept && matchesType;
  });

  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    if (sortBy === 'name') {
      return a.displayName.localeCompare(b.displayName);
    } else if (sortBy === 'code') {
      return a.employeeCode.localeCompare(b.employeeCode);
    } else if (sortBy === 'doj') {
      const dateA = a.dateOfJoining ? new Date(a.dateOfJoining).getTime() : 0;
      const dateB = b.dateOfJoining ? new Date(b.dateOfJoining).getTime() : 0;
      return dateB - dateA;
    }
    return 0;
  });

  // Pagination bounds
  const totalPages = Math.max(1, Math.ceil(sortedEmployees.length / itemsPerPage));
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmployees = sortedEmployees.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(currentEmployees.map(emp => emp.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(x => x !== id));
    }
  };

  // Export CSV Action
  const exportToCSV = (listToExport = sortedEmployees) => {
    if (listToExport.length === 0) return;
    const headers = ['Employee Code', 'Full Name', 'Work Email', 'Department', 'Location', 'Designation', 'Joining Date', 'Status'];
    const rows = listToExport.map(emp => [
      emp.employeeCode,
      emp.displayName,
      emp.workEmail,
      emp.department,
      emp.location,
      emp.designation,
      emp.dateOfJoining || 'N/A',
      emp.employmentStatus
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Employee_Twins_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("Employee list exported to CSV successfully.");
  };

  // Bulk actions
  const handleBulkTerminate = async () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Are you sure you want to bulk terminate the ${selectedIds.length} selected employees?`)) {
      try {
        for (const id of selectedIds) {
          await terminateEmployee({ id, exitDate: new Date().toISOString().split('T')[0], reason: 'Bulk termination action' }).unwrap();
        }
        setSelectedIds([]);
        refetch();
        triggerToast("Bulk termination operation completed.");
      } catch (err) {
        console.error(err);
        triggerToast("Failed to complete bulk termination.");
      }
    }
  };

  const handleBulkChangeManager = async () => {
    if (selectedIds.length === 0) return;
    const mgrId = prompt("Enter the New Manager Employee UUID:");
    if (!mgrId) return;
    try {
      for (const id of selectedIds) {
        await changeManager({ id, managerId: mgrId }).unwrap();
      }
      setSelectedIds([]);
      refetch();
      triggerToast("Bulk manager change completed.");
    } catch (err) {
      console.error(err);
      triggerToast("Failed to complete bulk manager change.");
    }
  };

  // Profile completion recommendations
  const getRecommendations = (emp: any) => {
    const list: string[] = [];
    if (!emp.panNumber) list.push("Add Tax ID (PAN) (+15%)");
    if (!emp.aadhaarNumber) list.push("Add National ID (Aadhaar) (+15%)");
    if (!emp.bankAccountNumber) list.push("Setup Banking Details (+10%)");
    if (emp.skills.length === 0) list.push("Register Skills Competency (+5%)");
    if (emp.documents.length === 0) list.push("Upload Compliance Documents (+10%)");
    if (!emp.emergencyContactPhone) list.push("Register Emergency Contacts (+15%)");
    return list;
  };

  // Action submissions
  const submitTransfer = async () => {
    if (!selectedEmployee || !transferDept || !transferLoc) return;
    try {
      const res = await transferEmployee({
        id: selectedEmployee.id,
        departmentId: transferDept,
        locationId: transferLoc
      }).unwrap();
      setSelectedEmployee(res);
      setActiveModal('none');
      triggerToast("Employee transferred successfully.");
    } catch (err) {
      console.error(err);
      triggerToast("Failed to complete transfer.");
    }
  };

  const submitPromotion = async () => {
    if (!selectedEmployee || !promoteDesignation || !promoteGrade) return;
    try {
      const res = await promoteEmployee({
        id: selectedEmployee.id,
        designationId: promoteDesignation,
        gradeId: promoteGrade
      }).unwrap();
      setSelectedEmployee(res);
      setActiveModal('none');
      triggerToast("Employee promoted successfully.");
    } catch (err) {
      console.error(err);
      triggerToast("Failed to complete promotion.");
    }
  };

  const submitChangeManager = async () => {
    if (!selectedEmployee || !newManagerId) return;
    try {
      const res = await changeManager({
        id: selectedEmployee.id,
        managerId: newManagerId
      }).unwrap();
      setSelectedEmployee(res);
      setActiveModal('none');
      triggerToast("Manager changed successfully.");
    } catch (err) {
      console.error(err);
      triggerToast("Failed to update manager.");
    }
  };

  const submitTermination = async () => {
    if (!selectedEmployee || !terminateDate || !terminateReason) return;
    try {
      const res = await terminateEmployee({
        id: selectedEmployee.id,
        exitDate: terminateDate,
        reason: terminateReason
      }).unwrap();
      setSelectedEmployee(res);
      setActiveModal('none');
      triggerToast("Employee termination processed.");
    } catch (err) {
      console.error(err);
      triggerToast("Failed to terminate employee.");
    }
  };

  const openEditIdentityModal = () => {
    setEditFirstName(selectedEmployee.firstName || '');
    setEditLastName(selectedEmployee.lastName || '');
    setEditMiddleName(selectedEmployee.middleName || '');
    setEditDOB(selectedEmployee.dateOfBirth || '');
    setEditGender(selectedEmployee.gender || 'MALE');
    setEditNationality(selectedEmployee.nationality || '');
    setEditMaritalStatus(selectedEmployee.maritalStatus || 'SINGLE');
    setEditBloodGroup(selectedEmployee.bloodGroup || '');
    setEditPreferredLang(selectedEmployee.preferredLanguage || '');
    setEditPersonalEmail(selectedEmployee.personalEmail || '');
    setEditWorkPhone(selectedEmployee.workPhone || '');
    setEditPersonalPhone(selectedEmployee.personalPhone || '');
    setEditCurrentAddress(selectedEmployee.currentAddress || '');
    setEditPermanentAddress(selectedEmployee.permanentAddress || '');
    setEditEmergencyName(selectedEmployee.emergencyContactName || '');
    setEditEmergencyPhone(selectedEmployee.emergencyContactPhone || '');
    setEditEmergencyRelation(selectedEmployee.emergencyContactRelation || '');
    
    setActiveModal('editIdentity');
  };

  const submitEditIdentity = async () => {
    try {
      const updatedBody = {
        ...selectedEmployee,
        firstName: editFirstName,
        lastName: editLastName,
        middleName: editMiddleName,
        displayName: `${editFirstName} ${editLastName}`,
        dateOfBirth: editDOB || undefined,
        gender: editGender,
        nationality: editNationality,
        maritalStatus: editMaritalStatus,
        bloodGroup: editBloodGroup,
        preferredLanguage: editPreferredLang,
        personalEmail: editPersonalEmail || undefined,
        workPhone: editWorkPhone || undefined,
        personalPhone: editPersonalPhone || undefined,
        currentAddress: editCurrentAddress || undefined,
        permanentAddress: editPermanentAddress || undefined,
        emergencyContactName: editEmergencyName || undefined,
        emergencyContactPhone: editEmergencyPhone || undefined,
        emergencyContactRelation: editEmergencyRelation || undefined
      };
      
      const res = await updateEmployee({ id: selectedEmployee.id, body: updatedBody }).unwrap();
      setSelectedEmployee(res);
      setActiveModal('none');
      triggerToast("Identity information updated successfully.");
    } catch (err) {
      console.error(err);
      triggerToast("Failed to save changes.");
    }
  };

  const submitAddSkill = async () => {
    if (!newSkillName.trim()) return;
    try {
      const newSkill = {
        skillName: newSkillName,
        skillCategory: newSkillCategory,
        proficiencyLevel: newSkillLevel,
        yearsOfExperience: newSkillExp,
        selfRating: newSkillRating,
        verified: false
      };
      
      const currentSkills = selectedEmployee.skills || [];
      const updatedBody = {
        ...selectedEmployee,
        skills: [...currentSkills, newSkill]
      };
      
      const res = await updateEmployee({ id: selectedEmployee.id, body: updatedBody }).unwrap();
      setSelectedEmployee(res);
      setNewSkillName('');
      setActiveModal('none');
      triggerToast("Competency skill added to twin registry.");
    } catch (err) {
      console.error(err);
      triggerToast("Failed to add skill.");
    }
  };

  const submitAddCert = async () => {
    if (!newCertName.trim() || !newCertAuthority.trim()) return;
    try {
      const newCert = {
        certificationName: newCertName,
        issuingAuthority: newCertAuthority,
        credentialId: newCertId || undefined,
        issueDate: newCertIssueDate || undefined,
        expiryDate: newCertExpiryDate || undefined,
        credentialUrl: newCertUrl || undefined,
        verified: false
      };

      const currentCerts = selectedEmployee.certifications || [];
      const updatedBody = {
        ...selectedEmployee,
        certifications: [...currentCerts, newCert]
      };

      const res = await updateEmployee({ id: selectedEmployee.id, body: updatedBody }).unwrap();
      setSelectedEmployee(res);
      setNewCertName('');
      setNewCertAuthority('');
      setNewCertId('');
      setNewCertIssueDate('');
      setNewCertExpiryDate('');
      setNewCertUrl('');
      setActiveModal('none');
      triggerToast("Certification registered successfully.");
    } catch (err) {
      console.error(err);
      triggerToast("Failed to register certification.");
    }
  };

  const submitAddDoc = async () => {
    if (!newDocName.trim()) return;
    try {
      const newDoc = {
        documentName: newDocName,
        documentType: newDocType,
        filePath: `docs/${selectedEmployee.id}/${newDocName}`,
        fileSize: 2048576, // 2MB
        mimeType: 'application/pdf',
        expiryDate: newDocExpiry || undefined,
        verificationStatus: 'VERIFIED'
      };

      const currentDocs = selectedEmployee.documents || [];
      const updatedBody = {
        ...selectedEmployee,
        documents: [...currentDocs, newDoc]
      };

      const res = await updateEmployee({ id: selectedEmployee.id, body: updatedBody }).unwrap();
      setSelectedEmployee(res);
      setNewDocName('');
      setNewDocExpiry('');
      setActiveModal('none');
      triggerToast("Document uploaded to secure vault.");
    } catch (err) {
      console.error(err);
      triggerToast("Failed to upload document.");
    }
  };

  const submitAddRelation = async () => {
    if (!newRelEmpId) return;
    try {
      const newRel = {
        relationshipType: newRelType,
        relatedEmployeeId: newRelEmpId,
        primary: true,
        notes: newRelNotes || undefined
      };

      const currentRels = selectedEmployee.relationships || [];
      const updatedBody = {
        ...selectedEmployee,
        relationships: [...currentRels, newRel]
      };

      const res = await updateEmployee({ id: selectedEmployee.id, body: updatedBody }).unwrap();
      setSelectedEmployee(res);
      setNewRelEmpId('');
      setNewRelNotes('');
      setActiveModal('none');
      triggerToast("Relationship mapped successfully.");
    } catch (err) {
      console.error(err);
      triggerToast("Failed to map relationship.");
    }
  };

  // Remove collections
  const removeSkill = async (skillIdx: number) => {
    if (confirm("Are you sure you want to remove this skill?")) {
      try {
        const updatedSkills = (selectedEmployee.skills || []).filter((_: any, idx: number) => idx !== skillIdx);
        const updatedBody = { ...selectedEmployee, skills: updatedSkills };
        const res = await updateEmployee({ id: selectedEmployee.id, body: updatedBody }).unwrap();
        setSelectedEmployee(res);
        triggerToast("Skill removed successfully.");
      } catch (err) {
        console.error(err);
        triggerToast("Failed to remove skill.");
      }
    }
  };

  const removeCert = async (certIdx: number) => {
    if (confirm("Are you sure you want to remove this certification?")) {
      try {
        const updatedCerts = (selectedEmployee.certifications || []).filter((_: any, idx: number) => idx !== certIdx);
        const updatedBody = { ...selectedEmployee, certifications: updatedCerts };
        const res = await updateEmployee({ id: selectedEmployee.id, body: updatedBody }).unwrap();
        setSelectedEmployee(res);
        triggerToast("Certification removed.");
      } catch (err) {
        console.error(err);
        triggerToast("Failed to remove certification.");
      }
    }
  };

  const removeDoc = async (docIdx: number) => {
    if (confirm("Are you sure you want to delete this document?")) {
      try {
        const updatedDocs = (selectedEmployee.documents || []).filter((_: any, idx: number) => idx !== docIdx);
        const updatedBody = { ...selectedEmployee, documents: updatedDocs };
        const res = await updateEmployee({ id: selectedEmployee.id, body: updatedBody }).unwrap();
        setSelectedEmployee(res);
        triggerToast("Document deleted from vault.");
      } catch (err) {
        console.error(err);
        triggerToast("Failed to delete document.");
      }
    }
  };

  const removeRel = async (relIdx: number) => {
    if (confirm("Are you sure you want to delete this relationship edge?")) {
      try {
        const updatedRels = (selectedEmployee.relationships || []).filter((_: any, idx: number) => idx !== relIdx);
        const updatedBody = { ...selectedEmployee, relationships: updatedRels };
        const res = await updateEmployee({ id: selectedEmployee.id, body: updatedBody }).unwrap();
        setSelectedEmployee(res);
        triggerToast("Relationship mapping deleted.");
      } catch (err) {
        console.error(err);
        triggerToast("Failed to delete mapping.");
      }
    }
  };

  const getRandomGradient = (name: string) => {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      'from-[#3B82F6] to-[#2DD4BF]',
      'from-[#10B981] to-[#06B6D4]',
      'from-[#8B5CF6] to-[#6366F1]',
      'from-[#F43F5E] to-[#F59E0B]',
      'from-[#4F46E5] to-[#3730A3]'
    ];
    return colors[hash % colors.length];
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto text-slate-900 dark:text-white">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-indigo-650 text-white px-5 py-3 rounded-xl shadow-2xl z-55 flex items-center gap-2 border border-indigo-505 animate-slide-in text-xs font-semibold">
          <CheckCircle className="w-4 h-4 text-emerald-300" />
          {toastMessage}
        </div>
      )}

      {/* Directory View */}
      {!selectedEmployee ? (
        <div className="space-y-6 animate-fade-in">
          {/* Main Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Employee Master Workspace</h1>
              <p className="text-xs text-slate-405 mt-1 font-semibold">
                Single Source of Truth (SSOT) database for all organizational Digital Twins.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => exportToCSV()}
                className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F19] hover:bg-slate-50 dark:hover:bg-slate-900 px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition-all active:scale-[0.98]"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" /> Export CSV
              </button>
              
              <button 
                onClick={() => navigate('/onboarding')}
                className="flex items-center gap-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white px-4 py-2 rounded-lg text-xs font-extrabold shadow-sm hover:shadow transition-all active:scale-[0.98]"
              >
                <UserPlus className="w-3.5 h-3.5" /> Onboarding Pipeline
              </button>
            </div>
          </div>

          {/* Search, Sort and Layout Controls */}
          <div className="bg-white dark:bg-[#0B0F19] border border-slate-200/80 dark:border-slate-850 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center shadow-sm">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search Digital Twins by name, code, department, role..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-9 pr-4 py-2.5 w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none focus:border-indigo-550 dark:focus:border-indigo-500 transition-colors font-semibold"
              />
            </div>
            
            {/* Sort & View Switches */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
              <select 
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded-lg px-3 py-2 text-xs outline-none font-semibold text-slate-700 dark:text-slate-350"
              >
                <option value="name">Sort by: Name</option>
                <option value="code">Sort by: Code</option>
                <option value="doj">Sort by: Joining Date</option>
              </select>

              <div className="flex items-center border border-slate-200 dark:border-slate-850 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-900">
                <button 
                  onClick={() => setViewMode('card')}
                  className={`p-2 transition-all ${viewMode === 'card' ? 'bg-indigo-650 text-white' : 'text-slate-400 hover:text-slate-700'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode('table')}
                  className={`p-2 transition-all ${viewMode === 'table' ? 'bg-indigo-650 text-white' : 'text-slate-400 hover:text-slate-700'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Filters Drawer */}
          <div className="bg-slate-50 dark:bg-[#090D14] border border-slate-200/60 dark:border-slate-855/60 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold">
            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Status</label>
              <select 
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs outline-none text-slate-750 dark:text-slate-350"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="ON_PROBATION">On Probation</option>
                <option value="ON_LEAVE">On Leave</option>
                <option value="TERMINATED">Terminated</option>
              </select>
            </div>
            
            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Location</label>
              <select 
                value={locationFilter}
                onChange={e => { setLocationFilter(e.target.value); setCurrentPage(1); }}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs outline-none text-slate-750 dark:text-slate-350"
              >
                <option value="">All Locations</option>
                {allLocations?.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Designation</label>
              <select 
                value={typeFilter}
                onChange={e => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs outline-none text-slate-750 dark:text-slate-350"
              >
                <option value="">All Roles</option>
                {allDesignations?.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Clear Filters</label>
              <button 
                onClick={() => {
                  setStatusFilter('');
                  setLocationFilter('');
                  setDeptFilter('');
                  setTypeFilter('');
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                className="w-full border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-300 py-2 rounded-lg text-xs"
              >
                Reset Dashboard
              </button>
            </div>
          </div>

          {/* Bulk Action Trigger Bar */}
          {selectedIds.length > 0 && (
            <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/40 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold animate-slide-in shadow-sm">
              <span className="text-indigo-750 dark:text-indigo-400">
                Selected {selectedIds.length} employee twins for bulk actions.
              </span>
              <div className="flex gap-3">
                <button 
                  onClick={() => exportToCSV(employees.filter(e => selectedIds.includes(e.id)))}
                  className="bg-white dark:bg-slate-900 hover:bg-slate-50 text-indigo-700 dark:text-indigo-300 border border-slate-200 dark:border-slate-800 px-3.5 py-2 rounded-lg"
                >
                  Export Selected
                </button>
                <button 
                  onClick={handleBulkChangeManager}
                  className="bg-[#27272A] hover:bg-[#3F3F46] dark:bg-slate-800 dark:hover:bg-slate-700 text-white px-3.5 py-2 rounded-lg"
                >
                  Re-assign Manager
                </button>
                <button 
                  onClick={handleBulkTerminate}
                  className="bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-2 rounded-lg"
                >
                  Bulk Terminate
                </button>
              </div>
            </div>
          )}

          {/* Directory Listings */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white dark:bg-[#0B0F19] border border-slate-200/80 dark:border-slate-850 rounded-xl p-5 shadow-sm space-y-4 animate-pulse">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-100 dark:bg-slate-850 rounded w-2/3" />
                      <div className="h-3 bg-slate-50 dark:bg-slate-900 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-8 bg-slate-50 dark:bg-slate-900 rounded" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-white dark:bg-[#0B0F19] border border-slate-200/85 dark:border-slate-855 rounded-xl p-12 text-center max-w-lg mx-auto space-y-4 shadow-sm">
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">API Sync Failure</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                Could not connect to the Employee Master Aggregate registry. Please confirm that the backend services are running.
              </p>
            </div>
          ) : currentEmployees.length === 0 ? (
            <div className="bg-white dark:bg-[#0B0F19] border border-slate-200/85 dark:border-slate-855 rounded-xl p-12 text-center max-w-lg mx-auto space-y-4 shadow-sm">
              <div className="text-4xl">👥</div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white font-mono">No Matching Digital Twins</h3>
              <p className="text-xs text-slate-450 leading-relaxed font-semibold">
                No active employee twins match your selected filter criteria. Modify your filters or search query.
              </p>
            </div>
          ) : viewMode === 'card' ? (
            /* Card View */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {currentEmployees.map(emp => {
                const isSelected = selectedIds.includes(emp.id);
                return (
                  <div 
                    key={emp.id}
                    className={`bg-white dark:bg-[#0B0F19] rounded-xl border p-5 hover:shadow-xl hover:border-indigo-500/35 transition-all duration-300 cursor-pointer relative group flex flex-col justify-between h-[180px] ${
                      isSelected ? 'border-indigo-650 ring-2 ring-indigo-500/10' : 'border-slate-200/80 dark:border-slate-850'
                    }`}
                  >
                    {/* Checkbox selector */}
                    <div 
                      onClick={(e) => e.stopPropagation()} 
                      className="absolute top-4 right-4"
                    >
                      <input 
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleSelectOne(emp.id, e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-slate-350 dark:border-slate-800 text-indigo-655 focus:ring-indigo-500 cursor-pointer"
                      />
                    </div>

                    <div 
                      onClick={() => setSelectedEmployee(emp)} 
                      className="flex items-start gap-4 flex-1"
                    >
                      {emp.avatarUrl ? (
                        <img 
                          src={emp.avatarUrl} 
                          alt={emp.displayName} 
                          className="w-12 h-12 rounded-xl object-cover ring-2 ring-indigo-500/5 group-hover:ring-indigo-500/20 transition-all shrink-0" 
                        />
                      ) : (
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${getRandomGradient(emp.displayName)} flex items-center justify-center text-white text-base font-extrabold shrink-0`}>
                          {getInitials(emp.displayName)}
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 justify-start">
                          <span className="text-[10px] font-mono font-extrabold text-indigo-650 dark:text-indigo-400">{emp.employeeCode}</span>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide ${
                            emp.employmentStatus === 'ACTIVE' 
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' 
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-955/20 dark:text-rose-400'
                          }`}>
                            {emp.employmentStatus}
                          </span>
                        </div>
                        <h3 className="text-sm font-extrabold text-slate-850 dark:text-white mt-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                          {emp.displayName}
                        </h3>
                        <p className="text-xs text-slate-450 font-semibold mt-0.5 truncate">{emp.designation}</p>
                      </div>
                    </div>

                    {/* Footer DNA details */}
                    <div 
                      onClick={() => setSelectedEmployee(emp)} 
                      className="border-t border-slate-100 dark:border-slate-850/60 pt-3 mt-3 grid grid-cols-2 gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-semibold"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{emp.department}</span>
                      </div>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{emp.location}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="bg-white dark:bg-[#0B0F19] border border-slate-200/80 dark:border-slate-850 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-semibold">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/85 dark:border-slate-855 text-slate-450 uppercase text-[9px] font-bold tracking-wider">
                      <th className="p-4 w-10">
                        <input 
                          type="checkbox"
                          onChange={handleSelectAll}
                          checked={selectedIds.length === currentEmployees.length && currentEmployees.length > 0}
                          className="rounded text-indigo-650 cursor-pointer"
                        />
                      </th>
                      <th className="p-4">Employee</th>
                      <th className="p-4">Code</th>
                      <th className="p-4">Department</th>
                      <th className="p-4">Designation</th>
                      <th className="p-4">Location</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Joining Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-700 dark:text-slate-350">
                    {currentEmployees.map(emp => {
                      const isSelected = selectedIds.includes(emp.id);
                      return (
                        <tr 
                          key={emp.id}
                          onClick={() => setSelectedEmployee(emp)}
                          className={`hover:bg-slate-50/60 dark:hover:bg-slate-900/35 transition-all cursor-pointer ${isSelected ? 'bg-indigo-50/30 dark:bg-indigo-950/10' : ''}`}
                        >
                          <td className="p-4" onClick={e => e.stopPropagation()}>
                            <input 
                              type="checkbox"
                              checked={isSelected}
                              onChange={e => handleSelectOne(emp.id, e.target.checked)}
                              className="rounded text-indigo-650 cursor-pointer"
                            />
                          </td>
                          <td className="p-4 flex items-center gap-3">
                            {emp.avatarUrl ? (
                              <img src={emp.avatarUrl} alt={emp.displayName} className="w-8 h-8 rounded-lg object-cover" />
                            ) : (
                              <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${getRandomGradient(emp.displayName)} flex items-center justify-center text-white text-[10px] font-bold`}>
                                {getInitials(emp.displayName)}
                              </div>
                            )}
                            <div>
                              <p className="font-extrabold text-slate-855 dark:text-white text-xs">{emp.displayName}</p>
                              <p className="text-[10px] text-slate-450 mt-0.5">{emp.workEmail}</p>
                            </div>
                          </td>
                          <td className="p-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">{emp.employeeCode}</td>
                          <td className="p-4">{emp.department}</td>
                          <td className="p-4">{emp.designation}</td>
                          <td className="p-4">{emp.location}</td>
                          <td className="p-4">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              emp.employmentStatus === 'ACTIVE' 
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' 
                                : 'bg-rose-50 text-rose-700 dark:bg-rose-955/20 dark:text-rose-400'
                            }`}>
                              {emp.employmentStatus}
                            </span>
                          </td>
                          <td className="p-4 font-semibold text-slate-500">{emp.dateOfJoining || 'N/A'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination bar */}
          <div className="flex items-center justify-between border-t border-slate-200/80 dark:border-slate-850 pt-4 text-xs font-semibold">
            <span className="text-slate-450">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedEmployees.length)} of {sortedEmployees.length} employee twins
            </span>
            <div className="flex gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-50 text-slate-700 dark:text-slate-300 font-bold"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                    currentPage === i + 1 
                      ? 'bg-[#4F46E5] text-white border-[#4F46E5]' 
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-350'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-50 text-slate-700 dark:text-slate-300 font-bold"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ── Employee 360 Workspace Cockpit View ───────────────── */
        <div className="space-y-6 animate-fade-in text-slate-850 dark:text-white">
          {/* Header Action bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-850 pb-4">
            <button 
              onClick={() => { setSelectedEmployee(null); setActiveTab('overview'); }}
              className="flex items-center gap-1.5 text-xs text-slate-450 hover:text-indigo-650 dark:hover:text-indigo-400 font-bold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Master Directory
            </button>
            
            <div className="flex flex-wrap items-center gap-2">
              <button 
                onClick={() => setMaskSensitive(!maskSensitive)}
                className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-800 px-3.5 py-2 rounded-lg text-xs text-slate-650 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all font-bold"
              >
                {maskSensitive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />} 
                {maskSensitive ? 'Reveal Compliance Keys' : 'Mask Compliance Keys'}
              </button>

              <button 
                onClick={openEditIdentityModal}
                className="flex items-center gap-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white px-3.5 py-2 rounded-lg text-xs font-bold transition-all active:scale-[0.98]"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Profile
              </button>
            </div>
          </div>

          {/* Employee Twin Core Profile Card Widget */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT PROFILE CARD */}
            <div className="bg-white dark:bg-[#0B0F19] rounded-xl border border-slate-200/80 dark:border-slate-850 p-6 flex flex-col justify-between shadow-sm space-y-6">
              <div className="flex flex-col items-center text-center space-y-4">
                {selectedEmployee.avatarUrl ? (
                  <img 
                    src={selectedEmployee.avatarUrl} 
                    alt={selectedEmployee.displayName} 
                    className="w-24 h-24 rounded-2xl object-cover ring-4 ring-indigo-500/10 shadow-md" 
                  />
                ) : (
                  <div className={`w-24 h-24 rounded-2xl bg-gradient-to-tr ${getRandomGradient(selectedEmployee.displayName)} flex items-center justify-center text-white text-3xl font-extrabold shadow-md shrink-0`}>
                    {getInitials(selectedEmployee.displayName)}
                  </div>
                )}
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white">{selectedEmployee.displayName}</h2>
                    <span className="text-[9px] font-mono font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-900/40 uppercase">
                      {selectedEmployee.employeeCode}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-450 dark:text-slate-300">{getDesigName(selectedEmployee.designationId)}</p>
                  
                  <div className="flex flex-wrap gap-2 text-[10px] text-slate-455 justify-center pt-2 font-semibold">
                    <span className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded"><Building className="w-3 h-3 text-indigo-550" /> {getDeptName(selectedEmployee.departmentId)}</span>
                    <span className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded"><MapPin className="w-3 h-3 text-rose-550" /> {getLocName(selectedEmployee.locationId)}</span>
                  </div>
                </div>
              </div>

              {/* Profile Completion Circular Gauge */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-450">Twin Completion</span>
                  <span className="text-indigo-650 dark:text-indigo-400">{completionScore}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-850 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-emerald-450 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${completionScore}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold leading-relaxed">
                  Calculated using weights: ID (20%), Contact (15%), DNA (25%), Compliance (15%), Banking (10%), Docs (10%), Skills (5%).
                </div>
              </div>

              {/* Quick DNA Actions */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Aggregate Actions</p>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  <button 
                    onClick={() => { setTransferDept(selectedEmployee.departmentId || ''); setTransferLoc(selectedEmployee.locationId || ''); setActiveModal('transfer'); }}
                    className="border border-slate-205 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/60 p-2 rounded-lg text-center"
                  >
                    Transfer
                  </button>
                  <button 
                    onClick={() => { setPromoteDesignation(selectedEmployee.designationId || ''); setPromoteGrade(selectedEmployee.gradeId || ''); setActiveModal('promote'); }}
                    className="border border-slate-205 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/60 p-2 rounded-lg text-center"
                  >
                    Promote
                  </button>
                  <button 
                    onClick={() => { setNewManagerId(selectedEmployee.managerId || ''); setActiveModal('manager'); }}
                    className="border border-slate-205 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/60 p-2 rounded-lg text-center"
                  >
                    Manager
                  </button>
                  <button 
                    onClick={() => { setTerminateDate(''); setTerminateReason(''); setActiveModal('terminate'); }}
                    className="border border-rose-200/50 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-955/20 text-rose-600 dark:text-rose-400 p-2 rounded-lg text-center"
                  >
                    Terminate
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT WORKSPACE CONSOLE */}
            <div className="lg:col-span-2 flex flex-col space-y-6">
              
              {/* Tab Selector Navigation */}
              <div className="border-b border-slate-200 dark:border-slate-800 flex flex-wrap gap-1 bg-white dark:bg-[#0B0F19] rounded-xl p-1.5 shadow-sm border border-slate-200/60 dark:border-slate-850">
                {[
                  { id: 'overview', label: 'Overview', icon: LayoutGrid },
                  { id: 'identity', label: 'Identity & Contacts', icon: User },
                  { id: 'dna', label: 'Employment DNA', icon: Briefcase },
                  { id: 'skills', label: 'Skills Cloud', icon: Award },
                  { id: 'certs', label: 'Certifications', icon: CheckCircle2 },
                  { id: 'docs', label: 'Document Vault', icon: FileText },
                  { id: 'relations', label: 'Relationship Graph', icon: Network },
                  { id: 'timeline', label: 'Timeline Log', icon: Clock },
                  { id: 'audit', label: 'Audit History', icon: ShieldCheck }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-extrabold transition-all outline-none ${
                      activeTab === tab.id
                        ? 'bg-[#4F46E5] text-white shadow-sm'
                        : 'text-slate-450 hover:text-slate-700 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900'
                    }`}
                  >
                    <tab.icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Dynamic Console Content Panel */}
              <div className="bg-white dark:bg-[#0B0F19] rounded-xl border border-slate-200/80 dark:border-slate-850 p-6 min-h-[400px] shadow-sm">
                
                {/* 1. OVERVIEW TAB */}
                {activeTab === 'overview' && (
                  <div className="space-y-6 animate-fade-in text-xs font-semibold">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Health Recommendations Card */}
                      <div className="bg-slate-50 dark:bg-slate-900/30 p-5 rounded-xl border border-slate-200/50 dark:border-slate-800/80 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-2">
                          <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Twin Health Summary</h4>
                          <span className="text-[10px] bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 px-2 py-0.5 rounded font-bold">
                            Score: {completionScore}%
                          </span>
                        </div>
                        {getRecommendations(selectedEmployee).length === 0 ? (
                          <div className="flex items-center gap-2 text-emerald-600">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            <span>Digital Twin profile is 100% complete and fully verified.</span>
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Pending Actions Required:</p>
                            {getRecommendations(selectedEmployee).map((rec, idx) => (
                              <div key={idx} className="flex gap-2 items-center text-slate-700 dark:text-slate-350">
                                <PlusCircle className="w-4 h-4 text-indigo-500 shrink-0" />
                                <span>{rec}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Employment DNA Brief */}
                      <div className="bg-slate-50 dark:bg-slate-900/30 p-5 rounded-xl border border-slate-200/50 dark:border-slate-800/80 space-y-3.5">
                        <div className="border-b border-slate-100 dark:border-slate-850 pb-2">
                          <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Employment Summary</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <p className="text-[9px] text-slate-450 uppercase font-bold">Joining Date</p>
                            <p className="mt-0.5">{selectedEmployee.dateOfJoining || 'Jan 15, 2024'}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-450 uppercase font-bold">Work Mode</p>
                            <p className="mt-0.5 font-bold">{selectedEmployee.workMode || 'HYBRID'}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-455 uppercase font-bold">Manager</p>
                            <p className="mt-0.5 truncate">{selectedEmployee.managerId ? 'Reporting Manager' : 'None Assigned'}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-455 uppercase font-bold">Grade / Band</p>
                            <p className="mt-0.5">{getGradeName(selectedEmployee.gradeId)} ({getBandName(selectedEmployee.bandId)})</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick overview of lists */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="border border-slate-200/60 dark:border-slate-850 p-4 rounded-xl space-y-2">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Assessed Skills</p>
                        <p className="text-xl font-extrabold text-slate-900 dark:text-white">{selectedEmployee.skills.length}</p>
                        <button onClick={() => setActiveTab('skills')} className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline">View Skills Cloud &rarr;</button>
                      </div>

                      <div className="border border-slate-200/60 dark:border-slate-850 p-4 rounded-xl space-y-2">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Certifications</p>
                        <p className="text-xl font-extrabold text-slate-900 dark:text-white">{selectedEmployee.certifications.length}</p>
                        <button onClick={() => setActiveTab('certs')} className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline">View Credentials &rarr;</button>
                      </div>

                      <div className="border border-slate-200/60 dark:border-slate-850 p-4 rounded-xl space-y-2">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Vault Documents</p>
                        <p className="text-xl font-extrabold text-slate-900 dark:text-white">{selectedEmployee.documents.length}</p>
                        <button onClick={() => setActiveTab('docs')} className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline">Open Vault &rarr;</button>
                      </div>
                    </div>

                    {/* Timeline Quick view */}
                    <div className="border border-slate-200/60 dark:border-slate-850 rounded-xl p-5 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-2">
                        <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Recent Lifecycle Events</h4>
                        <button onClick={() => setActiveTab('timeline')} className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline">View Timeline Log</button>
                      </div>
                      {selectedEmployee.timeline.length === 0 ? (
                        <p className="text-slate-400 text-xs py-2 text-center">No recorded lifecycle events.</p>
                      ) : (
                        <div className="space-y-3">
                          {selectedEmployee.timeline.slice(0, 3).map((evt: any, idx: number) => (
                            <div key={idx} className="flex gap-4 items-start text-xs font-semibold">
                              <span className="text-[10px] font-mono text-slate-400 shrink-0 mt-0.5">{evt.date || evt.eventDate || 'N/A'}</span>
                              <div>
                                <h5 className="font-extrabold text-slate-800 dark:text-slate-200">{evt.title}</h5>
                                <p className="text-[11px] text-slate-500 mt-0.5">{evt.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. IDENTITY & CONTACT TAB */}
                {activeTab === 'identity' && (
                  <div className="space-y-8 animate-fade-in text-xs font-semibold text-slate-700 dark:text-slate-300">
                    
                    {/* Personal Details */}
                    <div>
                      <h3 className="text-xs font-extrabold text-slate-450 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">Personal Attributes</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">First Name</p>
                          <p className="mt-1 font-bold text-slate-900 dark:text-white">{selectedEmployee.firstName}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Middle Name</p>
                          <p className="mt-1 font-bold text-slate-900 dark:text-white">{selectedEmployee.middleName || '-'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Last Name</p>
                          <p className="mt-1 font-bold text-slate-900 dark:text-white">{selectedEmployee.lastName}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Preferred Name</p>
                          <p className="mt-1 font-bold text-slate-900 dark:text-white">{selectedEmployee.displayName}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Date of Birth</p>
                          <p className="mt-1 font-bold text-slate-900 dark:text-white">{selectedEmployee.dateOfBirth || 'Not registered'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Gender</p>
                          <p className="mt-1 font-bold text-slate-900 dark:text-white">{selectedEmployee.gender || 'Not registered'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Nationality</p>
                          <p className="mt-1 font-bold text-slate-900 dark:text-white">{selectedEmployee.nationality || 'Not registered'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Marital Status</p>
                          <p className="mt-1 font-bold text-slate-900 dark:text-white">{selectedEmployee.maritalStatus || 'Not registered'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Blood Group</p>
                          <p className="mt-1 font-bold text-slate-900 dark:text-white">{selectedEmployee.bloodGroup || 'Not registered'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Preferred Language</p>
                          <p className="mt-1 font-bold text-slate-900 dark:text-white">{selectedEmployee.preferredLanguage || 'English'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Contact details */}
                    <div>
                      <h3 className="text-xs font-extrabold text-slate-450 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">Contact DNA</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Work Email</p>
                          <p className="mt-1 font-mono text-slate-900 dark:text-white font-bold">{selectedEmployee.workEmail}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Personal Email</p>
                          <p className="mt-1 font-mono text-slate-900 dark:text-white font-bold">{selectedEmployee.personalEmail || '-'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Work Phone</p>
                          <p className="mt-1 text-slate-900 dark:text-white font-bold">{selectedEmployee.workPhone || '-'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Personal Phone</p>
                          <p className="mt-1 text-slate-900 dark:text-white font-bold">{selectedEmployee.personalPhone || '-'}</p>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Addresses (Current & Permanent)</p>
                          <p className="mt-1 text-slate-900 dark:text-white leading-relaxed">
                            <span className="font-bold">Current:</span> {selectedEmployee.currentAddress || 'Not registered'} <br/>
                            <span className="font-bold mt-1 inline-block">Permanent:</span> {selectedEmployee.permanentAddress || 'Not registered'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Emergency Contacts */}
                    <div>
                      <h3 className="text-xs font-extrabold text-slate-450 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">Emergency Contacts</h3>
                      <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-202/60 dark:border-slate-800/80 max-w-md">
                        {selectedEmployee.emergencyContactName ? (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">Contact Name</p>
                              <p className="mt-0.5 font-bold text-slate-900 dark:text-white">{selectedEmployee.emergencyContactName}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">Relationship</p>
                              <p className="mt-0.5 font-bold text-slate-900 dark:text-white">{selectedEmployee.emergencyContactRelation}</p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-[10px] text-slate-400 font-bold uppercase">Mobile Number</p>
                              <p className="mt-0.5 font-bold text-slate-900 dark:text-white">{selectedEmployee.emergencyContactPhone}</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-slate-450 py-2">No emergency contacts registered. Please add emergency details.</p>
                        )}
                      </div>
                    </div>

                    {/* Compliance & Banking Keys */}
                    <div>
                      <h3 className="text-xs font-extrabold text-slate-455 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">Compliance & Banking Keys</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                        <div>
                          <p className="text-[10px] text-slate-450 font-bold uppercase">Tax ID (PAN)</p>
                          <p className="mt-1 font-mono font-bold text-slate-900 dark:text-white">
                            {maskSensitive ? '••••••••••' : selectedEmployee.panNumber || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-450 font-bold uppercase">National ID (Aadhaar)</p>
                          <p className="mt-1 font-mono font-bold text-slate-900 dark:text-white">
                            {maskSensitive ? '••••-••••-••••' : selectedEmployee.aadhaarNumber || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-455 font-bold uppercase">PF UAN Number</p>
                          <p className="mt-1 font-mono font-bold text-slate-900 dark:text-white">
                            {maskSensitive ? '••••••••••••' : selectedEmployee.uanNumber || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-455 font-bold uppercase">ESIC Number</p>
                          <p className="mt-1 font-mono font-bold text-slate-900 dark:text-white">
                            {maskSensitive ? '•••••••••••••••••' : selectedEmployee.esicNumber || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-455 font-bold uppercase">Passport Number</p>
                          <p className="mt-1 font-mono font-bold text-slate-900 dark:text-white">
                            {maskSensitive ? '••••••••' : selectedEmployee.passportNumber || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-455 font-bold uppercase">Passport Expiry</p>
                          <p className="mt-1 text-slate-900 dark:text-white font-bold">{selectedEmployee.passportExpiry || 'N/A'}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[10px] text-slate-455 font-bold uppercase">Bank Account Details</p>
                          <p className="mt-1 text-slate-900 dark:text-white leading-relaxed">
                            <span className="font-bold">Bank:</span> {selectedEmployee.bankName || 'N/A'} <br/>
                            <span className="font-bold">Account:</span> {maskSensitive ? '••••••••••••' : selectedEmployee.bankAccountNumber || 'N/A'} <br/>
                            <span className="font-bold">IFSC:</span> {selectedEmployee.bankIfsc || 'N/A'} (Branch: {selectedEmployee.bankBranch || 'N/A'})
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. EMPLOYMENT DNA TAB */}
                {activeTab === 'dna' && (
                  <div className="space-y-6 animate-fade-in text-xs font-semibold text-slate-700 dark:text-slate-355">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[
                        { label: 'Business Unit', val: getBUName(selectedEmployee.businessUnitId) },
                        { label: 'Division', val: getDivName(selectedEmployee.divisionId) },
                        { label: 'Department', val: getDeptName(selectedEmployee.departmentId) },
                        { label: 'Location', val: getLocName(selectedEmployee.locationId) },
                        { label: 'Designation', val: getDesigName(selectedEmployee.designationId) },
                        { label: 'Grade Level', val: getGradeName(selectedEmployee.gradeId) },
                        { label: 'Salary Band', val: getBandName(selectedEmployee.bandId) },
                        { label: 'Cost Center ID', val: selectedEmployee.costCenterId || 'CC-TECH-04' },
                        { label: 'Employment Type ID', val: selectedEmployee.employmentTypeId || 'FT-PERMANENT' },
                        { label: 'Work Mode', val: selectedEmployee.workMode || 'HYBRID' },
                        { label: 'Joining Date', val: selectedEmployee.dateOfJoining || 'Jan 15, 2024' },
                        { label: 'Manager UUID', val: selectedEmployee.managerId || 'None assigned' }
                      ].map((item, idx) => (
                        <div key={idx} className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-205 dark:border-slate-800">
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{item.label}</p>
                          <p className="text-xs font-bold text-slate-850 dark:text-slate-202 mt-1.5">{item.val}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. SKILLS CLOUD TAB */}
                {activeTab === 'skills' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <h3 className="text-xs font-extrabold text-slate-450 uppercase tracking-wider">Assessed Skills Cloud</h3>
                      <button 
                        onClick={() => setActiveModal('addSkill')}
                        className="text-xs text-[#4F46E5] dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Competency Skill
                      </button>
                    </div>

                    {selectedEmployee.skills.length === 0 ? (
                      <div className="py-12 text-center text-xs text-slate-450 font-medium border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                        No skills competencies registered for this twin aggregate.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedEmployee.skills.map((skill: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-105 dark:border-slate-800 rounded-xl text-xs font-semibold">
                            <div>
                              <p className="font-extrabold text-slate-850 dark:text-white text-xs">{skill.skillName || skill.name}</p>
                              <span className="text-[9px] uppercase font-bold text-slate-455 block mt-1">{skill.skillCategory || skill.category || 'TECHNICAL'}</span>
                              <p className="text-[9px] text-slate-400 mt-0.5 font-semibold">Exp: {skill.yearsOfExperience || 3} Years • Rating: {skill.selfRating || 7}/10</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-755 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-100/50">
                                {skill.proficiencyLevel || skill.level}
                              </span>
                              <button 
                                onClick={() => removeSkill(idx)}
                                className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                              >
                                <Trash className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 5. CERTIFICATIONS TAB */}
                {activeTab === 'certs' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <h3 className="text-xs font-extrabold text-slate-455 uppercase tracking-wider">Verification Certifications</h3>
                      <button 
                        onClick={() => setActiveModal('addCert')}
                        className="text-xs text-[#4F46E5] dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Register Certification
                      </button>
                    </div>

                    {selectedEmployee.certifications.length === 0 ? (
                      <div className="py-12 text-center text-xs text-slate-455 font-medium border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                        No credentials registered on this twin profile.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {selectedEmployee.certifications.map((cert: any, idx: number) => {
                          const isExpired = cert.expiryDate ? new Date(cert.expiryDate) < new Date() : false;
                          const isExpiringSoon = cert.expiryDate 
                            ? (new Date(cert.expiryDate).getTime() - new Date().getTime()) < (30 * 24 * 60 * 60 * 1000) && !isExpired
                            : false;
                          return (
                            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-200/60 dark:border-slate-800 rounded-xl gap-4">
                              <div className="flex items-start gap-3 text-xs font-semibold">
                                <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 flex items-center justify-center text-indigo-650 shrink-0">
                                  <Award className="w-5 h-5" />
                                </div>
                                <div className="space-y-0.5">
                                  <p className="font-extrabold text-slate-850 dark:text-white text-xs">{cert.certificationName}</p>
                                  <p className="text-[10px] text-slate-450">Authority: {cert.issuingAuthority} • ID: {cert.credentialId || 'N/A'}</p>
                                  <p className="text-[10px] text-slate-400">Issue: {cert.issueDate || 'N/A'} • Expiry: {cert.expiryDate || 'Never'}</p>
                                </div>
                              </div>

                              <div className="flex items-center justify-end gap-4">
                                {isExpired && (
                                  <span className="flex items-center gap-1 text-rose-650 bg-rose-50 dark:bg-rose-955/20 px-2.5 py-0.5 rounded text-[9px] font-bold border border-rose-100 dark:border-transparent">
                                    <FileWarning className="w-3 h-3" /> Expired
                                  </span>
                                )}
                                {isExpiringSoon && (
                                  <span className="flex items-center gap-1 text-amber-650 bg-amber-50 dark:bg-amber-955/20 px-2.5 py-0.5 rounded text-[9px] font-bold border border-amber-100 dark:border-transparent">
                                    <ShieldAlert className="w-3 h-3" /> Expiring Soon
                                  </span>
                                )}
                                {!isExpired && !isExpiringSoon && (
                                  <span className="flex items-center gap-1 text-emerald-650 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-0.5 rounded text-[9px] font-bold border border-emerald-100 dark:border-transparent">
                                    <CheckCircle className="w-3 h-3" /> Verified Active
                                  </span>
                                )}

                                <button 
                                  onClick={() => removeCert(idx)}
                                  className="text-slate-400 hover:text-rose-550 transition-colors p-1"
                                >
                                  <Trash className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* 6. DOCUMENT VAULT TAB */}
                {activeTab === 'docs' && (
                  <div className="space-y-6 animate-fade-in font-semibold text-slate-700 dark:text-slate-355">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <h3 className="text-xs font-extrabold text-slate-455 uppercase tracking-wider">Compliance Document Vault</h3>
                      <button 
                        onClick={() => setActiveModal('addDoc')}
                        className="text-xs text-[#4F46E5] dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Upload Document
                      </button>
                    </div>

                    {selectedEmployee.documents.length === 0 ? (
                      <div className="py-12 text-center text-xs text-slate-450 font-medium border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                        No compliance vault documents uploaded yet.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedEmployee.documents.map((doc: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-4 border border-slate-200/60 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-all text-xs">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-rose-50 dark:bg-rose-955/20 flex items-center justify-center text-rose-600 shrink-0">
                                <FileText className="w-4.5 h-4.5" />
                              </div>
                              <div>
                                <p className="font-extrabold text-slate-855 dark:text-white text-xs">{doc.documentName || doc.name}</p>
                                <p className="text-[10px] text-slate-450 mt-0.5">{doc.documentType || doc.type} • {doc.mimeType || 'application/pdf'} • {(doc.fileSize / 1024 / 1024).toFixed(1)}MB</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 text-xs font-bold">
                              <span className="flex items-center gap-1 text-emerald-650 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-transparent text-[10px]">
                                <CheckCircle className="w-3 h-3" /> {doc.verificationStatus || doc.status || 'PENDING'}
                              </span>
                              <span className="text-[10px] text-slate-450 hidden sm:inline">Expiry: {doc.expiryDate || doc.expiry || 'Never'}</span>
                              <button 
                                onClick={() => removeDoc(idx)}
                                className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                              >
                                <Trash className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 7. RELATIONSHIP GRAPH TAB */}
                {activeTab === 'relations' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <h3 className="text-xs font-extrabold text-slate-450 uppercase tracking-wider">Graph Relationship Network</h3>
                      <button 
                        onClick={() => setActiveModal('addRelation')}
                        className="text-xs text-[#4F46E5] dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Map Relationship Node
                      </button>
                    </div>

                    {/* Interactive Tree Graph visualization */}
                    <div className="bg-slate-50 dark:bg-slate-900/20 rounded-xl p-5 border border-slate-200/60 dark:border-slate-855 flex flex-col items-center justify-center space-y-6">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-2">Team hierarchy edge graph</p>
                      
                      {/* Manager node */}
                      <div className="bg-white dark:bg-slate-900 border border-slate-202 dark:border-slate-800 p-3 rounded-lg text-center max-w-[180px] shadow-sm">
                        <span className="text-[9px] bg-indigo-50 text-indigo-705 dark:bg-indigo-950/40 dark:text-indigo-400 px-2 py-0.5 rounded font-extrabold block mb-1">MANAGER</span>
                        <p className="text-xs font-bold text-slate-850 dark:text-white">Reporting Manager</p>
                      </div>

                      {/* Connector line */}
                      <div className="w-0.5 h-8 bg-indigo-550" />

                      {/* Employee active node */}
                      <div className="bg-gradient-to-r from-indigo-500 to-indigo-650 text-white p-4 rounded-xl text-center shadow-lg ring-4 ring-indigo-500/20 max-w-[200px]">
                        <p className="text-xs font-extrabold">{selectedEmployee.displayName}</p>
                        <p className="text-[9px] opacity-80 mt-1 uppercase font-bold">{getDesigName(selectedEmployee.designationId)}</p>
                      </div>

                      {/* Connector lines to peers */}
                      <div className="w-0.5 h-6 bg-indigo-550" />
                      <div className="w-1/2 h-0.5 bg-indigo-550" />
                      <div className="flex gap-12 pt-2">
                        <div className="flex flex-col items-center">
                          <div className="w-0.5 h-4 bg-indigo-550" />
                          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-lg text-center max-w-[130px] shadow-sm">
                            <span className="text-[8px] bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 px-1.5 py-0.5 rounded font-bold block mb-1">BUDDY</span>
                            <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Buddy Node</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-0.5 h-4 bg-indigo-550" />
                          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-lg text-center max-w-[130px] shadow-sm">
                            <span className="text-[8px] bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 px-1.5 py-0.5 rounded font-bold block mb-1">HRBP</span>
                            <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">HRBP Edge</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Listing of relationships */}
                    <div className="space-y-3">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">All Relationship Edges</p>
                      {selectedEmployee.relationships.length === 0 ? (
                        <div className="py-6 text-center text-xs text-slate-455 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                          No relationship links registered.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                          {selectedEmployee.relationships.map((rel: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-3 p-4 border border-slate-200/60 dark:border-slate-800 rounded-xl justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center font-bold text-slate-505 shrink-0">
                                  {getInitials(rel.name || 'Relation')}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-850 dark:text-white truncate">Target Employee ID</p>
                                  <p className="text-[10px] text-slate-405 truncate mt-0.5">{rel.relatedEmployeeId}</p>
                                  {rel.notes && <p className="text-[9px] text-indigo-505 mt-1 italic">"{rel.notes}"</p>}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[8px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-755 dark:bg-indigo-950/20 dark:text-indigo-400 border border-indigo-100/30">
                                  {rel.relationshipType || rel.type}
                                </span>
                                <button 
                                  onClick={() => removeRel(idx)}
                                  className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                                >
                                  <Trash className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 8. TIMELINE LOG TAB */}
                {activeTab === 'timeline' && (
                  <div className="space-y-6 animate-fade-in">
                    <h3 className="text-xs font-extrabold text-slate-450 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">Digital Twin Immutable Timeline</h3>
                    
                    {selectedEmployee.timeline.length === 0 ? (
                      <div className="py-12 text-center text-xs text-slate-450 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                        No lifecycle timeline entries recorded yet.
                      </div>
                    ) : (
                      <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 space-y-6 py-2">
                        {selectedEmployee.timeline.map((evt: any, idx: number) => {
                          let Icon = Clock;
                          if (evt.eventType === 'JOINING' || evt.eventType === 'JOINED') Icon = UserPlus;
                          else if (evt.eventType === 'PROMOTION') Icon = Award;
                          else if (evt.eventType === 'TRANSFER') Icon = MapPin;
                          else if (evt.eventType === 'TERMINATION') Icon = LogOut;
                          else if (evt.eventType === 'CERTIFICATION' || evt.eventType === 'DOCUMENT') Icon = FileText;

                          return (
                            <div key={idx} className="relative pl-7 text-xs font-semibold text-slate-655 dark:text-slate-350">
                              <div className="absolute -left-[15px] top-1.5 w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-900 border-2 border-indigo-550 flex items-center justify-center text-indigo-550 ring-4 ring-white dark:ring-[#0B0F19]">
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-[10px] font-mono text-slate-400 font-bold block">{evt.date || evt.eventDate || 'N/A'}</span>
                              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white mt-1">{evt.title}</h4>
                              <p className="text-xs text-slate-550 mt-1 leading-relaxed">{evt.description}</p>
                              {evt.triggeredBy && (
                                <span className="text-[9px] text-slate-400 font-semibold block mt-1">Triggered by: {evt.triggeredBy}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* 9. AUDIT HISTORY TAB */}
                {activeTab === 'audit' && (
                  <div className="space-y-6 animate-fade-in text-xs font-semibold">
                    <h3 className="text-xs font-extrabold text-slate-455 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">Platform Master Audit Logs</h3>
                    
                    <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-850 rounded-xl overflow-hidden shadow-sm">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/85 dark:border-slate-800 text-slate-400 uppercase text-[9px] font-bold">
                            <th className="p-3">Actor</th>
                            <th className="p-3">Timestamp</th>
                            <th className="p-3">Action</th>
                            <th className="p-3">Changes Summary</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-350">
                          <tr>
                            <td className="p-3 font-bold">admin@managemyopz.com</td>
                            <td className="p-3 font-mono text-[10px]">2026-06-18 10:14:22</td>
                            <td className="p-3"><span className="text-indigo-650 bg-indigo-50 dark:bg-indigo-950/20 px-2 py-0.5 rounded text-[10px]">UPDATE</span></td>
                            <td className="p-3">Modified contact details and emergency configurations.</td>
                          </tr>
                          {selectedEmployee.timeline.map((evt: any, idx: number) => (
                            <tr key={idx}>
                              <td className="p-3 font-bold">{evt.triggeredBy || 'system'}</td>
                              <td className="p-3 font-mono text-[10px]">{evt.date || evt.eventDate}</td>
                              <td className="p-3">
                                <span className="text-emerald-650 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded text-[10px]">
                                  {evt.eventType || 'LIFECYCLE'}
                                </span>
                              </td>
                              <td className="p-3">{evt.title}: {evt.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              </div>

            </div>

          </div>
        </div>
      )}

      {/* ── ACTION DIALOG MODALS ───────────────────────────── */}
      {activeModal !== 'none' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-55 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0C101B] border border-slate-202 dark:border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-fade-in text-xs font-semibold">
            
            {/* Transfer Modal */}
            {activeModal === 'transfer' && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Transfer Employee Twin</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">New Department</label>
                    <select 
                      value={transferDept}
                      onChange={e => setTransferDept(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 outline-none"
                    >
                      <option value="">Select Department</option>
                      {employeeDepts?.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">New Location</label>
                    <select 
                      value={transferLoc}
                      onChange={e => setTransferLoc(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 outline-none"
                    >
                      <option value="">Select Location</option>
                      {allLocations?.map(l => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setActiveModal('none')} className="px-4 py-2 border border-slate-250 dark:border-slate-800 rounded-lg">Cancel</button>
                  <button onClick={submitTransfer} className="bg-indigo-650 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg">Apply Transfer</button>
                </div>
              </div>
            )}

            {/* Promote Modal */}
            {activeModal === 'promote' && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Promote Employee</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">New Designation</label>
                    <select 
                      value={promoteDesignation}
                      onChange={e => setPromoteDesignation(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 outline-none"
                    >
                      <option value="">Select Designation</option>
                      {allDesignations?.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">New Grade Level</label>
                    <select 
                      value={promoteGrade}
                      onChange={e => setPromoteGrade(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 outline-none"
                    >
                      <option value="">Select Grade</option>
                      {allGrades?.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setActiveModal('none')} className="px-4 py-2 border border-slate-250 dark:border-slate-800 rounded-lg">Cancel</button>
                  <button onClick={submitPromotion} className="bg-indigo-650 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg">Apply Promotion</button>
                </div>
              </div>
            )}

            {/* Change Manager Modal */}
            {activeModal === 'manager' && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Re-assign Reporting Manager</h3>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">New Manager UUID</label>
                  <input 
                    type="text" 
                    placeholder="00000000-0000-0000-0000-000000000000"
                    value={newManagerId}
                    onChange={e => setNewManagerId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 outline-none font-mono"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setActiveModal('none')} className="px-4 py-2 border border-slate-250 dark:border-slate-800 rounded-lg">Cancel</button>
                  <button onClick={submitChangeManager} className="bg-indigo-650 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg">Reassign Manager</button>
                </div>
              </div>
            )}

            {/* Terminate Modal */}
            {activeModal === 'terminate' && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white text-rose-500">Terminate Digital Twin</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Exit Effective Date</label>
                    <input 
                      type="date" 
                      value={terminateDate}
                      onChange={e => setTerminateDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Reason for Termination</label>
                    <textarea 
                      placeholder="Voluntary Resignation, Relocation, End of Contract..."
                      value={terminateReason}
                      onChange={e => setTerminateReason(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 outline-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setActiveModal('none')} className="px-4 py-2 border border-slate-250 dark:border-slate-800 rounded-lg">Cancel</button>
                  <button onClick={submitTermination} className="bg-rose-650 hover:bg-rose-700 text-white px-4 py-2 rounded-lg">Submit Termination</button>
                </div>
              </div>
            )}

            {/* Edit Identity Modal */}
            {activeModal === 'editIdentity' && (
              <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Edit Personal & Identity Details</h3>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">First Name</label>
                      <input type="text" value={editFirstName} onChange={e => setEditFirstName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Last Name</label>
                      <input type="text" value={editLastName} onChange={e => setEditLastName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 outline-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Date of Birth</label>
                      <input type="date" value={editDOB} onChange={e => setEditDOB(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Gender</label>
                      <select value={editGender} onChange={e => setEditGender(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 outline-none">
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Personal Email</label>
                      <input type="email" value={editPersonalEmail} onChange={e => setEditPersonalEmail(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 outline-none font-mono" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Work Phone</label>
                      <input type="text" value={editWorkPhone} onChange={e => setEditWorkPhone(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 outline-none" />
                    </div>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-3">
                    <p className="text-[9px] text-slate-400 uppercase font-bold">Emergency Contact</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase block mb-1">Contact Name</label>
                        <input type="text" value={editEmergencyName} onChange={e => setEditEmergencyName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-lg p-2 outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase block mb-1">Relation</label>
                        <input type="text" value={editEmergencyRelation} onChange={e => setEditEmergencyRelation(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-lg p-2 outline-none" />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] text-slate-400 uppercase block mb-1">Contact Phone</label>
                        <input type="text" value={editEmergencyPhone} onChange={e => setEditEmergencyPhone(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-lg p-2 outline-none" />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-3">
                    <p className="text-[9px] text-slate-400 uppercase font-bold">Address History</p>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase block mb-1">Current Address</label>
                      <textarea value={editCurrentAddress} onChange={e => setEditCurrentAddress(e.target.value)} rows={2} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-lg p-2 outline-none" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setActiveModal('none')} className="px-4 py-2 border border-slate-250 dark:border-slate-800 rounded-lg">Cancel</button>
                  <button onClick={submitEditIdentity} className="bg-indigo-650 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg">Save Profile</button>
                </div>
              </div>
            )}

            {/* Add Skill Modal */}
            {activeModal === 'addSkill' && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Add Skill to Cloud</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Skill Name</label>
                    <input type="text" placeholder="Docker, Python, Kubernetes" value={newSkillName} onChange={e => setNewSkillName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-lg p-2.5 outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Category</label>
                    <select value={newSkillCategory} onChange={e => setNewSkillCategory(e.target.value as any)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-lg p-2.5 outline-none">
                      <option value="TECHNICAL">Technical</option>
                      <option value="FUNCTIONAL">Functional</option>
                      <option value="SOFT">Soft Skills</option>
                      <option value="LANGUAGE">Languages</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Proficiency Level</label>
                    <select value={newSkillLevel} onChange={e => setNewSkillLevel(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-lg p-2.5 outline-none">
                      <option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="ADVANCED">Advanced</option>
                      <option value="EXPERT">Expert</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setActiveModal('none')} className="px-4 py-2 border border-slate-250 dark:border-slate-800 rounded-lg">Cancel</button>
                  <button onClick={submitAddSkill} className="bg-indigo-650 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg">Add Skill</button>
                </div>
              </div>
            )}

            {/* Add Certification Modal */}
            {activeModal === 'addCert' && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-[#000] dark:text-[#fff]">Register Certification</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Certification Name</label>
                    <input type="text" placeholder="AWS Certified Solutions Architect" value={newCertName} onChange={e => setNewCertName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-lg p-2.5 outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Issuing Authority</label>
                    <input type="text" placeholder="Amazon Web Services" value={newCertAuthority} onChange={e => setNewCertAuthority(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-lg p-2.5 outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Expiry Date</label>
                    <input type="date" value={newCertExpiryDate} onChange={e => setNewCertExpiryDate(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-lg p-2.5 outline-none" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setActiveModal('none')} className="px-4 py-2 border border-slate-250 dark:border-slate-800 rounded-lg">Cancel</button>
                  <button onClick={submitAddCert} className="bg-indigo-650 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg">Register</button>
                </div>
              </div>
            )}

            {/* Add Document Modal */}
            {activeModal === 'addDoc' && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Upload Compliance Document</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Document Filename</label>
                    <input type="text" placeholder="pan_card.pdf" value={newDocName} onChange={e => setNewDocName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-lg p-2.5 outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Document Category</label>
                    <select value={newDocType} onChange={e => setNewDocType(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-lg p-2.5 outline-none">
                      <option value="IDENTITY">Identity Verification</option>
                      <option value="EDUCATION">Education Degree</option>
                      <option value="PREVIOUS_EMPLOYMENT">Previous Employment Certificate</option>
                      <option value="COMPLIANCE">Compliance Signature</option>
                      <option value="MEDICAL">Medical Certificate</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setActiveModal('none')} className="px-4 py-2 border border-slate-250 dark:border-slate-800 rounded-lg">Cancel</button>
                  <button onClick={submitAddDoc} className="bg-indigo-650 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg">Upload Vault</button>
                </div>
              </div>
            )}

            {/* Add Relationship Modal */}
            {activeModal === 'addRelation' && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-[#000] dark:text-[#fff]">Map Relationship Node</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Relationship Type</label>
                    <select value={newRelType} onChange={e => setNewRelType(e.target.value as any)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-lg p-2.5 outline-none">
                      <option value="BUDDY">Buddy</option>
                      <option value="MENTOR">Mentor</option>
                      <option value="HRBP">HRBP</option>
                      <option value="PROJECT_MANAGER">Project Manager</option>
                      <option value="DOTTED_LINE_MANAGER">Dotted Line Manager</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Related Employee ID (UUID)</label>
                    <input type="text" placeholder="00000000-0000-0000-0000-000000000000" value={newRelEmpId} onChange={e => setNewRelEmpId(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-lg p-2.5 outline-none font-mono" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Notes</label>
                    <input type="text" placeholder="Onboarding Buddy for tech operations" value={newRelNotes} onChange={e => setNewRelNotes(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-lg p-2.5 outline-none" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setActiveModal('none')} className="px-4 py-2 border border-slate-255 dark:border-slate-800 rounded-lg">Cancel</button>
                  <button onClick={submitAddRelation} className="bg-indigo-650 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg">Map Edge</button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
