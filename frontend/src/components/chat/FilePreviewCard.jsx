import { useEffect, useState } from 'react';

const ICON_MAP = {
  pdf:  { bg: 'bg-red-50 text-red-600',     icon: 'description' },
  docx: { bg: 'bg-blue-50 text-blue-600',   icon: 'article' },
  doc:  { bg: 'bg-blue-50 text-blue-600',   icon: 'article' },
  xlsx: { bg: 'bg-green-50 text-green-700', icon: 'table_chart' },
  xls:  { bg: 'bg-green-50 text-green-700', icon: 'table_chart' },
  pptx: { bg: 'bg-orange-50 text-orange-600', icon: 'slideshow' },
  ppt:  { bg: 'bg-orange-50 text-orange-600', icon: 'slideshow' },
  txt:  { bg: 'bg-slate-100 text-slate-600', icon: 'text_snippet' },
  jpg:  { bg: 'bg-purple-50 text-purple-600', icon: 'image' },
  jpeg: { bg: 'bg-purple-50 text-purple-600', icon: 'image' },
  png:  { bg: 'bg-purple-50 text-purple-600', icon: 'image' },
};

const DONE = ['ready', 'approved', 'indexed'];

export default function FilePreviewCard({ file, onRemove }) {
  const fileName = file.name || file.file_name || 'Document';
  const ext      = fileName.split('.').pop()?.toLowerCase() || '';
  const typeInfo = ICON_MAP[ext] || { bg: 'bg-slate-100 text-slate-600', icon: 'insert_drive_file' };

  const [status,   setStatus]   = useState(file.status || 'uploading');
  const [progress, setProgress] = useState(file.processing_progress ?? 0);
  const [message,  setMessage]  = useState(file.processing_message || 'Uploading...');

  const isDone   = DONE.includes(status);
  const isFailed = status === 'failed';

  useEffect(() => {
    if (file.status)                      setStatus(file.status);
    if (file.processing_progress != null) setProgress(file.processing_progress);
    if (file.processing_message)          setMessage(file.processing_message);
  }, [file.status, file.processing_progress, file.processing_message]);

  useEffect(() => {
    if (!file.id || String(file.id).startsWith('tmp') || isDone || isFailed) return;
    const poll = async () => {
      try {
        const token = localStorage.getItem('token');
        const r = await fetch(`/api/documents?limit=200`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!r.ok) return;
        const docs = await r.json();
        const doc  = docs.find(d => d.id === file.id);
        if (doc) {
          setStatus(doc.status);
          setProgress(doc.processing_progress ?? 0);
          setMessage(doc.processing_message || '');
        }
      } catch (_) {}
    };
    const t = setInterval(poll, 2000);
    return () => clearInterval(t);
  }, [file.id, isDone, isFailed]);

  return (
    <div className="relative flex items-center p-3 bg-white border border-slate-200 rounded group hover:border-secondary transition-colors">
      <div className={`w-10 h-10 rounded flex items-center justify-center flex-shrink-0 mr-3 ${typeInfo.bg}`}>
        <span className="material-symbols-outlined text-[20px]">{typeInfo.icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-on-surface truncate">{fileName}</p>
        {isDone ? (
          <div className="flex items-center gap-1 mt-0.5 text-[11px] text-on-tertiary-container font-bold">
            <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            Ready for questions
          </div>
        ) : isFailed ? (
          <div className="flex items-center gap-1 mt-0.5 text-[11px] text-error font-bold">
            <span className="material-symbols-outlined text-[13px]">error_outline</span>
            {message || 'Processing failed'}
          </div>
        ) : (
          <div className="mt-1">
            <div className="flex justify-between text-[10px] text-slate-500 mb-1">
              <span className="truncate pr-2 uppercase tracking-wide">{message || 'Processing...'}</span>
              <span className="font-bold flex-shrink-0">{progress}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
              <div className="bg-secondary h-1 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>
      {onRemove && (
        <button onClick={() => onRemove(file)}
          className="absolute -top-2 -right-2 w-5 h-5 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-error hover:border-error opacity-0 group-hover:opacity-100 transition-all shadow-sm">
          <span className="material-symbols-outlined text-[12px]">close</span>
        </button>
      )}
    </div>
  );
}
