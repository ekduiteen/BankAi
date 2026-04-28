const COMPLIANCE_CARDS = [
  { title: 'Basel III', subtitle: 'Capital Adequacy Ratio', status: 'Compliant', value: '14.2%', accent: 'bg-on-tertiary-container', badge: 'bg-green-50 text-on-tertiary-container' },
  { title: 'GDPR', subtitle: 'Data Privacy Control', status: 'Audit Pending', value: '92%', accent: 'bg-secondary-container', badge: 'bg-blue-50 text-secondary' },
  { title: 'AML / KYC', subtitle: 'Anti-Money Laundering', status: 'Critical Alert', value: '12 flags', accent: 'bg-error', badge: 'bg-red-50 text-error' },
  { title: 'IFRS 9', subtitle: 'Financial Reporting', status: 'On Track', value: '14 days', accent: 'bg-slate-400', badge: 'bg-slate-100 text-slate-600' },
];

const ALERTS = [
  ['Critical', 'Unusual transaction pattern detected', 'Suspicious multi-hop transfer exceeding threshold.', '2 mins ago', 'bg-red-600', 'text-error'],
  ['High', 'Expired KYC documentation', 'Residency proof requires immediate refresh.', '45 mins ago', 'bg-orange-400', 'text-orange-600'],
  ['Medium', 'Data residency log missing', 'Backup integrity check showed delayed log delivery.', '3 hours ago', 'bg-yellow-300', 'text-yellow-600'],
];

const HEATMAP = [
  ['Treasury', ['bg-green-100', 'bg-green-200', 'bg-green-300', 'bg-yellow-100', 'bg-yellow-200']],
  ['Retail Ops', ['bg-green-200', 'bg-green-400', 'bg-orange-300', 'bg-orange-500', 'bg-red-400']],
  ['Lending', ['bg-orange-200', 'bg-orange-400', 'bg-red-500', 'bg-red-600', 'bg-red-800']],
  ['IT/Cyber', ['bg-green-100', 'bg-green-200', 'bg-green-300', 'bg-yellow-400', 'bg-orange-400']],
];

export default function ComplianceRisk() {
  return (
    <div className="p-xl max-w-container-max mx-auto">
      <div className="flex justify-between items-end mb-xl">
        <div>
          <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest mb-sm block">
            Enterprise Compliance Monitor
          </span>
          <h1 className="font-h1 text-h1 text-on-surface">Global Risk Overview</h1>
        </div>
        <button className="bg-primary text-white px-lg py-sm rounded-lg text-sm font-bold flex items-center gap-2 hover:opacity-90">
          <span className="material-symbols-outlined text-sm">download</span>
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-12 gap-gutter">
        <section className="col-span-12 lg:col-span-4 bg-white border border-outline-variant p-lg rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-secondary" />
          <h2 className="font-h2 text-h2 mb-lg text-center">Aggregate Risk Score</h2>
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90">
              <circle className="text-slate-100" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeWidth="12" />
              <circle className="text-secondary" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeDasharray="552.92" strokeDashoffset="138.23" strokeWidth="12" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black text-on-surface">75</span>
              <span className="font-label-caps text-label-caps text-outline uppercase">Stable</span>
            </div>
          </div>
          <div className="mt-lg grid grid-cols-2 gap-lg w-full text-center">
            <div><p className="text-sm text-outline mb-1">Last Month</p><p className="font-bold text-lg">68 (+7)</p></div>
            <div><p className="text-sm text-outline mb-1">Target</p><p className="font-bold text-lg text-on-tertiary-container">90+</p></div>
          </div>
        </section>

        <section className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-gutter">
          {COMPLIANCE_CARDS.map(card => (
            <article key={card.title} className="bg-white border border-outline-variant p-md rounded-lg relative">
              <div className={`absolute top-0 left-0 w-1 h-full ${card.accent}`} />
              <div className="flex justify-between items-start mb-md">
                <div>
                  <h3 className="font-bold text-lg">{card.title}</h3>
                  <p className="text-xs text-outline">{card.subtitle}</p>
                </div>
                <span className={`${card.badge} px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tighter`}>
                  {card.status}
                </span>
              </div>
              <p className="text-2xl font-bold text-on-surface">{card.value}</p>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-md overflow-hidden">
                <div className={`${card.accent} h-full rounded-full`} style={{ width: card.title === 'AML / KYC' ? '34%' : '85%' }} />
              </div>
            </article>
          ))}
        </section>

        <section className="col-span-12 lg:col-span-7 bg-white border border-outline-variant p-lg rounded-lg">
          <div className="flex justify-between items-center mb-lg">
            <h2 className="font-h2 text-h2">Departmental Exposure Heatmap</h2>
            <div className="flex gap-2">
              {['bg-green-500', 'bg-yellow-300', 'bg-orange-400', 'bg-red-600'].map(c => <span key={c} className={`w-3 h-3 ${c} rounded`} />)}
            </div>
          </div>
          <div className="space-y-sm">
            {HEATMAP.map(([department, cells]) => (
              <div key={department} className="grid grid-cols-6 gap-sm items-center">
                <div className="text-[10px] font-bold uppercase tracking-widest text-outline text-right pr-sm">{department}</div>
                <div className="col-span-5 grid grid-cols-5 gap-1 h-12">
                  {cells.map((cell, index) => <div key={index} className={`${cell} rounded-sm`} />)}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="col-span-12 lg:col-span-5 bg-white border border-outline-variant rounded-lg flex flex-col overflow-hidden">
          <div className="p-md border-b border-outline-variant bg-primary-container text-white flex justify-between items-center">
            <h2 className="font-bold">Recent Compliance Alerts</h2>
            <span className="material-symbols-outlined text-sm">filter_list</span>
          </div>
          <div className="divide-y divide-slate-100">
            {ALERTS.map(([severity, title, detail, time, accent, text]) => (
              <article key={title} className="p-md hover:bg-slate-50 transition-colors">
                <div className="flex gap-md">
                  <div className={`w-2 h-12 ${accent} rounded-full mt-1 shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-xs gap-sm">
                      <h3 className="font-bold text-sm">{title}</h3>
                      <span className={`text-[10px] font-bold uppercase ${text}`}>{severity}</span>
                    </div>
                    <p className="text-xs text-outline truncate">{detail}</p>
                    <div className="flex justify-between items-center mt-sm">
                      <span className="text-[10px] text-slate-400">{time}</span>
                      <button className="text-secondary text-[10px] font-bold uppercase hover:underline">Review</button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
