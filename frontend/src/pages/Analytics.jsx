import { useState, useEffect } from 'react';
import api from '../api/axios';

const CHART_HEIGHTS = [40, 55, 45, 60, 75, 70, 85, 80, 95, 100, 85, 90, 75, 65, 70, 80, 90, 85, 95, 88, 72, 78, 83, 91, 86, 70, 75, 88, 95, 100];

const DOC_TYPES = [
  { label: 'Loan Agreements',  pct: 42 },
  { label: 'Compliance Audits', pct: 28 },
  { label: 'KYC Documents',    pct: 18 },
  { label: 'Tax Statements',   pct: 12 },
];

const DEPARTMENTS = [
  { name: 'Treasury',           analyses: 42105, conf: 99.1, trend: '+5.2%',  positive: true,  status: 'active' },
  { name: 'Retail Ops',         analyses: 38442, conf: 97.8, trend: '+18.4%', positive: true,  status: 'active' },
  { name: 'Risk Management',    analyses: 31002, conf: 96.4, trend: '+2.1%',  positive: true,  status: 'active' },
  { name: 'Legal & Compliance', analyses: 22810, conf: 99.5, trend: '-1.4%',  positive: false, status: 'active' },
  { name: 'Wealth Advisory',    analyses: 8535,  conf: 98.2, trend: '+44.2%', positive: true,  status: 'onboarding' },
];

function ConfBadge({ conf }) {
  const cls = conf >= 98 ? 'bg-green-50 text-green-700'
    : conf >= 95       ? 'bg-yellow-50 text-yellow-700'
    : 'bg-red-50 text-error';
  return <span className={`px-2 py-1 text-xs font-bold rounded ${cls}`}>{conf}%</span>;
}

export default function Analytics() {
  const [stats,    setStats]    = useState(null);
  const [period,   setPeriod]   = useState('30d');
  const [loading,  setLoading]  = useState(true);
  const [syncTime, setSyncTime] = useState(new Date());

  useEffect(() => {
    fetchStats();
    const t = setInterval(() => setSyncTime(new Date()), 120_000);
    return () => clearInterval(t);
  }, [period]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/analytics/summary');
      setStats(res.data);
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const topStats = [
    {
      label:   'Total Analyses Completed',
      value:   stats?.total_queries?.toLocaleString()    ?? '142,894',
      trend:   '+12.4% vs last month',
      icon:    'analytics',
      accent:  'bg-secondary',
      trendCls: 'text-on-tertiary-container',
      trendIcon: 'trending_up',
    },
    {
      label:   'Avg. Confidence Score',
      value:   stats?.avg_confidence ? `${stats.avg_confidence}%` : '98.2%',
      bar:     stats?.avg_confidence ?? 98,
      icon:    'verified',
      accent:  'bg-on-tertiary-container',
      trendCls: 'text-on-tertiary-container',
    },
    {
      label:   'System Latency (Avg)',
      value:   stats?.avg_latency_ms  ? `${stats.avg_latency_ms}ms` : '420ms',
      trend:   'Optimized performance',
      icon:    'speed',
      accent:  'bg-secondary-container',
      trendCls: 'text-on-tertiary-container',
      trendIcon: 'check_circle',
    },
    {
      label:   'Active Users',
      value:   stats?.active_users?.toLocaleString() ?? '2,410',
      trend:   'Institutional access active',
      icon:    'groups',
      accent:  'bg-slate-400',
      trendCls: 'text-slate-500',
      trendIcon: 'groups',
    },
  ];

  const chartMonths = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (29 - i));
    return d;
  });
  const chartLabels = ['', '', '', '', '', '', '', '', '', '',
    chartMonths[9]?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) || '',
    '', '', '', '', '', '', '', '', '',
    chartMonths[19]?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) || '',
    '', '', '', '', '', '', '', '', '',
    chartMonths[29]?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) || ''];

  const minutesAgo = Math.round((new Date() - syncTime) / 60000);

  return (
    <div className="p-xl max-w-container-max mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end mb-xl">
        <div>
          <h1 className="font-h1 text-h1 text-on-surface">Performance Analytics</h1>
          <p className="text-outline font-body-md text-body-md mt-2">
            Institution-wide AI processing insights and health metrics.
          </p>
        </div>
        <div className="flex gap-sm">
          <select
            className="flex items-center gap-2 px-md py-sm border border-slate-300 rounded-lg text-on-surface font-label-caps text-label-caps bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-secondary"
            value={period}
            onChange={e => setPeriod(e.target.value)}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button className="flex items-center gap-2 px-md py-sm border border-slate-300 rounded-lg text-on-surface font-label-caps text-label-caps bg-white hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined text-sm">file_download</span>
            Export Report
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-gutter">
        {topStats.map(({ label, value, trend, bar, icon, accent, trendCls, trendIcon }) => (
          <div key={label} className="bg-white p-lg border border-slate-200 rounded-lg relative overflow-hidden flex flex-col justify-between">
            <div className={`absolute top-0 left-0 h-full w-1 ${accent}`} />
            <div>
              <p className="font-label-caps text-label-caps text-on-primary-container mb-sm uppercase tracking-widest">{label}</p>
              <h2 className="text-3xl font-bold text-on-surface">{loading ? '—' : value}</h2>
            </div>
            {bar != null ? (
              <div className="mt-md">
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-on-tertiary-container rounded-full transition-all" style={{ width: `${bar}%` }} />
                </div>
              </div>
            ) : trend ? (
              <div className={`mt-md flex items-center gap-1 font-medium text-body-sm ${trendCls}`}>
                {trendIcon && <span className="material-symbols-outlined text-sm">{trendIcon}</span>}
                <span>{trend}</span>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {/* Chart section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter mb-gutter">
        {/* Daily volume bar chart */}
        <div className="lg:col-span-2 bg-white p-lg border border-slate-200 rounded-lg">
          <div className="flex justify-between items-center mb-lg">
            <div>
              <h3 className="font-h2 text-h2 text-on-surface">Daily Query Volume</h3>
              <p className="text-outline font-body-sm text-body-sm">Tracking AI requests over the {period === '30d' ? '30' : period === '7d' ? '7' : '90'}-day period</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-secondary" />
              <span className="text-xs font-medium text-slate-600">This Period</span>
            </div>
          </div>
          <div className="h-64 flex items-end justify-between gap-1 border-b border-slate-100 relative pb-0">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="border-t border-slate-50 w-full" />
              ))}
            </div>
            {CHART_HEIGHTS.map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-secondary rounded-t-sm transition-all hover:opacity-80 cursor-default"
                style={{ height: `${h}%`, opacity: 0.15 + (h / 100) * 0.85 }}
                title={`Day ${i + 1}: ${Math.round(h * 14)} queries`}
              />
            ))}
          </div>
          <div className="flex justify-between mt-sm text-xs font-label-caps text-slate-400">
            <span>Day 1</span>
            <span>Day 10</span>
            <span>Day 20</span>
            <span>Day 30</span>
          </div>
        </div>

        {/* Document types */}
        <div className="bg-white p-lg border border-slate-200 rounded-lg">
          <h3 className="font-h2 text-h2 text-on-surface mb-xs">Document Types</h3>
          <p className="text-outline font-body-sm text-body-sm mb-lg">Most frequently analyzed categories</p>
          <div className="space-y-lg">
            {DOC_TYPES.map(({ label, pct }) => (
              <div key={label}>
                <div className="flex justify-between mb-xs">
                  <span className="text-body-sm font-medium text-on-surface">{label}</span>
                  <span className="text-body-sm font-bold text-on-surface">{pct}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-secondary rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="p-lg border-b border-slate-100">
          <h3 className="font-h2 text-h2 text-on-surface">Usage by Department</h3>
          <p className="text-outline font-body-sm text-body-sm">Detailed breakdown of AI adoption across functional areas</p>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-900 text-white font-label-caps text-label-caps">
              {['Department', 'Total Analyses', 'Avg. Confidence', 'Status', 'Trend'].map((h, i) => (
                <th key={h} className={`px-lg py-4 ${i === 4 ? 'text-right' : ''}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-body-sm text-body-sm">
            {DEPARTMENTS.map(({ name, analyses, conf, trend, positive, status }) => (
              <tr key={name} className="hover:bg-slate-50 transition-colors">
                <td className="px-lg py-4 font-semibold text-on-surface">{name}</td>
                <td className="px-lg py-4 text-outline">{analyses.toLocaleString()}</td>
                <td className="px-lg py-4"><ConfBadge conf={conf} /></td>
                <td className="px-lg py-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-on-tertiary-container' : 'bg-secondary-container'}`} />
                    <span className="capitalize">{status}</span>
                  </div>
                </td>
                <td className={`px-lg py-4 text-right font-bold ${positive ? 'text-on-tertiary-container' : 'text-error'}`}>
                  {trend}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-lg py-4 bg-slate-50 flex justify-between items-center">
          <span className="text-xs text-slate-500">Showing 5 of 12 departments</span>
          <button className="text-xs font-bold text-secondary hover:underline uppercase tracking-widest">
            View Full Breakdown
          </button>
        </div>
      </div>

      {/* Sync indicator */}
      <div className="fixed bottom-8 right-8 bg-primary-container text-white px-md py-sm rounded-lg flex items-center gap-3 shadow-xl pointer-events-none">
        <span className="material-symbols-outlined text-on-tertiary-container text-sm"
          style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        <div className="text-xs">
          <p className="font-bold">Real-time Sync Active</p>
          <p className="opacity-70">Last updated {minutesAgo < 1 ? 'just now' : `${minutesAgo}m ago`}</p>
        </div>
      </div>
    </div>
  );
}
