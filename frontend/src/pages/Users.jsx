import { useState, useEffect } from 'react';
import api from '../api/axios';

const DEFINED_ROLES = [
  { id: 'compliance_officer', name: 'Compliance Officer', desc: 'Oversees regulatory adherence and policy implementation.', count: 6, active: true },
  { id: 'data_auditor',       name: 'Data Auditor',       desc: 'Analyzes historical transaction logs for anomaly detection.', count: 13, active: false },
  { id: 'staff_user',         name: 'General Staff',      desc: 'Standard access to operational banking modules.', count: 86, active: false },
  { id: 'bank_admin',         name: 'Super Admin',        desc: 'Unrestricted root access to all system modules.', count: 2, active: false },
];

const PERMISSIONS = {
  'Data Privacy & Assets': [
    { icon: 'visibility',     label: 'View PII (Personal Identifiable Information)', desc: 'Allow viewing of full customer identity data.',         key: 'view_pii',     default: true },
    { icon: 'file_download',  label: 'Export Large Datasets',                        desc: 'Permit bulk export of historical financial records.',   key: 'export_data',  default: false },
  ],
  'System Governance': [
    { icon: 'settings_suggest', label: 'Modify Security Protocols', desc: 'Adjust internal firewall and AI audit parameters.',    key: 'modify_security', default: true },
    { icon: 'gavel',           label: 'Approve Audit Reports',      desc: 'Final sign-off authority for quarterly compliance logs.', key: 'approve_audits', default: true },
  ],
  'Document Management': [
    { icon: 'upload_file',    label: 'Upload Documents',   desc: 'Ingest new documents into the knowledge base.', key: 'upload_docs', default: true },
    { icon: 'delete_forever', label: 'Delete Documents',   desc: 'Permanently remove documents from system.',   key: 'delete_docs', default: false },
  ],
};

function Toggle({ on, onChange }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${on ? 'bg-secondary' : 'bg-slate-200'}`}
    >
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${on ? 'left-6' : 'left-1'}`} />
    </button>
  );
}

export default function Users() {
  const [users,       setUsers]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [selectedRole, setSelectedRole] = useState(DEFINED_ROLES[0]);
  const [permissions, setPermissions] = useState(() => {
    const init = {};
    Object.values(PERMISSIONS).flat().forEach(p => { init[p.key] = p.default; });
    return init;
  });
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'staff_user' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch {
      setUsers([
        { id: 1, name: 'Sarah Jenkins', email: 's.jenkins@bankai.com', role: 'compliance_officer', created_at: new Date().toISOString() },
        { id: 2, name: 'Marcus Thorne', email: 'm.thorne@bankai.com',  role: 'compliance_officer', created_at: new Date(Date.now() - 86400000).toISOString() },
        { id: 3, name: 'Elena Lu',      email: 'e.lu@bankai.com',      role: 'data_auditor',       created_at: new Date(Date.now() - 259200000).toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/users', { ...inviteForm, password: 'BankAi@2024!', bank_id: 1 });
      await fetchUsers();
      setShowInvite(false);
      setInviteForm({ name: '', email: '', role: 'staff_user' });
    } catch (err) {
      alert(err?.response?.data?.detail || 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Remove this user? This action cannot be undone.')) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers(u => u.filter(x => x.id !== id));
    } catch {
      alert('Failed to remove user');
    }
  };

  const ROLE_LABELS = {
    super_admin: 'Super Admin', bank_admin: 'Bank Admin',
    compliance_officer: 'Compliance Officer', data_auditor: 'Data Auditor',
    staff_user: 'Staff User',
  };

  return (
    <div className="p-xl max-w-container-max mx-auto">
      {/* Header */}
      <div className="mb-lg flex justify-between items-end">
        <div>
          <h1 className="text-h1 font-h1 text-on-surface">Roles & Permissions</h1>
          <p className="font-body-md text-on-surface-variant mt-sm">
            Manage institutional access hierarchy and granular security protocols.
          </p>
        </div>
        <div className="flex gap-md">
          <button className="px-md py-sm border border-slate-300 rounded-lg font-label-caps text-label-caps text-on-surface hover:bg-white transition-colors">
            Export Logs
          </button>
          <button onClick={() => setShowInvite(true)}
            className="px-md py-sm bg-primary text-white rounded-lg font-label-caps text-label-caps flex items-center gap-xs hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined text-[16px]">add</span>
            Create New User
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-gutter">
        {/* Roles list */}
        <section className="col-span-4 space-y-md">
          <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-md">Defined Roles</h3>
          {DEFINED_ROLES.map(role => (
            <div key={role.id}
              onClick={() => setSelectedRole(role)}
              className={`p-md border border-slate-200 cursor-pointer transition-all ${
                selectedRole.id === role.id
                  ? 'bg-white border-l-4 border-l-secondary shadow-sm'
                  : 'bg-surface-container-low hover:bg-white'
              }`}>
              <div className="flex justify-between items-start mb-xs">
                <h4 className="text-body-md font-bold text-on-surface">{role.name}</h4>
                {role.active && (
                  <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                    Active
                  </span>
                )}
              </div>
              <p className="text-body-sm text-on-surface-variant">{role.desc}</p>
              <div className="mt-md flex items-center gap-2">
                {[...Array(Math.min(3, role.count))].map((_, i) => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
                {role.count > 3 && (
                  <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                    +{role.count - 3}
                  </div>
                )}
              </div>
            </div>
          ))}
        </section>

        {/* Permissions + Users */}
        <section className="col-span-8 flex flex-col gap-gutter">
          {/* Permissions config */}
          <div className="bg-white border border-slate-200 p-lg shadow-sm rounded-lg">
            <div className="flex justify-between items-center mb-lg border-b border-slate-100 pb-md">
              <div>
                <h3 className="text-h2 font-h2 text-on-surface">Permissions Configuration</h3>
                <p className="text-body-sm text-on-surface-variant">
                  Modifying <span className="font-bold text-on-surface">{selectedRole.name}</span> role
                </p>
              </div>
              <div className="flex items-center gap-md">
                <span className="font-label-caps text-label-caps text-on-surface-variant">
                  Security Score:{' '}
                  <span className="text-on-tertiary-container bg-tertiary-fixed-dim px-2 py-0.5 rounded">98% Secure</span>
                </span>
              </div>
            </div>

            <div className="space-y-sm">
              {Object.entries(PERMISSIONS).map(([section, perms]) => (
                <div key={section}>
                  <div className="font-label-caps text-[10px] text-on-surface-variant uppercase mb-xs px-2 tracking-widest">{section}</div>
                  {perms.map(perm => (
                    <div key={perm.key}
                      className="flex items-center justify-between p-md bg-slate-50 border border-slate-100 hover:bg-white transition-colors">
                      <div className="flex items-center gap-md">
                        <span className={`material-symbols-outlined ${permissions[perm.key] ? 'text-secondary' : 'text-slate-400'}`}>
                          {perm.icon}
                        </span>
                        <div>
                          <p className="font-body-md font-semibold text-on-surface">{perm.label}</p>
                          <p className="text-body-sm text-on-surface-variant text-xs">{perm.desc}</p>
                        </div>
                      </div>
                      <Toggle
                        on={permissions[perm.key]}
                        onChange={val => setPermissions(p => ({ ...p, [perm.key]: val }))}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="mt-xl flex justify-end gap-md pt-lg border-t border-slate-100">
              <button
                onClick={() => {
                  const init = {};
                  Object.values(PERMISSIONS).flat().forEach(p => { init[p.key] = p.default; });
                  setPermissions(init);
                }}
                className="px-lg py-sm font-label-caps text-label-caps text-on-surface-variant hover:text-on-surface transition-colors">
                Discard Changes
              </button>
              <button className="px-xl py-sm bg-primary text-white rounded font-label-caps text-label-caps hover:bg-slate-800 transition-colors">
                Apply Secure Update
              </button>
            </div>
          </div>

          {/* User assignment table */}
          <div className="bg-white border border-slate-200 p-lg shadow-sm rounded-lg">
            <h3 className="text-body-lg font-bold text-on-surface mb-md">User Assignment</h3>
            <div className="overflow-hidden border border-slate-100 rounded">
              <table className="w-full text-left">
                <thead className="bg-primary-container text-on-primary font-label-caps text-[10px]">
                  <tr>
                    {['Employee Name', 'Email Address', 'Current Role', 'Last Active', 'Actions'].map((h, i) => (
                      <th key={h} className={`px-md py-sm ${i === 4 ? 'text-right' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="font-body-sm divide-y divide-slate-50">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-md py-8 text-center text-slate-400">Loading users...</td>
                    </tr>
                  ) : users.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-md py-md">
                        <div className="flex items-center gap-sm">
                          <div className="w-8 h-8 rounded bg-slate-200 flex items-center justify-center font-bold text-slate-500 text-[11px] flex-shrink-0">
                            {user.name?.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-semibold text-on-surface">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-md py-md text-slate-500 text-body-sm">{user.email}</td>
                      <td className="px-md py-md">
                        <span className="bg-surface-container-high px-2 py-1 rounded text-xs font-medium text-on-surface">
                          {ROLE_LABELS[user.role] || user.role}
                        </span>
                      </td>
                      <td className="px-md py-md text-slate-500 text-body-sm">
                        {user.last_login
                          ? new Date(user.last_login).toLocaleDateString()
                          : new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-md py-md text-right">
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="material-symbols-outlined text-slate-400 hover:text-error transition-colors cursor-pointer text-[18px]">
                          delete_outline
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-md flex justify-center">
              <button className="text-secondary font-label-caps text-xs flex items-center gap-xs hover:underline">
                View All Members
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Invite modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-lg">
            <div className="flex justify-between items-center mb-lg">
              <h3 className="text-h2 font-h2 text-on-surface">Create New User</h3>
              <button onClick={() => setShowInvite(false)}
                className="material-symbols-outlined text-slate-400 hover:text-slate-900 cursor-pointer">
                close
              </button>
            </div>
            <form onSubmit={handleInvite} className="space-y-md">
              <div>
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase block mb-xs">Full Name</label>
                <input required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-md py-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                  value={inviteForm.name}
                  onChange={e => setInviteForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase block mb-xs">Email Address</label>
                <input required type="email"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-md py-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                  value={inviteForm.email}
                  onChange={e => setInviteForm(f => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div>
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase block mb-xs">Role</label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-md py-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                  value={inviteForm.role}
                  onChange={e => setInviteForm(f => ({ ...f, role: e.target.value }))}
                >
                  <option value="staff_user">Staff User</option>
                  <option value="data_auditor">Data Auditor</option>
                  <option value="compliance_officer">Compliance Officer</option>
                  <option value="bank_admin">Bank Admin</option>
                </select>
              </div>
              <div className="flex gap-md pt-md">
                <button type="button" onClick={() => setShowInvite(false)}
                  className="flex-1 py-sm border border-slate-300 rounded-lg font-label-caps text-label-caps text-on-surface hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-sm bg-primary text-white rounded-lg font-label-caps text-label-caps disabled:opacity-50 hover:bg-slate-800 transition-colors">
                  {saving ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
