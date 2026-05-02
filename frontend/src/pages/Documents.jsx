import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import useDropZone from '../hooks/useDropZone';

const STATUS_CLASS = {
  approved:  'badge-approved',
  ready:     'badge-ready',
  indexed:   'badge-indexed',
  processing:'badge-processing',
  extracting_text: 'badge-processing',
  chunking:  'badge-processing',
  embedding: 'badge-processing',
  indexing:  'badge-processing',
  uploaded:  'badge-pending',
  failed:    'badge-failed',
  disabled:  'badge-pending',
};

const TYPE_ICON = {
  pdf:  { icon: 'description', bg: 'bg-red-50 text-red-600' },
  docx: { icon: 'article',     bg: 'bg-blue-50 text-blue-600' },
  doc:  { icon: 'article',     bg: 'bg-blue-50 text-blue-600' },
  xlsx: { icon: 'table_chart', bg: 'bg-green-50 text-green-700' },
  xls:  { icon: 'table_chart', bg: 'bg-green-50 text-green-700' },
  pptx: { icon: 'slideshow',   bg: 'bg-orange-50 text-orange-600' },
  txt:  { icon: 'text_snippet',bg: 'bg-slate-100 text-slate-600' },
  jpg:  { icon: 'image',       bg: 'bg-purple-50 text-purple-600' },
  jpeg: { icon: 'image',       bg: 'bg-purple-50 text-purple-600' },
  png:  { icon: 'image',       bg: 'bg-purple-50 text-purple-600' },
};

export default function Documents() {
  const navigate   = useNavigate();
  const [docs, setDocs]         = useState([]);
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [miniChatInput, setMiniChatInput]   = useState('');
  const [miniChatMsgs, setMiniChatMsgs]     = useState([]);
  const [miniChatLoading, setMiniChatLoading] = useState(false);
  const [uploadQueue, setUploadQueue]       = useState([]);
  const fileRef = useRef(null);
  const mainRef = useRef(null);
  const user    = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = ['super_admin', 'bank_admin'].includes(user.role);

  const handleDropFiles = useCallback(async (files) => {
    if (!isAdmin && !['compliance_user', 'document_reviewer'].includes(user.role)) return;
    const fileArray = Array.from(files);
    for (const file of fileArray) {
      const tmpId = `tmp-${Date.now()}-${Math.random()}`;
      setUploadQueue(prev => [...prev, { id: tmpId, name: file.name, status: 'uploading', progress: 0, message: 'Uploading...' }]);
      try {
        const fd = new FormData();
        fd.append('file', file);
        const r = await api.post('/documents/upload', fd);
        setUploadQueue(prev => prev.map(u => u.id === tmpId ? { ...r.data, status: 'uploading', message: 'Processing document...' } : u));
        fetchDocs();
      } catch (err) {
        setUploadQueue(prev => prev.map(u => u.id === tmpId ? { ...u, status: 'failed', message: 'Upload failed' } : u));
      }
    }
  }, [isAdmin, user.role]);

  const { isDragging, dropHandlers } = useDropZone(handleDropFiles);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const r = await api.get('/documents');
      setDocs(r.data);
      if (!selected && r.data.length > 0) setSelected(r.data[0]);
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => { fetchDocs(); }, []);

  // Poll uploading documents
  useEffect(() => {
    const uploadingIds = uploadQueue.filter(u => !String(u.id).startsWith('tmp') && !['ready', 'approved', 'failed'].includes(u.status)).map(u => u.id);
    if (uploadingIds.length === 0) return;

    const pollInterval = setInterval(async () => {
      try {
        const r = await api.get(`/documents?limit=200`);
        const docs = r.data.filter(d => uploadingIds.includes(d.id));
        if (docs.length > 0) {
          setUploadQueue(prev =>
            prev.map(item =>
              uploadingIds.includes(item.id)
                ? { ...item, ...docs.find(d => d.id === item.id) }
                : item
            )
          );
        }
      } catch (_) {}
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [uploadQueue]);

  const filtered = docs.filter(d =>
    (d.file_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.title || '').toLowerCase().includes(search.toLowerCase())
  );

  const globalDocs   = filtered.filter(d => d.document_scope !== 'session_upload');
  const sessionDocs  = filtered.filter(d => d.document_scope === 'session_upload');

  const handleApprove = async (docId) => {
    try {
      await api.patch(`/documents/${docId}/approve`);
      fetchDocs();
    } catch (_) {}
  };

  const handleDelete = async (docId) => {
    if (!confirm('Delete this document? This cannot be undone.')) return;
    try {
      await api.delete(`/documents/${docId}`);
      if (selected?.id === docId) setSelected(null);
      fetchDocs();
    } catch (_) {}
  };


  const askAboutDoc = async () => {
    if (!miniChatInput.trim() || !selected) return;
    const question = miniChatInput;
    setMiniChatMsgs(prev => [...prev, { role: 'user', content: question }]);
    setMiniChatInput('');
    setMiniChatLoading(true);
    try {
      const sessR = await api.post('/chat/sessions', { title: `Analyzing: ${selected.file_name}` });
      const sesId = sessR.data.id;
      const token = localStorage.getItem('token');
      const resp  = await fetch(`/api/chat/sessions/${sesId}/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: question, language: 'en' }),
      });
      if (!resp.ok) throw new Error();
      const reader  = resp.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let buffer   = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const l of lines) {
          const t = l.trim();
          if (!t.startsWith('data: ')) continue;
          try {
            const d = JSON.parse(t.slice(6));
            if (d.token) fullText += d.token;
          } catch (_) {}
        }
      }
      setMiniChatMsgs(prev => [...prev, { role: 'assistant', content: fullText || 'No response.' }]);
    } catch (_) {
      setMiniChatMsgs(prev => [...prev, { role: 'assistant', content: 'Unable to connect to AI.' }]);
    }
    setMiniChatLoading(false);
  };

  const openChat = () => navigate(`/chat`);
  const typeInfo = (ext) => TYPE_ICON[ext?.toLowerCase()] || { icon: 'insert_drive_file', bg: 'bg-slate-100 text-slate-500' };

  return (
    <div className="flex h-full overflow-hidden" ref={mainRef} {...dropHandlers}>
      {/* Drag overlay */}
      {isDragging && (
        <div className="fixed inset-0 bg-primary/10 border-2 border-dashed border-primary flex items-center justify-center z-40 pointer-events-none">
          <div className="flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-primary text-6xl">cloud_upload</span>
            <p className="text-primary font-semibold text-lg">Drop files to upload</p>
          </div>
        </div>
      )}

      {/* Main library panel */}
      <section className="flex-1 flex flex-col p-8 overflow-y-auto border-r border-slate-200 bg-background">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-h1 font-h1 text-on-surface mb-1">Document Library</h1>
          <p className="text-body-md text-outline mb-4">Manage and analyze your financial records.</p>

          {/* Search */}
          <div className="relative max-w-xs">
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="bg-slate-100 border-none rounded px-4 py-2 pl-9 text-body-sm focus:ring-2 focus:ring-secondary focus:bg-white transition-all w-full outline-none"
              placeholder="Search files..." />
            <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-slate-400 text-[18px]">search</span>
          </div>
        </div>

        {/* Simple drag-and-drop upload area */}
        <div className="mb-8 p-8 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 text-center transition-all hover:border-secondary hover:bg-primary/5"
          {...dropHandlers}
          onDragEnter={(e) => { e.preventDefault(); dropHandlers.onDragEnter(e); }}
          onDragLeave={(e) => { e.preventDefault(); dropHandlers.onDragLeave(e); }}
          onDragOver={(e) => { e.preventDefault(); dropHandlers.onDragOver(e); }}
          onDrop={(e) => { e.preventDefault(); dropHandlers.onDrop(e); }}
          style={{ borderColor: isDragging ? 'var(--color-primary)' : undefined, backgroundColor: isDragging ? 'rgba(var(--color-primary), 0.05)' : undefined }}
        >
          <span className="material-symbols-outlined text-4xl text-secondary mb-2 block">cloud_upload</span>
          <p className="text-sm font-semibold text-on-surface mb-1">Drag files here to upload</p>
          <p className="text-xs text-slate-500 mb-4">or click below to browse</p>
          <input
            type="file"
            ref={fileRef}
            accept=".pdf,.docx,.txt,.xlsx,.xls,.pptx,.ppt,.jpg,.jpeg,.png"
            onChange={(e) => {
              if (e.target.files?.[0]) handleDropFiles([e.target.files[0]]);
            }}
            className="hidden"
            id="doc-upload-input"
          />
          <label htmlFor="doc-upload-input" className="inline-block">
            <button type="button" onClick={() => document.getElementById('doc-upload-input').click()}
              className="btn-secondary text-xs">
              <span className="material-symbols-outlined text-[16px]">upload_file</span>
              Choose File
            </button>
          </label>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <div className="w-8 h-8 border-2 border-slate-200 border-t-secondary rounded-full animate-spin" />
              <p className="text-body-sm">Loading documents...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Global knowledge docs bento grid */}
            {globalDocs.length > 0 && (
              <>
                <p className="label-caps text-slate-400 mb-4 uppercase">Knowledge Base — {globalDocs.length} document{globalDocs.length !== 1 ? 's' : ''}</p>
                <div className="grid grid-cols-12 gap-6 mb-10">
                  {globalDocs.slice(0, 1).map(doc => {
                    const ti = typeInfo(doc.file_type);
                    return (
                      <div key={doc.id} onClick={() => setSelected(doc)}
                        className={`col-span-8 bg-white border border-slate-200 rounded p-6 hover:shadow-card transition-shadow relative overflow-hidden cursor-pointer group ${selected?.id === doc.id ? 'ring-2 ring-secondary' : ''}`}>
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary" />
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`h-12 w-12 rounded flex items-center justify-center ${ti.bg}`}>
                              <span className="material-symbols-outlined text-[22px]">{ti.icon}</span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-on-surface">{doc.file_name}</h3>
                              <p className="font-label-caps text-[10px] text-outline uppercase tracking-wider mt-0.5">{doc.document_type} · {doc.department || 'General'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={STATUS_CLASS[doc.status] || 'badge-pending'}>{doc.status}</span>
                            <button onClick={e => { e.stopPropagation(); }} className="p-1 text-slate-400 hover:text-on-surface rounded">
                              <span className="material-symbols-outlined text-[18px]">more_vert</span>
                            </button>
                          </div>
                        </div>
                        {doc.summary && <p className="text-body-sm text-slate-600 mb-4 line-clamp-2">{doc.summary}</p>}
                        <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
                          <div className="flex gap-4">
                            <div><p className="label-caps text-slate-400 mb-1">Uploaded</p><p className="font-semibold">{new Date(doc.created_at).toLocaleDateString()}</p></div>
                            <div><p className="label-caps text-slate-400 mb-1">Type</p><p className="font-semibold uppercase">{doc.file_type}</p></div>
                            <div><p className="label-caps text-slate-400 mb-1">Access</p><p className="font-semibold">{['General', 'Restricted', 'Confidential'][doc.access_level] || 'General'}</p></div>
                          </div>
                          <div className="flex gap-2">
                            {isAdmin && doc.status === 'ready' && (
                              <button onClick={e => { e.stopPropagation(); handleApprove(doc.id); }}
                                className="flex items-center gap-1 px-2 py-1 border border-on-tertiary-container/20 text-on-tertiary-container text-[11px] rounded hover:bg-green-50">
                                <span className="material-symbols-outlined text-[13px]">check_circle</span> Approve
                              </button>
                            )}
                            {isAdmin && (
                              <button onClick={e => { e.stopPropagation(); handleDelete(doc.id); }}
                                className="flex items-center gap-1 px-2 py-1 border border-error/20 text-error text-[11px] rounded hover:bg-red-50">
                                <span className="material-symbols-outlined text-[13px]">delete</span> Delete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* AI score card */}
                  <div className="col-span-4 bg-primary-container rounded p-6 flex flex-col justify-between text-white">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-tertiary-fixed-dim">auto_awesome</span>
                        <span className="font-label-caps text-[10px] tracking-widest text-on-primary-container">AI INSIGHTS</span>
                      </div>
                      <h4 className="text-lg font-semibold mb-2">Knowledge Base</h4>
                      <div className="flex items-end gap-2 mb-4">
                        <span className="text-4xl font-bold text-tertiary-fixed-dim">{globalDocs.length}</span>
                        <span className="text-on-primary-container text-sm mb-1">documents indexed</span>
                      </div>
                      <p className="text-xs text-on-primary-container leading-relaxed">
                        {globalDocs.filter(d => d.status === 'approved').length} approved for AI retrieval.
                        {globalDocs.filter(d => d.status === 'ready').length > 0 && ` ${globalDocs.filter(d => d.status === 'ready').length} pending approval.`}
                      </p>
                    </div>
                    <button onClick={() => navigate('/chat')}
                      className="w-full py-2 bg-on-primary-fixed-variant text-white font-semibold text-xs rounded mt-4 hover:bg-slate-700">
                      Open Analysis Chat
                    </button>
                  </div>

                  {/* Smaller grid items */}
                  {globalDocs.slice(1, 4).map(doc => {
                    const ti = typeInfo(doc.file_type);
                    return (
                      <div key={doc.id} onClick={() => setSelected(doc)}
                        className={`col-span-4 bg-white border border-slate-200 rounded p-5 hover:border-secondary transition-colors cursor-pointer group ${selected?.id === doc.id ? 'border-secondary ring-1 ring-secondary' : ''}`}>
                        <div className="flex justify-between items-start mb-3">
                          <div className={`h-10 w-10 rounded flex items-center justify-center group-hover:bg-secondary-fixed transition-colors ${ti.bg}`}>
                            <span className="material-symbols-outlined">{ti.icon}</span>
                          </div>
                          <span className="material-symbols-outlined text-slate-300 text-[18px]">open_in_new</span>
                        </div>
                        <h4 className="font-semibold text-sm text-on-surface mb-1 truncate">{doc.file_name}</h4>
                        <p className="font-label-caps text-[10px] text-outline">{doc.document_type} · {doc.file_type?.toUpperCase()}</p>
                        <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                          <span className={STATUS_CLASS[doc.status] || 'badge-pending'}>{doc.status}</span>
                          <span className="text-[10px] text-outline">{new Date(doc.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Session uploads */}
            {sessionDocs.length > 0 && (
              <div className="mt-4">
                <p className="label-caps text-slate-400 mb-4 uppercase">Session Uploads — {sessionDocs.length} file{sessionDocs.length !== 1 ? 's' : ''}</p>
                <div className="bg-white border border-slate-200 rounded divide-y divide-slate-100">
                  {sessionDocs.map(doc => {
                    const ti = typeInfo(doc.file_type);
                    return (
                      <div key={doc.id} onClick={() => setSelected(doc)}
                        className={`flex items-center justify-between p-4 hover:bg-slate-50 cursor-pointer ${selected?.id === doc.id ? 'bg-surface-container-low' : ''}`}>
                        <div className="flex items-center gap-3">
                          <span className={`material-symbols-outlined ${ti.bg.split(' ')[1]}`}>{ti.icon}</span>
                          <div>
                            <p className="text-sm font-semibold text-on-surface">{doc.file_name}</p>
                            <p className="text-[10px] text-outline mt-0.5">Session upload · {new Date(doc.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={STATUS_CLASS[doc.status] || 'badge-pending'}>{doc.status}</span>
                          <span className="material-symbols-outlined text-slate-300 text-[18px]">chevron_right</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {docs.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
                <span className="material-symbols-outlined text-5xl text-slate-200 mb-4">folder_open</span>
                <p className="text-h2 font-h2 text-on-surface mb-2">No documents yet</p>
                <p className="text-body-sm text-outline">Drag files above or use the upload button to get started.</p>
              </div>
            )}
          </>
        )}
      </section>

      {/* Right preview + mini chat */}
      {/* Upload queue toast */}
      {uploadQueue.some(u => !['ready', 'approved', 'failed'].includes(u.status)) && (
        <div className="fixed bottom-6 right-6 bg-white border border-slate-200 rounded-lg shadow-lg p-4 w-80 z-30">
          <p className="text-xs font-bold text-slate-500 uppercase mb-3">Uploading documents</p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {uploadQueue.filter(u => !['ready', 'approved', 'failed'].includes(u.status)).map(item => (
              <div key={item.id} className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center flex-shrink-0 text-xs">
                  <span className="material-symbols-outlined text-[12px] text-slate-600">insert_drive_file</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate">{item.name}</p>
                  <div className="mt-0.5 h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-secondary transition-all duration-300" style={{ width: `${item.progress || 0}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selected && (
        <section className="w-[420px] flex flex-col bg-slate-50 border-l border-slate-200 flex-shrink-0">
          {/* Preview header */}
          <div className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-secondary text-[18px]">description</span>
              <span className="text-xs font-bold truncate max-w-[180px]">{selected.file_name}</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={openChat} title="Open in Chat" className="p-1.5 hover:bg-slate-100 rounded text-slate-500">
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              </button>
              <button onClick={() => setSelected(null)} className="p-1.5 hover:bg-slate-100 rounded text-slate-500">
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          </div>

          {/* Document metadata */}
          <div className="p-4 bg-white border-b border-slate-200 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Type',    value: selected.document_type || '—' },
                { label: 'Status',  value: selected.status },
                { label: 'Scope',   value: selected.document_scope || 'global_knowledge' },
                { label: 'Access',  value: ['General', 'Restricted', 'Confidential'][selected.access_level] || 'General' },
              ].map(({ label, value }) => (
                <div key={label} className="p-2 bg-slate-50 border border-slate-200 rounded">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">{label}</p>
                  <p className="text-body-sm font-medium text-on-surface capitalize mt-0.5">{value}</p>
                </div>
              ))}
            </div>
            {selected.summary && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">AI Summary</p>
                <p className="text-xs text-slate-700 leading-relaxed line-clamp-4">{selected.summary}</p>
              </div>
            )}
          </div>

          {/* Mini chat */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[14px]">smart_toy</span>
                <span className="font-label-caps text-[10px]">Vault Analysis Agent</span>
              </div>
              <span className="flex items-center gap-1 text-[10px] text-on-tertiary-container font-bold">
                <div className="h-1.5 w-1.5 rounded-full bg-tertiary-fixed-dim" />
                Ready
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 hide-scrollbar">
              {miniChatMsgs.length === 0 && (
                <div className="flex items-start gap-2">
                  <div className="h-6 w-6 rounded bg-slate-200 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[13px]">auto_awesome</span>
                  </div>
                  <div className="bg-slate-100 p-3 rounded text-xs leading-relaxed max-w-[90%]">
                    I've loaded <strong>{selected.file_name}</strong>. Ask me anything about this document — key terms, summaries, comparisons, or specific clauses.
                  </div>
                </div>
              )}
              {miniChatMsgs.map((m, i) => (
                <div key={i} className={`flex items-start gap-2 ${m.role === 'user' ? 'justify-end' : ''}`}>
                  {m.role === 'assistant' && (
                    <div className="h-6 w-6 rounded bg-slate-200 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-[13px]">auto_awesome</span>
                    </div>
                  )}
                  <div className={`p-3 rounded text-xs leading-relaxed max-w-[90%] ${m.role === 'assistant' ? 'bg-slate-100' : 'bg-secondary-container text-white'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {miniChatLoading && (
                <div className="flex items-center gap-2 ml-8">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full typing-dot" />
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full typing-dot" />
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full typing-dot" />
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-slate-200 bg-white">
              <div className="relative flex items-center">
                <input value={miniChatInput} onChange={e => setMiniChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') askAboutDoc(); }}
                  className="w-full bg-slate-50 border border-slate-200 rounded py-2 px-3 pr-10 text-xs focus:ring-1 focus:ring-secondary focus:border-secondary outline-none placeholder:text-slate-400"
                  placeholder="Ask about this document..." />
                <button onClick={askAboutDoc} disabled={miniChatLoading}
                  className="absolute right-2 text-secondary disabled:opacity-40">
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
