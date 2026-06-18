import { useState } from 'react';
import { 
  Building, GitBranch, MapPin, Layers, Plus, 
  CheckCircle, Info, DollarSign 
} from 'lucide-react';
import { 
  useGetOrganizationsQuery, 
  useGetBusinessUnitsQuery, 
  useGetLocationsQuery, 
  useGetGradesQuery, 
  useGetBandsQuery,
  useCreateOrganizationMutation,
  useCreateBusinessUnitMutation,
  useCreateLocationMutation
} from './orgDnaApi';

export function OrgDnaScreen() {
  const [activeTab, setActiveTab] = useState<'hierarchy' | 'locations' | 'grades' | 'bands'>('hierarchy');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeCode, setNewNodeCode] = useState('');

  // Queries
  const { data: orgs, refetch: refetchOrgs } = useGetOrganizationsQuery();
  const activeOrg = orgs && orgs.length > 0 ? orgs[0] : null;

  const { data: businessUnits, refetch: refetchBUs } = useGetBusinessUnitsQuery(
    activeOrg?.id || '', 
    { skip: !activeOrg?.id }
  );

  const { data: locations } = useGetLocationsQuery(
    activeOrg?.id || '', 
    { skip: !activeOrg?.id }
  );

  const { data: grades } = useGetGradesQuery(
    activeOrg?.id || '', 
    { skip: !activeOrg?.id }
  );

  const { data: bands } = useGetBandsQuery(
    activeOrg?.id || '', 
    { skip: !activeOrg?.id }
  );

  // Mutations
  const [createOrg] = useCreateOrganizationMutation();
  const [createBU] = useCreateBusinessUnitMutation();
  const [_createLoc] = useCreateLocationMutation();

  const handleInitOrg = async () => {
    try {
      await createOrg({
        name: 'Technosprint Global',
        code: 'TS-GLOBAL',
        active: true
      }).unwrap();
      refetchOrgs();
    } catch (err) {
      console.error('Failed to initialize organization', err);
    }
  };

  const handleAddNode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrg) return;
    try {
      await createBU({
        orgId: activeOrg.id,
        body: {
          name: newNodeName,
          code: newNodeCode,
          active: true
        }
      }).unwrap();
      setNewNodeName('');
      setNewNodeCode('');
      setShowAddModal(false);
      refetchBUs();
    } catch (err) {
      console.error('Failed to create Business Unit', err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Organization DNA Platform</h1>
          <p className="text-sm text-surface-500 mt-1">Configure and manage organizational structures, locations, grades, and compensation bands.</p>
        </div>
        {activeOrg ? (
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-md"
          >
            <Plus className="w-4 h-4" /> Add BU Node
          </button>
        ) : (
          <button 
            onClick={handleInitOrg}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-md"
          >
            <Plus className="w-4 h-4" /> Initialize Organization DNA
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-surface-200 dark:border-surface-700 flex flex-wrap gap-2">
        {[
          { id: 'hierarchy', label: 'Org Hierarchy Tree', icon: GitBranch },
          { id: 'locations', label: 'Work Locations', icon: MapPin },
          { id: 'grades', label: 'Grades & Levels', icon: Layers },
          { id: 'bands', label: 'Salary Bands', icon: DollarSign }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all outline-none ${
              activeTab === tab.id
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-surface-500 hover:text-surface-700 dark:hover:text-white hover:border-surface-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 p-6 min-h-[400px]">
        {activeTab === 'hierarchy' && (
          <div className="space-y-6">
            <div className="bg-surface-50 dark:bg-surface-900/50 p-4 rounded-xl border border-surface-150 dark:border-surface-700 flex items-start gap-3 text-sm text-surface-600 dark:text-surface-300">
              <Info className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-surface-800 dark:text-white">Single Source of Truth</p>
                <p className="mt-0.5 text-xs text-surface-500">All downstream platform modules (Leave, Payroll, Performance, Assets) automatically consume this DNA layout. No module can define its own department or structure.</p>
              </div>
            </div>

            {!activeOrg ? (
              <div className="text-center py-12 border-2 border-dashed border-surface-250 dark:border-surface-700 rounded-xl">
                <p className="text-surface-500">No organization details found. Initialize the Organization DNA tree to begin.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Org Node */}
                <div className="flex items-center gap-3 py-2 px-3 rounded-lg bg-primary-500/5 dark:bg-primary-500/10 border border-primary-500/15 max-w-2xl">
                  <div className="p-1.5 rounded-lg text-white bg-gradient-to-br from-indigo-500 to-indigo-600">
                    <Building className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-surface-800 dark:text-surface-200">{activeOrg.name}</span>
                    <span className="ml-2 text-[10px] font-mono font-medium text-surface-400 bg-surface-100 dark:bg-surface-800 px-1.5 py-0.5 rounded">
                      {activeOrg.code}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-surface-400">Organization</span>
                </div>

                {/* BU Child Nodes */}
                <div className="pl-6 space-y-2 border-l-2 border-surface-100 dark:border-surface-700 ml-4 py-1">
                  {businessUnits && businessUnits.length > 0 ? (
                    businessUnits.map((bu) => (
                      <div key={bu.id} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-700/50 max-w-xl border border-surface-100 dark:border-surface-700">
                        <div className="p-1.5 rounded-lg text-white bg-gradient-to-br from-purple-500 to-purple-600">
                          <Building className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-semibold text-surface-800 dark:text-surface-200">{bu.name}</span>
                          <span className="ml-2 text-[10px] font-mono font-medium text-surface-400 bg-surface-100 dark:bg-surface-800 px-1.5 py-0.5 rounded">
                            {bu.code}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-surface-400">Business Unit</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-surface-400 italic">No business units created under this organization yet.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'locations' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {locations && locations.length > 0 ? (
              locations.map((loc) => (
                <div key={loc.id} className="border border-surface-200 dark:border-surface-700 rounded-xl p-5 hover:shadow-lg transition-all">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-950/20 flex items-center justify-center text-primary-600">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-surface-800 dark:text-white">{loc.name}</h4>
                        <span className="text-[10px] font-mono bg-surface-100 dark:bg-surface-700 px-1.5 py-0.5 rounded text-surface-500 mt-1 inline-block">
                          {loc.code}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Active
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-6 text-xs text-surface-500 border-t border-surface-100 dark:border-surface-700 pt-4">
                    <div>
                      <p className="text-surface-400">Region</p>
                      <p className="font-medium text-surface-700 dark:text-surface-200 mt-0.5">{loc.city || 'N/A'}, {loc.country || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-surface-400">Timezone</p>
                      <p className="font-medium text-surface-700 dark:text-surface-200 mt-0.5">{loc.timezone || 'PST (UTC-8)'}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-12">
                <p className="text-surface-400">No work locations registered yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'grades' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-surface-250 dark:border-surface-700 text-xs text-surface-400 uppercase">
                  <th className="pb-3 font-semibold">Grade Code</th>
                  <th className="pb-3 font-semibold">Display Name</th>
                  <th className="pb-3 font-semibold">Level Scale</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-700/50 text-sm">
                {grades && grades.length > 0 ? (
                  grades.map((gr) => (
                    <tr key={gr.id} className="hover:bg-surface-50/50 dark:hover:bg-surface-700/10">
                      <td className="py-4 font-mono font-medium text-primary-600 dark:text-primary-400">{gr.code}</td>
                      <td className="py-4 font-semibold text-surface-800 dark:text-surface-200">{gr.name}</td>
                      <td className="py-4 text-surface-500">{gr.level || 'N/A'}</td>
                      <td className="py-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                          {gr.active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-surface-400">No grades or levels registered yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'bands' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bands && bands.length > 0 ? (
              bands.map((bd) => (
                <div key={bd.id} className="bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 p-5 rounded-xl">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-surface-800 dark:text-white">{bd.name}</h4>
                    <span className="text-[10px] font-bold bg-primary-50 text-primary-700 dark:bg-primary-950/20 dark:text-primary-400 px-2 py-0.5 rounded">
                      {bd.active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                  <div className="mt-4 flex items-baseline gap-1 text-primary-600 dark:text-primary-400">
                    <span className="text-xl font-bold">${bd.minSalary?.toLocaleString() || '0'} - ${bd.maxSalary?.toLocaleString() || '0'}</span>
                    <span className="text-xs font-semibold uppercase">{bd.currency || 'USD'} / year</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-12">
                <p className="text-surface-400">No salary bands registered yet.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add BU Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-surface-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-surface-900 dark:text-white">Create Business Unit Node</h3>
            <form onSubmit={handleAddNode} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-surface-400">Business Unit Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Sales BU"
                  value={newNodeName}
                  onChange={e => setNewNodeName(e.target.value)}
                  className="w-full bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500/30"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-surface-400">Business Unit Code</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. BU-SALES"
                  value={newNodeCode}
                  onChange={e => setNewNodeCode(e.target.value)}
                  className="w-full bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500/30"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-surface-500 hover:text-surface-700 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-md"
                >
                  Create Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
