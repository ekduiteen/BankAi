import { useRef } from 'react';

const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.txt', '.xlsx', '.xls', '.pptx', '.ppt', '.jpg', '.jpeg', '.png'];

export default function FileUploadCard({ file, onFileSelect, onRemove, uploading = false, disabled = false }) {
  const inputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    if (disabled) return;
    const dropped = e.dataTransfer.files[0];
    if (dropped) onFileSelect(dropped);
  };

  const handleChange = (e) => {
    if (e.target.files?.[0]) onFileSelect(e.target.files[0]);
  };

  if (file) {
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    const icon = ['.pdf'].includes(ext) ? 'picture_as_pdf'
      : ['.jpg', '.jpeg', '.png'].includes(ext) ? 'image'
      : ['.xlsx', '.xls'].includes(ext) ? 'table_chart'
      : 'description';

    return (
      <div className="flex items-center gap-3 px-3 py-2 bg-surface-container-low border border-slate-200 rounded-lg">
        <span className="material-symbols-outlined text-secondary text-[20px]">{icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-800 truncate">{file.name}</p>
          <p className="text-[10px] text-slate-400">{(file.size / 1024).toFixed(0)} KB</p>
        </div>
        {uploading ? (
          <span className="text-[10px] text-slate-500 font-medium animate-pulse">Uploading…</span>
        ) : (
          <button
            type="button"
            onClick={onRemove}
            className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors"
            title="Remove file"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`flex items-center gap-2 px-3 py-2 border border-dashed rounded-lg cursor-pointer transition-colors ${
        disabled ? 'opacity-50 cursor-not-allowed border-slate-200' : 'border-slate-300 hover:border-primary hover:bg-primary-container/5'
      }`}
    >
      <span className="material-symbols-outlined text-slate-400 text-[18px]">attach_file</span>
      <span className="text-xs text-slate-500">Attach file</span>
      <span className="text-[10px] text-slate-400 hidden sm:inline">({ALLOWED_EXTENSIONS.join(', ')})</span>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={ALLOWED_EXTENSIONS.join(',')}
        onChange={handleChange}
        disabled={disabled}
      />
    </div>
  );
}
