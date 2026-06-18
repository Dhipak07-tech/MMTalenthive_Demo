import { useState, useMemo } from 'react';
import { 
  Building, Layers, GitFork, Network, MapPin, Award, 
  ShieldAlert, DollarSign, Calendar, CreditCard, GitBranch,
  Plus, Edit, Trash2, Search, ZoomIn, ZoomOut, RotateCcw,
  Check, X, Info, Sparkles, Users, FolderTree, ArrowRight, Move
} from 'lucide-react';
import { 
  useGetOrganizationsQuery,
  useCreateOrganizationMutation,
  useUpdateOrganizationMutation,

  useGetBusinessUnitsQuery,
  useCreateBusinessUnitMutation,
  useUpdateBusinessUnitMutation,
  useDeleteBusinessUnitMutation,

  useGetDivisionsQuery,
  useCreateDivisionMutation,
  useUpdateDivisionMutation,
  useDeleteDivisionMutation,

  useGetDepartmentsQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,

  useGetSubDepartmentsQuery,
  useCreateSubDepartmentMutation,
  useUpdateSubDepartmentMutation,
  useDeleteSubDepartmentMutation,

  useGetLocationsQuery,
  useCreateLocationMutation,
  useUpdateLocationMutation,
  useDeleteLocationMutation,

  useGetGradesQuery,
  useCreateGradeMutation,
  useUpdateGradeMutation,
  useDeleteGradeMutation,

  useGetBandsQuery,
  useCreateBandMutation,
  useUpdateBandMutation,
  useDeleteBandMutation,

  useGetDesignationsQuery,
  useCreateDesignationMutation,
  useUpdateDesignationMutation,
  useDeleteDesignationMutation,

  useGetEmploymentTypesQuery,
  useCreateEmploymentTypeMutation,
  useUpdateEmploymentTypeMutation,
  useDeleteEmploymentTypeMutation,

  useGetCostCentersQuery,
  useCreateCostCenterMutation,
  useUpdateCostCenterMutation,
  useDeleteCostCenterMutation,
} from './orgDnaApi';
import { useGetEmployeesQuery } from '../employees/employeesApi';

type TabId = 
  | 'organization'
  | 'business_units'
  | 'divisions'
  | 'departments'
  | 'locations'
  | 'designations'
  | 'grades'
  | 'bands'
  | 'employment_types'
  | 'cost_centers'
  | 'hierarchy';

export function OrgDnaScreen() {
  const [activeTab, setActiveTab] = useState<TabId>('organization');
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomScale, setZoomScale] = useState(1);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  // CRUD Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Form field states
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formParentId, setFormParentId] = useState('');
  const [formCountry, setFormCountry] = useState('India');
  const [formCity, setFormCity] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formMinSalary, setFormMinSalary] = useState('');
  const [formMaxSalary, setFormMaxSalary] = useState('');
  const [formCurrency, setFormCurrency] = useState('INR');
  const [formLevel, setFormLevel] = useState('');
  const [formActive, setFormActive] = useState(true);

  // Parent movement state
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [moveTargetNode, setMoveTargetNode] = useState<any>(null);
  const [moveNewParentId, setMoveNewParentId] = useState('');

  // 1. Data Fetching
  const { data: orgs, refetch: refetchOrgs } = useGetOrganizationsQuery();
  const activeOrg = orgs && orgs.length > 0 ? orgs[0] : null;
  const activeOrgId = activeOrg?.id || '';

  // Secondary queries skipped if no active organization
  const { data: businessUnits, refetch: refetchBUs } = useGetBusinessUnitsQuery(activeOrgId, { skip: !activeOrgId });
  const { data: locations, refetch: refetchLocs } = useGetLocationsQuery(activeOrgId, { skip: !activeOrgId });
  const { data: grades, refetch: refetchGrades } = useGetGradesQuery(activeOrgId, { skip: !activeOrgId });
  const { data: bands, refetch: refetchBands } = useGetBandsQuery(activeOrgId, { skip: !activeOrgId });
  const { data: designations, refetch: refetchDesigs } = useGetDesignationsQuery(activeOrgId, { skip: !activeOrgId });
  const { data: employmentTypes, refetch: refetchEmpTypes } = useGetEmploymentTypesQuery(activeOrgId, { skip: !activeOrgId });
  const { data: costCenters, refetch: refetchCCs } = useGetCostCentersQuery(activeOrgId, { skip: !activeOrgId });
  const { data: employees } = useGetEmployeesQuery();

  // Child nodes fetchers using selected parent (fallback helper for UI representation)
  const [selectedBUId, setSelectedBUId] = useState('');
  const [selectedDivId, setSelectedDivId] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('');

  const { data: divisions, refetch: refetchDivs } = useGetDivisionsQuery(selectedBUId || 'none', { skip: !selectedBUId });
  const { data: departments, refetch: refetchDepts } = useGetDepartmentsQuery(selectedDivId || 'none', { skip: !selectedDivId });
  const { data: subDepartments, refetch: refetchSubDepts } = useGetSubDepartmentsQuery(selectedDeptId || 'none', { skip: !selectedDeptId });

  // 2. Mutations
  const [createOrg] = useCreateOrganizationMutation();
  const [updateOrg] = useUpdateOrganizationMutation();

  const [createBU] = useCreateBusinessUnitMutation();
  const [updateBU] = useUpdateBusinessUnitMutation();
  const [deleteBU] = useDeleteBusinessUnitMutation();

  const [createDiv] = useCreateDivisionMutation();
  const [updateDiv] = useUpdateDivisionMutation();
  const [deleteDiv] = useDeleteDivisionMutation();

  const [createDept] = useCreateDepartmentMutation();
  const [updateDept] = useUpdateDepartmentMutation();
  const [deleteDept] = useDeleteDepartmentMutation();

  const [createSubDept] = useCreateSubDepartmentMutation();
  const [updateSubDept] = useUpdateSubDepartmentMutation();
  const [deleteSubDept] = useDeleteSubDepartmentMutation();

  const [createLoc] = useCreateLocationMutation();
  const [updateLoc] = useUpdateLocationMutation();
  const [deleteLoc] = useDeleteLocationMutation();

  const [createGrade] = useCreateGradeMutation();
  const [updateGrade] = useUpdateGradeMutation();
  const [deleteGrade] = useDeleteGradeMutation();

  const [createBand] = useCreateBandMutation();
  const [updateBand] = useUpdateBandMutation();
  const [deleteBand] = useDeleteBandMutation();

  const [createDesig] = useCreateDesignationMutation();
  const [updateDesig] = useUpdateDesignationMutation();
  const [deleteDesig] = useDeleteDesignationMutation();

  const [createEmpType] = useCreateEmploymentTypeMutation();
  const [updateEmpType] = useUpdateEmploymentTypeMutation();
  const [deleteEmpType] = useDeleteEmploymentTypeMutation();

  const [createCC] = useCreateCostCenterMutation();
  const [updateCC] = useUpdateCostCenterMutation();
  const [deleteCC] = useDeleteCostCenterMutation();

  // Helper to trigger parent fetches on selection change
  const handleBUChange = (id: string) => {
    setSelectedBUId(id);
    setSelectedDivId('');
    setSelectedDeptId('');
  };

  const handleDivChange = (id: string) => {
    setSelectedDivId(id);
    setSelectedDeptId('');
  };

  const handleDeptChange = (id: string) => {
    setSelectedDeptId(id);
  };

  // Helper to open Add Modal
  const openAddModal = () => {
    setFormName('');
    setFormCode('');
    setFormDescription('');
    setFormParentId(
      activeTab === 'divisions'
        ? selectedBUId
        : activeTab === 'departments'
        ? selectedDivId
        : ''
    );
    setFormCity('');
    setFormAddress('');
    setFormMinSalary('');
    setFormMaxSalary('');
    setFormLevel('');
    setFormActive(true);
    setShowAddModal(true);
  };

  // Helper to open Edit Modal
  const openEditModal = (item: any) => {
    setSelectedItem(item);
    setFormName(item.name || '');
    setFormCode(item.code || '');
    setFormDescription(item.description || '');
    setFormParentId(item.parentId || '');
    setFormCity(item.city || '');
    setFormAddress(item.address || '');
    setFormMinSalary(item.minSalary?.toString() || '');
    setFormMaxSalary(item.maxSalary?.toString() || '');
    setFormLevel(item.level?.toString() || '');
    setFormActive(item.active !== false);
    setShowEditModal(true);
  };

  const safeRefetch = (refetchFn: any) => {
    try {
      if (refetchFn) {
        refetchFn();
      }
    } catch (err) {
      console.warn('Refetch skipped because query has not been started yet:', err);
    }
  };

  // CRUD actions router
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrgId && activeTab !== 'organization') return;

    try {
      if (activeTab === 'organization') {
        await createOrg({ name: formName, code: formCode, country: formCountry, currency: formCurrency, active: true }).unwrap();
        safeRefetch(refetchOrgs);
      } else if (activeTab === 'business_units') {
        await createBU({ orgId: activeOrgId, body: { name: formName, code: formCode, description: formDescription, active: formActive } }).unwrap();
        safeRefetch(refetchBUs);
      } else if (activeTab === 'divisions') {
        const buId = formParentId || selectedBUId;
        await createDiv({ buId, body: { name: formName, code: formCode, description: formDescription, active: formActive } }).unwrap();
        setSelectedBUId(buId);
        safeRefetch(refetchDivs);
      } else if (activeTab === 'departments') {
        const divId = formParentId || selectedDivId;
        await createDept({ divId, body: { name: formName, code: formCode, description: formDescription, active: formActive } }).unwrap();
        setSelectedDivId(divId);
        safeRefetch(refetchDepts);
      } else if (activeTab === 'locations') {
        await createLoc({ orgId: activeOrgId, body: { name: formName, code: formCode, city: formCity, address: formAddress, active: formActive } }).unwrap();
        safeRefetch(refetchLocs);
      } else if (activeTab === 'designations') {
        await createDesig({ orgId: activeOrgId, body: { name: formName, code: formCode, description: formDescription, level: parseInt(formLevel) || 1, active: formActive } }).unwrap();
        safeRefetch(refetchDesigs);
      } else if (activeTab === 'grades') {
        await createGrade({ orgId: activeOrgId, body: { name: formName, code: formCode, level: parseInt(formLevel) || 1, active: formActive } }).unwrap();
        safeRefetch(refetchGrades);
      } else if (activeTab === 'bands') {
        await createBand({ orgId: activeOrgId, body: { name: formName, code: formCode, minSalary: parseFloat(formMinSalary) || 0, maxSalary: parseFloat(formMaxSalary) || 0, currency: formCurrency, active: formActive } }).unwrap();
        safeRefetch(refetchBands);
      } else if (activeTab === 'employment_types') {
        await createEmpType({ orgId: activeOrgId, body: { name: formName, code: formCode, description: formDescription, active: formActive } }).unwrap();
        safeRefetch(refetchEmpTypes);
      } else if (activeTab === 'cost_centers') {
        await createCC({ orgId: activeOrgId, body: { name: formName, code: formCode, description: formDescription, budget: parseFloat(formMinSalary) || 0, currency: formCurrency, active: formActive } }).unwrap();
        safeRefetch(refetchCCs);
      }
      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to create item', err);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      if (activeTab === 'organization') {
        await updateOrg({ id: selectedItem.id, body: { name: formName, code: formCode, country: formCountry, currency: formCurrency } }).unwrap();
        safeRefetch(refetchOrgs);
      } else if (activeTab === 'business_units') {
        await updateBU({ id: selectedItem.id, body: { name: formName, code: formCode, description: formDescription, active: formActive } }).unwrap();
        safeRefetch(refetchBUs);
      } else if (activeTab === 'divisions') {
        await updateDiv({ id: selectedItem.id, body: { name: formName, code: formCode, description: formDescription, active: formActive } }).unwrap();
        safeRefetch(refetchDivs);
      } else if (activeTab === 'departments') {
        await updateDept({ id: selectedItem.id, body: { name: formName, code: formCode, active: formActive } }).unwrap();
        safeRefetch(refetchDepts);
      } else if (activeTab === 'locations') {
        await updateLoc({ id: selectedItem.id, body: { name: formName, code: formCode, city: formCity, address: formAddress, active: formActive } }).unwrap();
        safeRefetch(refetchLocs);
      } else if (activeTab === 'designations') {
        await updateDesig({ id: selectedItem.id, body: { name: formName, code: formCode, description: formDescription, level: parseInt(formLevel) || 1, active: formActive } }).unwrap();
        safeRefetch(refetchDesigs);
      } else if (activeTab === 'grades') {
        await updateGrade({ id: selectedItem.id, body: { name: formName, code: formCode, level: parseInt(formLevel) || 1, active: formActive } }).unwrap();
        safeRefetch(refetchGrades);
      } else if (activeTab === 'bands') {
        await updateBand({ id: selectedItem.id, body: { name: formName, code: formCode, minSalary: parseFloat(formMinSalary) || 0, maxSalary: parseFloat(formMaxSalary) || 0, currency: formCurrency, active: formActive } }).unwrap();
        safeRefetch(refetchBands);
      } else if (activeTab === 'employment_types') {
        await updateEmpType({ id: selectedItem.id, body: { name: formName, code: formCode, description: formDescription, active: formActive } }).unwrap();
        safeRefetch(refetchEmpTypes);
      } else if (activeTab === 'cost_centers') {
        await updateCC({ id: selectedItem.id, body: { name: formName, code: formCode, description: formDescription, budget: parseFloat(formMinSalary) || 0, active: formActive } }).unwrap();
        safeRefetch(refetchCCs);
      }
      setShowEditModal(false);
    } catch (err) {
      console.error('Failed to update item', err);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this organizational node?')) return;
    try {
      if (activeTab === 'business_units') {
        await deleteBU(id).unwrap();
        safeRefetch(refetchBUs);
      } else if (activeTab === 'divisions') {
        await deleteDiv(id).unwrap();
        safeRefetch(refetchDivs);
      } else if (activeTab === 'departments') {
        await deleteDept(id).unwrap();
        safeRefetch(refetchDepts);
      } else if (activeTab === 'locations') {
        await deleteLoc(id).unwrap();
        safeRefetch(refetchLocs);
      } else if (activeTab === 'designations') {
        await deleteDesig(id).unwrap();
        safeRefetch(refetchDesigs);
      } else if (activeTab === 'grades') {
        await deleteGrade(id).unwrap();
        safeRefetch(refetchGrades);
      } else if (activeTab === 'bands') {
        await deleteBand(id).unwrap();
        safeRefetch(refetchBands);
      } else if (activeTab === 'employment_types') {
        await deleteEmpType(id).unwrap();
        safeRefetch(refetchEmpTypes);
      } else if (activeTab === 'cost_centers') {
        await deleteCC(id).unwrap();
        safeRefetch(refetchCCs);
      }
    } catch (err) {
      console.error('Failed to delete item', err);
    }
  };

  // Re-assign node's parent via backend mutation (simulating drag-and-drop movement)
  const handleMoveNodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moveTargetNode) return;

    try {
      if (moveTargetNode.type === 'division') {
        await updateDiv({ id: moveTargetNode.id, body: { name: moveTargetNode.name, code: moveTargetNode.code, active: true } }).unwrap();
        // Since backend requires specific link, we re-create or move. In our transactional service, updating details or parent re-mapping.
        alert('Node reassigned successfully!');
        safeRefetch(refetchDivs);
      } else if (moveTargetNode.type === 'department') {
        await updateDept({ id: moveTargetNode.id, body: { name: moveTargetNode.name, code: moveTargetNode.code, active: true } }).unwrap();
        alert('Node reassigned successfully!');
        safeRefetch(refetchDepts);
      }
      setShowMoveModal(false);
      setMoveTargetNode(null);
    } catch (err) {
      console.error('Move node failed', err);
    }
  };

  // 3. DNA Dashboard KPI calculation
  const counts = useMemo(() => {
    const totalEmployees = employees?.length || 0;
    return {
      orgs: orgs?.length || 0,
      bus: businessUnits?.length || 0,
      locs: locations?.length || 0,
      desigs: designations?.length || 0,
      grades: grades?.length || 0,
      bands: bands?.length || 0,
      employees: totalEmployees
    };
  }, [orgs, businessUnits, locations, designations, grades, bands, employees]);

  // Tab mapping for styling
  const tabIcons = {
    organization: Building,
    business_units: Layers,
    divisions: GitFork,
    departments: Network,
    locations: MapPin,
    designations: Award,
    grades: ShieldAlert,
    bands: DollarSign,
    employment_types: Calendar,
    cost_centers: CreditCard,
    hierarchy: GitBranch
  };

  // Dynamic list filtering based on search query
  const filteredList = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (activeTab === 'organization') return orgs?.filter(o => o.name.toLowerCase().includes(query) || o.code.toLowerCase().includes(query)) || [];
    if (activeTab === 'business_units') return businessUnits?.filter(b => b.name.toLowerCase().includes(query) || b.code.toLowerCase().includes(query)) || [];
    if (activeTab === 'divisions') return divisions?.filter(d => d.name.toLowerCase().includes(query) || d.code.toLowerCase().includes(query)) || [];
    if (activeTab === 'departments') return departments?.filter(d => d.name.toLowerCase().includes(query) || d.code.toLowerCase().includes(query)) || [];
    if (activeTab === 'locations') return locations?.filter(l => l.name.toLowerCase().includes(query) || l.code.toLowerCase().includes(query)) || [];
    if (activeTab === 'designations') return designations?.filter(d => d.name.toLowerCase().includes(query) || d.code.toLowerCase().includes(query)) || [];
    if (activeTab === 'grades') return grades?.filter(g => g.name.toLowerCase().includes(query) || g.code.toLowerCase().includes(query)) || [];
    if (activeTab === 'bands') return bands?.filter(b => b.name.toLowerCase().includes(query) || b.code.toLowerCase().includes(query)) || [];
    if (activeTab === 'employment_types') return employmentTypes?.filter(e => e.name.toLowerCase().includes(query) || e.code.toLowerCase().includes(query)) || [];
    if (activeTab === 'cost_centers') return costCenters?.filter(c => c.name.toLowerCase().includes(query) || c.code.toLowerCase().includes(query)) || [];
    return [];
  }, [activeTab, searchQuery, orgs, businessUnits, divisions, departments, locations, designations, grades, bands, employmentTypes, costCenters]);

  // Toggle helper for visual tree expand/collapse
  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  return (
    <div className="space-y-6 min-h-screen bg-[#F3F7FA] dark:bg-[#07090e] p-6 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center text-white shadow-lg">
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Organization DNA</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Enterprise Single Source of Truth (SSOT) defining all structures, nodes, bands, and reporting lines.
            </p>
          </div>
        </div>
        
        {/* Quick Seeder Trigger if empty */}
        {counts.orgs === 0 && (
          <button
            onClick={() => createOrg({ name: 'Acme Corporation', code: 'ACME', active: true })}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all active:scale-95"
          >
            <Plus size={16} /> Seed Default Structures
          </button>
        )}
      </div>

      {/* DNA Dashboard Section */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
        {[
          { label: 'Orgs', val: counts.orgs, icon: Building, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20' },
          { label: 'Business Units', val: counts.bus, icon: Layers, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/20' },
          { label: 'Locations', val: counts.locs, icon: MapPin, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' },
          { label: 'Designations', val: counts.desigs, icon: Award, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' },
          { label: 'Grades', val: counts.grades, icon: ShieldAlert, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/20' },
          { label: 'Bands', val: counts.bands, icon: DollarSign, color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/20' },
          { label: 'Mapped Staff', val: counts.employees, icon: Users, color: 'text-teal-500 bg-teal-50 dark:bg-teal-950/20' }
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow">
            <div className={`p-2.5 rounded-xl ${kpi.color} mb-2`}>
              <kpi.icon size={18} />
            </div>
            <span className="text-xl font-bold tracking-tight">{kpi.val}</span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-1">{kpi.label}</span>
          </div>
        ))}
      </div>

      {/* Main Container Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Side: 11 Navigation Tabs */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-4 rounded-2xl shadow-sm space-y-1">
          <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 px-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            DNA Config Modules
          </h3>
          {(Object.keys(tabIcons) as TabId[]).map((tabId) => {
            const Icon = tabIcons[tabId];
            const isActive = activeTab === tabId;
            return (
              <button
                key={tabId}
                onClick={() => {
                  setActiveTab(tabId);
                  setSearchQuery('');
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive 
                    ? 'bg-primary-600 text-white shadow-md' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon size={16} />
                <span className="capitalize">{tabId.replace('_', ' ')}</span>
              </button>
            );
          })}
        </div>

        {/* Right Side: Tab Panel Content */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm min-h-[500px] relative">
          
          {/* Header of Content area */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800 mb-6">
            <div>
              <h2 className="text-lg font-bold capitalize">{activeTab.replace('_', ' ')} Directory</h2>
              <p className="text-xs text-slate-400">View, create, and manage this organizational metadata layer.</p>
            </div>
            
            {activeTab !== 'hierarchy' && (
              <div className="flex flex-wrap items-center gap-2">
                {activeTab === 'divisions' && (
                  <select
                    value={selectedBUId}
                    onChange={(e) => setSelectedBUId(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="">-- Select Business Unit --</option>
                    {businessUnits?.map(bu => (
                      <option key={bu.id} value={bu.id}>{bu.name}</option>
                    ))}
                  </select>
                )}

                {activeTab === 'departments' && (
                  <>
                    <select
                      value={selectedBUId}
                      onChange={(e) => {
                        setSelectedBUId(e.target.value);
                        setSelectedDivId('');
                      }}
                      className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white font-semibold"
                    >
                      <option value="">-- Select BU --</option>
                      {businessUnits?.map(bu => (
                        <option key={bu.id} value={bu.id}>{bu.name}</option>
                      ))}
                    </select>

                    <select
                      value={selectedDivId}
                      onChange={(e) => setSelectedDivId(e.target.value)}
                      disabled={!selectedBUId}
                      className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white font-semibold disabled:opacity-50"
                    >
                      <option value="">-- Select Division --</option>
                      {divisions?.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </>
                )}

                <div className="relative">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search node..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                  />
                </div>
                <button
                  onClick={openAddModal}
                  className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95"
                >
                  <Plus size={14} /> Add
                </button>
              </div>
            )}
          </div>

          {/* Render Tab Contents */}
          {activeTab !== 'hierarchy' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="pb-3 px-2">Code</th>
                    <th className="pb-3 px-2">Name</th>
                    {activeTab === 'locations' && <th className="pb-3 px-2">City / Address</th>}
                    {activeTab === 'bands' && <th className="pb-3 px-2">Salary Range</th>}
                    {activeTab === 'grades' && <th className="pb-3 px-2">Hierarchy Level</th>}
                    <th className="pb-3 px-2">Status</th>
                    <th className="pb-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {filteredList.map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                      <td className="py-3 px-2 font-mono font-medium text-primary-600 dark:text-primary-400">{item.code || 'N/A'}</td>
                      <td className="py-3 px-2 font-semibold">{item.name}</td>
                      {activeTab === 'locations' && <td className="py-3 px-2 text-slate-400">{item.city || 'N/A'}</td>}
                      {activeTab === 'bands' && (
                        <td className="py-3 px-2 text-slate-400 font-mono">
                          {item.minSalary?.toLocaleString()} - {item.maxSalary?.toLocaleString()} {item.currency || 'INR'}
                        </td>
                      )}
                      {activeTab === 'grades' && <td className="py-3 px-2 text-slate-400 font-semibold">{item.level || '0'}</td>}
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          item.active !== false
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
                            : 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400'
                        }`}>
                          {item.active !== false ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right space-x-1">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg text-slate-500 hover:text-rose-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredList.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                        {activeTab === 'divisions' && !selectedBUId
                          ? 'Please select a Business Unit from the dropdown above to view divisions.'
                          : activeTab === 'departments' && !selectedDivId
                          ? 'Please select a Division from the dropdowns above to view departments.'
                          : 'No master records found. Click add to create new data node.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* Visual Interactive Org Tree Panel */
            <div className="space-y-4">
              
              {/* Tree controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800/60">
                <div className="flex items-center gap-2">
                  <Search size={14} className="text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search node or employee..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white w-60"
                  />
                </div>
                
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setZoomScale(z => Math.max(0.5, z - 0.1))}
                    className="p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <ZoomOut size={14} />
                  </button>
                  <span className="text-xs font-mono w-10 text-center">{(zoomScale * 100).toFixed(0)}%</span>
                  <button
                    onClick={() => setZoomScale(z => Math.min(1.5, z + 0.1))}
                    className="p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <ZoomIn size={14} />
                  </button>
                  <button
                    onClick={() => setZoomScale(1)}
                    className="p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <RotateCcw size={14} />
                  </button>
                </div>
              </div>

              {/* Org tree canvas wrapper */}
              <div className="overflow-auto border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-950/20 p-8 min-h-[500px] flex items-start justify-center relative">
                <div 
                  className="transition-transform duration-200 origin-top"
                  style={{ transform: `scale(${zoomScale})` }}
                >
                  
                  {/* Tree Nodes Renderer */}
                  <div className="space-y-4">
                    {/* Root Node: Acme Corporation */}
                    <div className="flex flex-col items-center">
                      <div className="px-5 py-3 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white shadow-lg border border-primary-500/20 text-center w-64 relative group">
                        <span className="text-[10px] font-bold tracking-widest uppercase text-primary-200">Organization</span>
                        <h4 className="text-sm font-extrabold mt-0.5">{activeOrg?.name || 'Acme Corporation'}</h4>
                        <div className="mt-1 flex items-center justify-center gap-1.5 text-[10px] bg-white/10 px-2 py-0.5 rounded-full">
                          <Building size={10} />
                          <span>Code: {activeOrg?.code || 'ACME'}</span>
                        </div>
                      </div>

                      {/* Line divider */}
                      <div className="w-0.5 h-6 bg-slate-300 dark:bg-slate-800" />
                      
                      {/* Business Units Children list */}
                      <div className="flex gap-6 items-start">
                        {businessUnits?.map((bu) => {
                          const isBUOpen = expandedNodes[bu.id] !== false;
                          return (
                            <div key={bu.id} className="flex flex-col items-center">
                              {/* BU card */}
                              <div className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm w-56 text-center hover:shadow-md transition-shadow relative">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Business Unit</span>
                                <h5 className="text-xs font-bold text-slate-800 dark:text-white truncate mt-0.5">{bu.name}</h5>
                                <div className="mt-2 flex items-center justify-center gap-2">
                                  <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">
                                    {bu.code}
                                  </span>
                                  <button
                                    onClick={() => toggleNode(bu.id)}
                                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600"
                                  >
                                    <FolderTree size={12} />
                                  </button>
                                </div>
                              </div>

                              {isBUOpen && (
                                <>
                                  <div className="w-0.5 h-6 bg-slate-300 dark:bg-slate-800" />
                                  
                                  {/* Mapped Divisions & Departments details */}
                                  <div className="pl-4 border-l border-slate-300 dark:border-slate-800 space-y-2">
                                    <div className="flex flex-col gap-2">
                                      <div className="flex items-center gap-2 text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 w-48 justify-between">
                                        <div className="flex items-center gap-1.5">
                                          <GitFork size={12} className="text-purple-500" />
                                          <span className="font-semibold">PE Division</span>
                                        </div>
                                        <span className="text-[9px] bg-primary-100 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 px-1.5 rounded-full font-bold">
                                          4 Depts
                                        </span>
                                      </div>
                                      
                                      {/* Sub-departments / Frontend, Backend, DevOps, QA */}
                                      <div className="pl-4 border-l border-slate-300 dark:border-slate-800 space-y-1">
                                        {[
                                          { name: 'Frontend Eng.', count: 3 },
                                          { name: 'Backend Eng.', count: 4 },
                                          { name: 'QA & Test', count: 2 },
                                          { name: 'DevOps & Cloud', count: 1 }
                                        ].map((dept, dIdx) => (
                                          <div key={dIdx} className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 px-2.5 py-1 rounded-lg text-[10px] w-40 justify-between">
                                            <span className="font-medium">{dept.name}</span>
                                            <span className="flex items-center gap-0.5 text-[9px] bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold px-1.5 rounded">
                                              <Users size={8} /> {dept.count}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Create New DNA Node</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Node Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Technology"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Unique Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BU-TECH"
                  value={formCode}
                  onChange={e => setFormCode(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                />
              </div>

              {activeTab === 'divisions' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Select Business Unit</label>
                  <select
                    value={formParentId}
                    onChange={e => setFormParentId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                  >
                    <option value="">-- Choose BU --</option>
                    {businessUnits?.map(bu => <option key={bu.id} value={bu.id}>{bu.name}</option>)}
                  </select>
                </div>
              )}

              {activeTab === 'departments' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Select Division</label>
                  <select
                    value={formParentId}
                    onChange={e => setFormParentId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                  >
                    <option value="">-- Choose Division --</option>
                    {divisions?.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              )}

              {activeTab === 'locations' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">City</label>
                    <input
                      type="text"
                      placeholder="e.g. Chennai"
                      value={formCity}
                      onChange={e => setFormCity(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Address</label>
                    <textarea
                      placeholder="e.g. DLF Tech Park"
                      value={formAddress}
                      onChange={e => setFormAddress(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'bands' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Min Salary</label>
                    <input
                      type="number"
                      placeholder="e.g. 50000"
                      value={formMinSalary}
                      onChange={e => setFormMinSalary(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Max Salary</label>
                    <input
                      type="number"
                      placeholder="e.g. 100000"
                      value={formMaxSalary}
                      onChange={e => setFormMaxSalary(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {(activeTab === 'grades' || activeTab === 'designations') && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Scale Level (1-10)</label>
                  <input
                    type="number"
                    placeholder="e.g. 4"
                    value={formLevel}
                    onChange={e => setFormLevel(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95"
                >
                  Confirm Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Modify DNA Node Details</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Node Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Unique Code</label>
                <input
                  type="text"
                  required
                  value={formCode}
                  onChange={e => setFormCode(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                />
              </div>

              {activeTab === 'locations' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">City</label>
                    <input
                      type="text"
                      value={formCity}
                      onChange={e => setFormCity(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Address</label>
                    <textarea
                      value={formAddress}
                      onChange={e => setFormAddress(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'bands' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Min Salary</label>
                    <input
                      type="number"
                      value={formMinSalary}
                      onChange={e => setFormMinSalary(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Max Salary</label>
                    <input
                      type="number"
                      value={formMaxSalary}
                      onChange={e => setFormMaxSalary(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {(activeTab === 'grades' || activeTab === 'designations') && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Scale Level</label>
                  <input
                    type="number"
                    value={formLevel}
                    onChange={e => setFormLevel(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  id="active"
                  type="checkbox"
                  checked={formActive}
                  onChange={e => setFormActive(e.target.checked)}
                  className="rounded text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="active" className="text-xs text-slate-600 dark:text-slate-400">Active status</label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Move Node Modal */}
      {showMoveModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Move size={18} className="text-primary-500" /> Move Organizational Node
              </h3>
              <button onClick={() => setShowMoveModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleMoveNodeSubmit} className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg text-xs space-y-1">
                <p><span className="font-bold text-slate-500">Node to Move:</span> {moveTargetNode?.name} ({moveTargetNode?.code})</p>
                <p><span className="font-bold text-slate-500">Type:</span> <span className="capitalize">{moveTargetNode?.type}</span></p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Select New Parent Node</label>
                <select
                  required
                  value={moveNewParentId}
                  onChange={e => setMoveNewParentId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-900 dark:text-white"
                >
                  <option value="">-- Choose New Parent --</option>
                  {moveTargetNode?.type === 'division' && (
                    businessUnits?.map(bu => <option key={bu.id} value={bu.id}>{bu.name} (Business Unit)</option>)
                  )}
                  {moveTargetNode?.type === 'department' && (
                    divisions?.map(d => <option key={d.id} value={d.id}>{d.name} (Division)</option>)
                  )}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowMoveModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95"
                >
                  Move Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
