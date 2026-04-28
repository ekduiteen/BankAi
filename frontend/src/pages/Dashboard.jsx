import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const QUICK_START = [
  {
    icon: 'monitoring',
    title: 'Analyze Financial Report',
    desc: 'Extract P&L metrics, variance analysis, and KPIs from quarterly filings.',
    prompt: 'Please analyze this financial report and extract key P&L metrics.',
  },
  {
    icon: 'policy',
    title: 'Compliance Check',
    desc: 'Validate documents against NRB directives and internal governance frameworks.',
    prompt: 'Check this document for compliance with NRB regulations.',
  },
  {
    icon: 'contract',
    title: 'Loan Agreement Audit',
    desc: 'Extract key dates, interest rates, and clauses from loan agreements.',
    prompt: 'Audit this loan agreement and highlight any discrepancies.',
  },
  {
    icon: 'rule',
    title: 'Policy Comparison',
    desc: 'Compare uploaded policy documents against approved internal standards.',
    prompt: 'Compare this policy document against approved internal standards.',
  },
];

const STATUS_BADGE = {
  COMPLETED: 'badge-verified',
  'IN REVIEW': 'badge-processing',
  FAILED:     'badge-failed',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats]     = useState(null);
  const [sessions, setSessions] = useState([]);
  const [pinnedDocs, setPinnedDocs] = useState([]);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    Promise.allSettled([
      api.get('/analytics/summary'),
      api.get('/chat/sessions?limit=5'),
      api.get('/documents?limit=3'),
    ]).then(([statsRes, sessRes, docsRes]) => {
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      if (sessRes.status === 'fulfilled')  setSessions(sessRes.value.data);
      if (docsRes.status === 'fulfilled')  setPinnedDocs(docsRes.value.data.slice(0, 3));
    });
  }, []);

  const startChatWith = async (prompt) => {
    try {
      const res = await api.post('/chat/sessions', { title: prompt.slice(0, 60) });
      navigate(`/chat?session=${res.data.id}&prompt=${encodeURIComponent(prompt)}`);
    } catch (_) {
      navigate('/chat');
    }
  };

  const docIcon = (type) => {
    const t = (type || '').toLowerCase();
    if (t === 'pdf')  return 'description';
    if (t === 'xlsx' || t === 'xls') return 'table_chart';
    if (t === 'docx') return 'article';
    if (t === 'pptx') return 'slideshow';
    return 'folder_zip';
  };

  return (
    <div className="p-xl max-w-container-max mx-auto">
      {/* Welcome */}
      <section className="mb-xl">
        <h1 className="text-h1 font-h1 text-on-background mb-sm">
          Welcome back, {user.name?.split(' ')[0] || 'Administrator'}
        </h1>
        <p className="text-body-lg text-outline mb-lg">
          Secure financial analysis and document auditing powered by BankAi.
        </p>

        {/* Hero banner */}
        <div className="relative w-full h-40 rounded-xl overflow-hidden bg-primary-container flex items-end p-lg">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #ffffff 0, #ffffff 1px, transparent 0, transparent 50%)',
            backgroundSize: '20px 20px',
          }} />
          <div className="flex items-center gap-3 z-10">
            <span className="px-2.5 py-1 bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold uppercase rounded">
              System Status: Active
            </span>
            <span className="text-body-sm text-white/80">
              All AI engines performing within optimal parameters.
            </span>
          </div>
        </div>
      </section>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-gutter mb-xl">
        {[
          { label: 'Documents Indexed',  value: stats?.total_documents  ?? '—', icon: 'description',    accent: 'border-l-secondary' },
          { label: 'Active Sessions',    value: stats?.active_sessions   ?? '—', icon: 'chat_bubble',    accent: 'border-l-tertiary-fixed-dim' },
          { label: 'Queries This Week',  value: stats?.queries_this_week ?? '—', icon: 'search',         accent: 'border-l-secondary' },
          { label: 'Security Events',    value: stats?.security_events   ?? '0', icon: 'gpp_maybe',      accent: 'border-l-error' },
        ].map(({ label, value, icon, accent }) => (
          <div key={label} className={`bg-white border border-slate-200 border-l-4 ${accent} rounded-lg p-md flex items-center gap-md`}>
            <div className="w-10 h-10 bg-surface-container-low rounded flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-secondary text-[20px]">{icon}</span>
            </div>
            <div>
              <p className="font-label-caps text-label-caps text-outline uppercase">{label}</p>
              <p className="text-2xl font-bold text-on-surface mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-12 gap-gutter">
        {/* Quick-start (col 1–8) */}
        <div className="col-span-12 lg:col-span-8">
          <div className="mb-md flex justify-between items-end">
            <h2 className="text-h2 font-h2 text-on-background">Quick-start Analysis</h2>
            <button
              onClick={() => navigate('/chat')}
              className="font-label-caps text-label-caps text-secondary font-bold hover:underline uppercase"
            >
              Open Chat →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            {QUICK_START.map(({ icon, title, desc, prompt }) => (
              <button
                key={title}
                onClick={() => startChatWith(prompt)}
                className="text-left p-lg bg-white border border-slate-200 rounded-lg hover:border-secondary transition-colors group"
              >
                <div className="flex items-start justify-between mb-md">
                  <div className="p-sm bg-surface-container rounded">
                    <span className="material-symbols-outlined text-secondary">{icon}</span>
                  </div>
                  <span className="material-symbols-outlined text-outline group-hover:text-secondary transition-colors">
                    arrow_forward
                  </span>
                </div>
                <h3 className="font-bold text-body-md text-on-surface mb-xs">{title}</h3>
                <p className="text-body-sm text-outline leading-relaxed">{desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Pinned documents (col 9–12) */}
        <div className="col-span-12 lg:col-span-4">
          <div className="mb-md flex justify-between items-end">
            <h2 className="text-h2 font-h2 text-on-background">Pinned</h2>
            <span className="material-symbols-outlined text-outline cursor-pointer hover:text-on-surface">push_pin</span>
          </div>
          <div className="space-y-sm">
            {pinnedDocs.length > 0 ? pinnedDocs.map(doc => (
              <div
                key={doc.id}
                onClick={() => navigate('/documents')}
                className="p-md bg-white border border-slate-200 border-l-4 border-l-secondary rounded flex items-center gap-md cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <span className="material-symbols-outlined text-secondary">{docIcon(doc.file_type)}</span>
                <div className="flex-1 overflow-hidden">
                  <div className="font-bold text-body-sm truncate text-on-surface">{doc.file_name}</div>
                  <div className="font-label-caps text-[10px] text-outline uppercase tracking-wider mt-0.5">
                    {doc.status === 'approved' ? 'Verified by AI' : `Status: ${doc.status}`}
                  </div>
                </div>
              </div>
            )) : (
              <div className="p-md bg-white border border-slate-200 rounded text-body-sm text-outline text-center py-8">
                No documents uploaded yet.
                <button onClick={() => navigate('/documents')} className="block mx-auto mt-2 text-secondary font-medium hover:underline">
                  Upload your first document →
                </button>
              </div>
            )}
          </div>

          {/* Features discovery card */}
          <div
            onClick={() => navigate('/features')}
            className="mt-lg p-lg bg-secondary-container rounded-lg text-white cursor-pointer hover:opacity-90 transition-opacity"
          >
            <div className="flex items-center gap-2 mb-sm">
              <span className="material-symbols-outlined text-on-secondary-container text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                lightbulb
              </span>
              <span className="font-label-caps text-[10px] tracking-widest text-on-secondary-container">Explore Features</span>
            </div>
            <div className="font-semibold text-body-md text-on-secondary-container">
              Discover all BankAi capabilities
            </div>
            <p className="text-[11px] text-on-secondary-container opacity-70 mt-xs">
              View detailed documentation of every feature and integration option.
            </p>
          </div>

          {/* Trust score card */}
          <div className="mt-lg p-lg bg-primary-container rounded-lg text-white">
            <div className="flex items-center gap-2 mb-sm">
              <span className="material-symbols-outlined text-tertiary-fixed text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified
              </span>
              <span className="font-label-caps text-[10px] tracking-widest text-on-primary-container">SYSTEM INTEGRITY</span>
            </div>
            <div className="text-4xl font-bold font-public-sans">
              {stats?.trust_score ? `${stats.trust_score}%` : '—'}
            </div>
            <p className="text-[11px] text-on-primary-container opacity-70 mt-xs">
              AI-verified across all processed documents this month.
            </p>
          </div>
        </div>

        {/* Recent sessions (full-width bottom) */}
        <div className="col-span-12 mt-lg">
          <div className="mb-md flex justify-between items-end">
            <h2 className="text-h2 font-h2 text-on-background">Recent Sessions</h2>
            <button
              onClick={() => navigate('/sessions')}
              className="flex items-center gap-1 text-body-sm text-outline hover:text-secondary transition-colors"
            >
              View full history
              <span className="material-symbols-outlined text-[18px]">history</span>
            </button>
          </div>

          {sessions.length > 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-900 text-white">
                  <tr>
                    {['Session Intent', 'Status', 'Documents', 'Timestamp', ''].map(h => (
                      <th key={h} className="px-lg py-md font-label-caps text-label-caps">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sessions.map(sess => {
                    const activeDocs = JSON.parse(sess.active_document_ids_json || '[]');
                    return (
                      <tr
                        key={sess.id}
                        onClick={() => navigate(`/chat?session=${sess.id}`)}
                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <td className="px-lg py-md">
                          <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-outline text-[18px]">chat_bubble_outline</span>
                            <span className="font-semibold text-body-sm text-on-surface truncate max-w-xs">{sess.title}</span>
                          </div>
                        </td>
                        <td className="px-lg py-md">
                          <span className="badge-verified">
                            <span className="w-1.5 h-1.5 rounded-full bg-on-tertiary-container"></span>
                            Completed
                          </span>
                        </td>
                        <td className="px-lg py-md text-body-sm text-outline">
                          {activeDocs.length} file{activeDocs.length !== 1 ? 's' : ''}
                        </td>
                        <td className="px-lg py-md text-body-sm text-outline whitespace-nowrap">
                          {new Date(sess.created_at).toLocaleString()}
                        </td>
                        <td className="px-lg py-md text-right">
                          <span className="material-symbols-outlined text-outline hover:text-on-surface cursor-pointer">chevron_right</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
              <span className="material-symbols-outlined text-slate-300 text-5xl">chat_bubble_outline</span>
              <p className="text-body-md text-outline mt-4">No sessions yet.</p>
              <button
                onClick={() => navigate('/chat')}
                className="mt-3 btn-primary inline-flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">add_comment</span>
                Start your first analysis
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
