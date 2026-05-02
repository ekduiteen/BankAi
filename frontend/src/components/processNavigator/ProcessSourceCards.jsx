export default function ProcessSourceCards({ process }) {
  if (!process) return null;

  return (
    <div className="space-y-3">
      {/* Policy Reference */}
      <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg">
        <span className="material-symbols-outlined text-secondary text-[20px]">policy</span>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Policy Reference</p>
          <p className="text-sm font-semibold text-slate-800">{process.policyRef}</p>
        </div>
      </div>

      {/* Source Documents */}
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2 px-1">Source Documents</p>
        <div className="space-y-1.5">
          {process.sourceDocs.map((doc, i) => (
            <div key={i} className="flex items-center gap-2 p-2.5 bg-white border border-slate-100 rounded-lg">
              <span className="material-symbols-outlined text-amber-500 text-[16px] shrink-0">menu_book</span>
              <span className="text-xs text-slate-700">{doc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Estimated Timeline */}
      <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg">
        <span className="material-symbols-outlined text-tertiary-fixed-dim text-[20px]">schedule</span>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Estimated Duration</p>
          <p className="text-sm font-semibold text-slate-800">{process.estimatedDays}</p>
        </div>
      </div>

      {/* Ask LipiCore */}
      <div className="p-3 bg-primary-container/10 border border-primary/20 rounded-lg">
        <p className="text-xs font-semibold text-primary mb-1 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[14px]">chat</span>
          Ask LipiCore about this process
        </p>
        <p className="text-[11px] text-slate-600">
          Upload the related policy documents and ask LipiCore to explain specific requirements, extract key conditions, or draft a checklist.
        </p>
      </div>
    </div>
  );
}
