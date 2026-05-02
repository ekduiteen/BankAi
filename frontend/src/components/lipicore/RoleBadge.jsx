import { ROLE_LABELS, ROLE_COLORS } from '../../config/rolePermissions';

export default function RoleBadge({ role, size = 'sm' }) {
  if (!role) return null;
  const label = ROLE_LABELS[role] || role;
  const colors = ROLE_COLORS[role] || { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' };
  const sizeClass = size === 'xs' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5';

  return (
    <span className={`inline-flex items-center rounded border font-semibold uppercase tracking-wide ${sizeClass} ${colors.bg} ${colors.text} ${colors.border}`}>
      {label}
    </span>
  );
}
