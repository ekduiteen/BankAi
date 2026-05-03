import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';

const CATEGORY_COLORS = {
  Documents:  'bg-blue-50 text-blue-700',
  Writing:    'bg-violet-50 text-violet-700',
  Data:       'bg-emerald-50 text-emerald-700',
  Language:   'bg-amber-50 text-amber-700',
  Compliance: 'bg-red-50 text-red-700',
};

const FORMAT_LABELS = {
  pdf:  { label: 'PDF',  icon: 'picture_as_pdf' },
  docx: { label: 'Word', icon: 'description' },
  xlsx: { label: 'Excel', icon: 'table_chart' },
  pptx: { label: 'PowerPoint', icon: 'slideshow' },
  txt:  { label: 'Text', icon: 'article' },
};

function ExportDropdown({ content, title, formats }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleExport = async (fmt) => {
    setLoading(fmt);
    setOpen(false);
    try {
      const res = await api.post('/export', { content, fmt, title }, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      const cd = res.headers['content-disposition'] || '';
      const fnMatch = cd.match(/filename="(.+?)"/);
      a.download = fnMatch ? fnMatch[1] : `export.${fmt}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (_) {}
    finally { setLoading(null); }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        disabled={!!loading}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded hover:opacity-90 transition-all disabled:opacity-60"
      >
        {loading
          ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : <span className="material-symbols-outlined text-[14px]">download</span>
        }
        Export
        <span className="material-symbols-outlined text-[14px]">expand_more</span>
      </button>
      {open && (
        <div className="absolute right-0 top-8 w-44 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50">
          {formats.map(fmt => {
            const f = FORMAT_LABELS[fmt] || { label: fmt.toUpperCase(), icon: 'download' };
            return (
              <button
                key={fmt}
                onClick={() => handleExport(fmt)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px] text-slate-400">{f.icon}</span>
                {f.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TaskModal({ template, onClose }) {
  const [content, setContent]   = useState('');
  const [extra, setExtra]       = useState('');
  const [file, setFile]         = useState(null);
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const fileRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !file) { setError('Enter some text or upload a file.'); return; }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const fd = new FormData();
      fd.append('template_id', template.id);
      fd.append('content', content);
      fd.append('extra', extra);
      if (file) fd.append('file', file);
      const res = await api.post('/tasks/run', fd);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Task failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const extraLabel = {
    translate:     'Target language (e.g. English or Nepali)',
    write_report:  'Report type (e.g. Monthly Performance, Compliance)',
    compose_email: 'Recipient type (e.g. customer, internal staff, regulator)',
    draft_letter:  'Additional context (recipient, tone, any specific clause)',
    meeting_minutes: 'Meeting title / date / attendees (optional)',
  }[template.id] || 'Additional context (optional)';

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-primary/10 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[20px]">{template.icon}</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{template.name}</h2>
              <p className="text-xs text-slate-500">{template.description}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {!result ? (
            <form id="task-form" onSubmit={handleSubmit} className="space-y-4">
              {template.accepts_file && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    Upload File <span className="text-slate-400 normal-case font-normal">(PDF, DOCX, XLSX, TXT)</span>
                  </label>
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 rounded-lg p-4 flex items-center gap-3 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                  >
                    <span className="material-symbols-outlined text-slate-400 text-[24px]">upload_file</span>
                    <div className="flex-1 min-w-0">
                      {file
                        ? <p className="text-sm text-slate-700 font-medium truncate">{file.name}</p>
                        : <p className="text-sm text-slate-400">Click to choose file, or drop here</p>
                      }
                    </div>
                    {file && (
                      <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); if (fileRef.current) fileRef.current.value = ''; }}
                        className="text-slate-400 hover:text-error">
                        <span className="material-symbols-outlined text-[18px]">close</span>
                      </button>
                    )}
                  </div>
                  <input ref={fileRef} type="file" className="hidden"
                    accept=".pdf,.docx,.txt,.xlsx,.xls,.csv,.pptx,.ppt"
                    onChange={e => setFile(e.target.files[0] || null)} />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  {template.accepts_file ? 'Or type / paste content' : 'Your input'}
                </label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={6}
                  placeholder={`Paste your text here${template.accepts_file ? ', or leave empty if you uploaded a file' : ''}...`}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  {extraLabel}
                </label>
                <input
                  type="text"
                  value={extra}
                  onChange={e => setExtra(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  placeholder="Optional"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
                  <span className="material-symbols-outlined text-[16px]">error_outline</span>
                  {error}
                </div>
              )}
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  Done — {result.template_name}
                </div>
                <div className="flex items-center gap-2">
                  {!isEditing && (
                    <>
                      <button onClick={() => { setIsEditing(true); setEditContent(result.result); }}
                        className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 px-2 py-1.5 rounded hover:bg-slate-100 transition-colors">
                        <span className="material-symbols-outlined text-[14px]">edit</span>
                        Edit
                      </button>
                      <button onClick={() => setResult(null)}
                        className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 px-2 py-1.5 rounded hover:bg-slate-100 transition-colors">
                        <span className="material-symbols-outlined text-[14px]">refresh</span>
                        Run again
                      </button>
                    </>
                  )}
                  <ExportDropdown
                    content={isEditing ? editContent : result.result}
                    title={result.template_name}
                    formats={result.suggested_formats}
                  />
                </div>
              </div>
              {isEditing ? (
                <div className="space-y-3">
                  <textarea
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    rows={12}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 text-xs bg-primary text-white rounded font-semibold hover:opacity-90 transition-all"
                    >
                      Done editing
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-lg p-4 text-sm text-slate-800 leading-relaxed max-h-[400px] overflow-y-auto space-y-2">
                  {result.result.split('\n\n').map((para, i) => (
                    <p key={i} className="whitespace-pre-wrap">{para}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!result && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 rounded transition-colors">
              Cancel
            </button>
            <button form="task-form" type="submit" disabled={loading}
              className="flex items-center gap-2 px-5 py-2 bg-primary text-white text-sm font-semibold rounded shadow-sm hover:opacity-90 disabled:opacity-60 transition-all">
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</>
                : <><span className="material-symbols-outlined text-[16px]">auto_awesome</span> Generate</>
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Tasks() {
  const [templates, setTemplates]     = useState([]);
  const [active, setActive]           = useState(null);
  const [filterCat, setFilterCat]     = useState('All');

  useEffect(() => {
    api.get('/tasks/templates').then(r => setTemplates(r.data)).catch(() => {});
  }, []);

  const categories = ['All', ...new Set(templates.map(t => t.category))];
  const filtered = filterCat === 'All' ? templates : templates.filter(t => t.category === filterCat);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 font-public-sans">AI Tasks</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Common banking workflows powered by your private AI — nothing leaves the bank.
        </p>
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filterCat === cat
                ? 'bg-primary text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(t => (
          <button
            key={t.id}
            onClick={() => setActive(t)}
            className="text-left bg-white border border-slate-200 rounded-xl p-5 hover:border-primary/40 hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined text-primary text-[22px]">{t.icon}</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${CATEGORY_COLORS[t.category] || 'bg-slate-100 text-slate-500'}`}>
                {t.category}
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">{t.name}</h3>
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{t.description}</p>
            <div className="flex items-center gap-1 mt-3 flex-wrap">
              {t.suggested_formats.map(f => (
                <span key={f} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">
                  .{f}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <span className="material-symbols-outlined text-5xl mb-3 block">auto_awesome</span>
          <p className="text-sm">Loading tasks...</p>
        </div>
      )}

      {active && <TaskModal template={active} onClose={() => setActive(null)} />}
    </div>
  );
}
