export default function ProcessStepDetail({ step, totalSteps }) {
  if (!step) return null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shrink-0">
          {step.id}
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-base leading-snug">{step.title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">Step {step.id} of {totalSteps}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-700 leading-relaxed">{step.description}</p>

      {/* Department & Contact */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Department</p>
          <p className="text-sm font-semibold text-slate-800">{step.department}</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Contact Role</p>
          <p className="text-sm font-semibold text-slate-800">{step.contactRole}</p>
        </div>
      </div>

      {/* Required Documents */}
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[14px]">folder</span>
          Required Documents
        </p>
        <ul className="space-y-1.5">
          {step.requiredDocs.map((doc, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
              <span className="material-symbols-outlined text-amber-500 text-[14px] mt-0.5 shrink-0">description</span>
              {doc}
            </li>
          ))}
        </ul>
      </div>

      {/* Output Documents */}
      {step.outputDocs && step.outputDocs.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px]">output</span>
            Output Documents
          </p>
          <ul className="space-y-1.5">
            {step.outputDocs.map((doc, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="material-symbols-outlined text-green-500 text-[14px] mt-0.5 shrink-0">task_alt</span>
                {doc}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Escalation */}
      {step.escalationTo && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wide mb-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">warning</span>
            Escalation Path
          </p>
          <p className="text-sm font-semibold text-amber-800">→ {step.escalationTo}</p>
          {step.escalationCondition && (
            <p className="text-xs text-amber-700 mt-1">{step.escalationCondition}</p>
          )}
        </div>
      )}

      {/* Notes */}
      {step.notes && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wide mb-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">info</span>
            Note
          </p>
          <p className="text-sm text-blue-800">{step.notes}</p>
        </div>
      )}
    </div>
  );
}
