import { NavLink, useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { icon: 'add_comment',    label: 'New Chat',        to: '/chat' },
  { icon: 'history',        label: 'Session History', to: '/sessions' },
  { icon: 'folder_managed', label: 'Document Library',to: '/documents' },
  { icon: 'star',           label: 'Features',        to: '/features' },
  { icon: 'analytics',      label: 'Analytics',       to: '/analytics' },
];

const FOOTER_ITEMS = [
  { icon: 'verified_user', label: 'Security Status', to: '/admin/security' },
  { icon: 'help_outline',  label: 'Help Center',     to: '/help' },
];

export default function Sidebar({ onUpload }) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col py-4 px-3 bg-slate-50 border-r border-slate-200 z-40">
      {/* Brand */}
      <div className="px-3 py-4 mb-4 flex items-center gap-3">
        <div className="h-10 w-10 bg-primary flex items-center justify-center rounded-lg flex-shrink-0">
          <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
            account_balance
          </span>
        </div>
        <div>
          <h2 className="text-base font-black text-slate-900 font-public-sans leading-none">BankAi</h2>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-0.5">Enterprise AI</p>
        </div>
      </div>

      {/* Upload CTA */}
      <button
        onClick={onUpload}
        className="flex items-center justify-center gap-2 px-4 py-3 mb-5 bg-primary text-white text-sm font-semibold rounded shadow-sm hover:opacity-90 active:scale-95 transition-all"
      >
        <span className="material-symbols-outlined text-[18px]">upload_file</span>
        Upload Document
      </button>

      {/* Main Nav */}
      <nav className="flex-1 space-y-0.5">
        {NAV_ITEMS.map(({ icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded text-[13px] font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            <span className="material-symbols-outlined text-[20px]">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer Nav */}
      <div className="border-t border-slate-200 pt-3 mt-3 space-y-0.5">
        {FOOTER_ITEMS.map(({ icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded text-[13px] transition-all duration-150 ${
                isActive
                  ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            <span className="material-symbols-outlined text-[18px]">{icon}</span>
            {label}
          </NavLink>
        ))}
      </div>
    </aside>
  );
}
