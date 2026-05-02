export default function ProcessStepCard({ step, isActive, isCompleted, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg border transition-all ${
        isActive
          ? 'bg-primary-container/15 border-primary shadow-sm'
          : isCompleted
          ? 'bg-green-50 border-green-200'
          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
          isCompleted ? 'bg-green-500 text-white' : isActive ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'
        }`}>
          {isCompleted
            ? <span className="material-symbols-outlined text-[14px]">check</span>
            : step.id}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold truncate ${isActive ? 'text-primary' : 'text-slate-800'}`}>
            {step.title}
          </p>
          <p className="text-xs text-slate-500 mt-0.5 truncate">{step.department}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="flex items-center gap-1 text-[10px] text-slate-400">
              <span className="material-symbols-outlined text-[12px]">schedule</span>
              {step.durationDays < 1 ? `${step.durationDays * 8}h` : `${step.durationDays}d`}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-slate-400">
              <span className="material-symbols-outlined text-[12px]">description</span>
              {step.requiredDocs.length} docs
            </span>
          </div>
        </div>
        <span className="material-symbols-outlined text-slate-300 text-[18px] mt-1 shrink-0">
          chevron_right
        </span>
      </div>
    </button>
  );
}
