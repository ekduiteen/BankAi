import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PROCESSES, PROCESS_CATEGORIES } from '../data/processNavigatorMockData';
import ProcessStepCard from '../components/processNavigator/ProcessStepCard';
import ProcessStepDetail from '../components/processNavigator/ProcessStepDetail';
import ProcessSourceCards from '../components/processNavigator/ProcessSourceCards';

export default function LipiCoreProcessNavigator() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProcess, setSelectedProcess]   = useState(null);
  const [activeStep, setActiveStep]             = useState(1);
  const [completedSteps, setCompletedSteps]     = useState(new Set());
  const [search, setSearch]                     = useState('');

  const filteredProcesses = useMemo(() => {
    let list = PROCESSES;
    if (selectedCategory !== 'all') list = list.filter(p => p.category === selectedCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.steps.some(s => s.title.toLowerCase().includes(q) || s.department.toLowerCase().includes(q))
      );
    }
    return list;
  }, [selectedCategory, search]);

  const handleSelectProcess = (process) => {
    setSelectedProcess(process);
    setActiveStep(1);
    setCompletedSteps(new Set());
  };

  const handleStepClick = (stepId) => {
    setActiveStep(stepId);
  };

  const handleMarkComplete = () => {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      next.add(activeStep);
      return next;
    });
    const next = selectedProcess.steps.find(s => s.id === activeStep + 1);
    if (next) setActiveStep(next.id);
  };

  const currentStep = selectedProcess?.steps.find(s => s.id === activeStep) || null;
  const progressPct = selectedProcess
    ? Math.round((completedSteps.size / selectedProcess.totalSteps) * 100)
    : 0;

  return (
    <div className="flex h-full overflow-hidden bg-slate-50">
      {/* Left panel — process list */}
      <div className={`flex flex-col border-r border-slate-200 bg-white flex-shrink-0 ${selectedProcess ? 'w-72' : 'flex-1 max-w-2xl mx-auto'}`}>
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-secondary text-[22px]">account_tree</span>
            <h1 className="text-lg font-bold text-slate-900">Process Navigator</h1>
          </div>
          <p className="text-xs text-slate-500 mb-4">Step-by-step banking procedure guides with department contacts, required documents, and escalation paths.</p>

          {/* Search */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
            <input
              type="text"
              placeholder="Search processes…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50"
            />
          </div>
        </div>

        {/* Category filters */}
        <div className="flex gap-1.5 px-4 py-3 overflow-x-auto border-b border-slate-100 flex-shrink-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
              selectedCategory === 'all' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({PROCESSES.length})
          </button>
          {PROCESS_CATEGORIES.map(cat => {
            const count = PROCESSES.filter(p => p.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex-shrink-0 flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                  selectedCategory === cat.id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span className="material-symbols-outlined text-[13px]">{cat.icon}</span>
                {cat.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Process list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredProcesses.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <span className="material-symbols-outlined text-4xl block mb-2">search_off</span>
              <p className="text-sm">No processes match your search.</p>
            </div>
          )}
          {filteredProcesses.map(process => {
            const isSelected = selectedProcess?.id === process.id;
            const catInfo = PROCESS_CATEGORIES.find(c => c.id === process.category);
            return (
              <button
                key={process.id}
                type="button"
                onClick={() => handleSelectProcess(process)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-primary-container/15 border-primary shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className={`text-sm font-bold leading-snug ${isSelected ? 'text-primary' : 'text-slate-900'}`}>
                    {process.title}
                  </p>
                  <span className="material-symbols-outlined text-slate-300 text-[18px] shrink-0 mt-0.5">chevron_right</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-2">{process.description}</p>
                <div className="flex items-center gap-3">
                  <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <span className="material-symbols-outlined text-[11px]">{catInfo?.icon || 'folder'}</span>
                    {catInfo?.label || process.category}
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[11px]">linear_scale</span>
                    {process.totalSteps} steps
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[11px]">schedule</span>
                    {process.estimatedDays}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Center panel — step map + detail */}
      {selectedProcess && (
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Process header */}
          <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <button
                  type="button"
                  onClick={() => setSelectedProcess(null)}
                  className="p-1 rounded hover:bg-slate-100 transition-colors"
                >
                  <span className="material-symbols-outlined text-slate-400 text-[18px]">arrow_back</span>
                </button>
                <h2 className="font-bold text-slate-900 text-base truncate">{selectedProcess.title}</h2>
              </div>
              <div className="flex items-center gap-3 ml-8">
                <span className="text-[10px] font-semibold text-slate-400">{selectedProcess.policyRef}</span>
                <span className="text-[10px] text-slate-400">•</span>
                <span className="text-[10px] text-slate-400">{selectedProcess.totalSteps} steps</span>
                <span className="text-[10px] text-slate-400">•</span>
                <span className="text-[10px] text-slate-400">{selectedProcess.estimatedDays}</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-xs font-bold text-slate-500">{progressPct}% complete</span>
              <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="flex flex-1 overflow-hidden">
            {/* Step list */}
            <div className="w-72 flex-shrink-0 overflow-y-auto p-4 space-y-2 border-r border-slate-200 bg-slate-50">
              {selectedProcess.steps.map((step) => (
                <ProcessStepCard
                  key={step.id}
                  step={step}
                  isActive={activeStep === step.id}
                  isCompleted={completedSteps.has(step.id)}
                  onClick={() => handleStepClick(step.id)}
                />
              ))}
            </div>

            {/* Step detail */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-xl">
                <ProcessStepDetail
                  step={currentStep}
                  totalSteps={selectedProcess.totalSteps}
                />

                {/* Action buttons */}
                {currentStep && (
                  <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
                    {!completedSteps.has(activeStep) && (
                      <button
                        type="button"
                        onClick={handleMarkComplete}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        Mark Complete
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => navigate('/chat')}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">chat</span>
                      Ask LipiCore
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Right panel — source docs (only when process selected) */}
      {selectedProcess && (
        <div className="w-64 flex-shrink-0 overflow-y-auto p-4 border-l border-slate-200 bg-white">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">References</p>
          <ProcessSourceCards process={selectedProcess} />
        </div>
      )}
    </div>
  );
}
