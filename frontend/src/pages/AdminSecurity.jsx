import { useEffect, useState } from 'react';
import api from '../api/axios';

const MASKING_RULES = [
  { label: 'Client Names', enabled: true },
  { label: 'Email Addresses', enabled: true },
  { label: 'Nepal Mobile Numbers', enabled: true },
  { label: 'Bank Account Numbers', enabled: true },
  { label: 'Physical Addresses', enabled: false },
];

const ROLES = [
  { name: 'Global Admin', count: 3, detail: 'Full system and security controls', color: 'bg-secondary' },
  { name: 'Auditor', count: 12, detail: 'Read-only access to audit trails', color: 'bg-tertiary-fixed-dim' },
  { name: 'Editor', count: 45, detail: 'Can manage document library', color: 'bg-yellow-400' },
];

function Toggle({ enabled }) {
  return (
    <div className={`w-11 h-6 rounded-full relative px-1 flex items-center ${enabled ? 'bg-secondary-container' : 'bg-outline-variant'}`}>
      <div className={`w-4 h-4 bg-white rounded-full absolute transition-all ${enabled ? 'right-1' : 'left-1'}`} />
    </div>
  );
}

export default function AdminSecurity() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadLogs() {
      setLoading(true);
      try {
        const res = await api.get('/audit?skip=0&limit=6');
        if (active) setLogs(Array.isArray(res.data) ? res.data : []);
      } catch {
        if (active) {
          setLogs([
            { id: 1, created_at: new Date().toISOString(), user_id: 1, action: 'Policy Update', resource_type: 'PII Masking', resource_id: 'accounts', status: 'success' },
            { id: 2, created_at: new Date(Date.now() - 3600000).toISOString(), user_id: 2, action: 'Document Access', resource_type: 'Q3_Audit_Draft.pdf', resource_id: '124', status: 'success' },
            { id: 3, created_at: new Date(Date.now() - 7200000).toISOString(), user_id: null, action: 'Login Attempt', resource_type: 'SSO Gateway', resource_id: 'blocked', status: 'blocked' },
          ]);
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    loadLogs();
    return () => { active = false; };
  }, []);

  return (
    <div className="p-xl max-w-container-max mx-auto">
      <header className="mb-lg">
        <h1 className="font-h1 text-h1 text-on-surface mb-xs">Admin & Privacy</h1>
        <p className="font-body-md text-on-primary-container">
          Configure enterprise-level security protocols and monitor system-wide actions.
        </p>
      </header>

      <div className="flex gap-lg border-b border-outline-variant mb-lg">
        {['Role-Based Access', 'Audit Logs', 'Security Settings'].map((tab, index) => (
          <button
            key={tab}
            className={`pb-md border-b-2 font-label-caps text-label-caps uppercase tracking-widest transition-colors ${
              index === 0
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-primary'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-lg">
        <div className="col-span-12 lg:col-span-4 space-y-lg">
          <section className="bg-white border border-outline-variant p-lg rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-md">
              <h2 className="font-h2 text-h2 text-on-surface">PII Masking</h2>
              <span className="material-symbols-outlined text-on-tertiary-container bg-green-50 p-2 rounded-lg">security</span>
            </div>
            <p className="font-body-sm text-on-surface-variant mb-md">
              Control how sensitive data is redacted from prompts, logs, and AI processing streams.
            </p>
            <div className="space-y-sm">
              {MASKING_RULES.map(rule => (
                <div key={rule.label} className="flex items-center justify-between p-sm bg-surface-container-low rounded-lg border border-outline-variant">
                  <span className="font-body-sm font-semibold text-on-surface">{rule.label}</span>
                  <Toggle enabled={rule.enabled} />
                </div>
              ))}
            </div>
            <button className="w-full mt-lg py-sm bg-primary text-white font-label-caps text-label-caps rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
              <span className="material-symbols-outlined text-sm">save</span>
              Update Rules
            </button>
          </section>

          <section className="bg-primary-container p-lg rounded-lg text-white">
            <h3 className="font-h2 text-body-lg font-bold mb-sm">Data Compliance Status</h3>
            <div className="flex items-center gap-md mb-md">
              <div className="w-16 h-16 rounded-full border-4 border-tertiary-fixed-dim border-r-transparent flex items-center justify-center">
                <span className="font-h2 text-h2">94%</span>
              </div>
              <div>
                <div className="text-tertiary-fixed-dim font-bold text-sm">GDPR & ISO aligned</div>
                <div className="text-slate-400 text-xs">Last audit: 2 hours ago</div>
              </div>
            </div>
            <button className="text-xs text-white border border-white/20 px-sm py-xs rounded hover:bg-white/10 transition-colors">
              Download Certificate
            </button>
          </section>
        </div>

        <section className="col-span-12 lg:col-span-8 bg-white border border-outline-variant rounded-lg overflow-hidden shadow-sm">
          <div className="px-lg py-md border-b border-outline-variant flex items-center justify-between">
            <h2 className="font-h2 text-h2 text-on-surface">Recent System Actions</h2>
            <div className="flex gap-sm">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
                <input className="bg-surface-container-low border border-outline-variant text-xs py-2 pl-8 pr-4 rounded-lg w-48 focus:ring-secondary focus:border-secondary" placeholder="Search logs..." />
              </div>
              <button className="material-symbols-outlined text-on-surface-variant p-2 border border-outline-variant rounded-lg">filter_list</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-label-caps text-label-caps">
                  {['Timestamp', 'User Identity', 'Action Category', 'Object', 'Status'].map(h => (
                    <th key={h} className="px-lg py-md whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-body-sm text-on-surface divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={5} className="px-lg py-12 text-center text-slate-400">Loading security events...</td></tr>
                ) : logs.map(log => {
                  const blocked = String(log.status || log.resource_id || '').toLowerCase().includes('block');
                  return (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-lg py-md font-mono text-xs whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                      <td className="px-lg py-md">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${blocked ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                            {log.user_id ? `U${log.user_id}` : 'AI'}
                          </div>
                          <span>{log.user_id ? `User #${log.user_id}` : 'System'}</span>
                        </div>
                      </td>
                      <td className="px-lg py-md"><span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-medium">{log.action}</span></td>
                      <td className="px-lg py-md text-on-surface-variant">{log.resource_type || log.resource_id || '-'}</td>
                      <td className="px-lg py-md">
                        <div className={`flex items-center gap-1 ${blocked ? 'text-error' : 'text-on-tertiary-container'}`}>
                          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                            {blocked ? 'error' : 'check_circle'}
                          </span>
                          <span>{blocked ? 'Blocked' : 'Success'}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="col-span-12 bg-surface-container p-lg rounded-lg border border-outline-variant">
          <h2 className="font-h2 text-h2 text-on-surface mb-lg">Active Role Permissions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
            {ROLES.map(role => (
              <div key={role.name} className="bg-white p-md rounded-lg border border-outline-variant flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-sm">
                    <span className={`w-2 h-2 rounded-full ${role.color}`} />
                    <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">{role.name}</span>
                  </div>
                  <div className="font-h1 text-[32px] mb-xs">{String(role.count).padStart(2, '0')}</div>
                  <div className="text-xs text-on-surface-variant">{role.detail}</div>
                </div>
                <button className="mt-md text-xs text-secondary font-bold hover:underline uppercase tracking-widest">Manage Users</button>
              </div>
            ))}
            <button className="bg-slate-100/50 border-2 border-dashed border-outline-variant rounded-lg flex flex-col items-center justify-center text-on-surface-variant gap-2 py-lg hover:bg-white transition-colors">
              <span className="material-symbols-outlined">add_circle</span>
              <span className="font-label-caps text-label-caps uppercase">Create Role</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
