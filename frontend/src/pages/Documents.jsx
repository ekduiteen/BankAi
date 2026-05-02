import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import useDropZone from '../hooks/useDropZone';

export default function Documents() {
  const navigate = useNavigate();
  const [docs, setDocs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploadQueue, setUploadQueue] = useState([]);
  const fileInputRef = useRef(null);
  const mainRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const canApprove = ['super_admin', 'bank_admin', 'compliance_user', 'document_reviewer'].includes(user.role);

  // Fetch documents
  const fetchDocs = useCallback(async () => {
    try {
      setLoading(true);
      const r = await api.get('/documents?limit=200');
      setDocs(r.data);
    } catch (_) {}
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  // Handle file drops and selections
  const handleFiles = useCallback(async (files) => {
    const fileArray = Array.from(files);
    for (const file of fileArray) {
      const tmpId = `tmp-${Date.now()}-${Math.random()}`;
      setUploadQueue(prev => [...prev, {
        id: tmpId,
        name: file.name,
        status: 'uploading',
        progress: 0,
      }]);

      try {
        const fd = new FormData();
        fd.append('file', file);
        const r = await api.post('/documents/upload', fd);
        setUploadQueue(prev =>
          prev.map(u => u.id === tmpId ? { ...r.data, status: 'uploaded', progress: 0 } : u)
        );
        fetchDocs();
      } catch (err) {
        setUploadQueue(prev =>
          prev.map(u => u.id === tmpId ? { ...u, status: 'failed' } : u)
        );
      }
    }
  }, [fetchDocs]);

  const { isDragging, dropHandlers } = useDropZone(handleFiles);

  // Poll document progress
  useEffect(() => {
    const uploadingIds = uploadQueue
      .filter(u => !String(u.id).startsWith('tmp') && !['ready', 'approved', 'failed'].includes(u.status))
      .map(u => u.id);

    if (uploadingIds.length === 0) return;

    const poll = setInterval(async () => {
      try {
        const r = await api.get('/documents?limit=200');
        const updatedDocs = r.data.filter(d => uploadingIds.includes(d.id));
        if (updatedDocs.length > 0) {
          setUploadQueue(prev =>
            prev.map(item =>
              uploadingIds.includes(item.id)
                ? { ...item, ...updatedDocs.find(d => d.id === item.id) }
                : item
            )
          );
        }
      } catch (_) {}
    }, 2000);

    return () => clearInterval(poll);
  }, [uploadQueue]);

  // Approve document
  const handleApprove = async (docId) => {
    try {
      await api.patch(`/documents/${docId}/approve`);
      fetchDocs();
    } catch (_) {}
  };

  // Delete document
  const handleDelete = async (docId) => {
    if (!confirm('Delete this document? Cannot be undone.')) return;
    try {
      await api.delete(`/documents/${docId}`);
      fetchDocs();
    } catch (_) {}
  };

  const filtered = docs.filter(d =>
    (d.file_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const getIcon = (ext) => {
    const icons = {
      pdf: 'description',
      docx: 'article',
      doc: 'article',
      xlsx: 'table_chart',
      xls: 'table_chart',
      pptx: 'slideshow',
      ppt: 'slideshow',
      txt: 'text_snippet',
      jpg: 'image',
      jpeg: 'image',
      png: 'image',
    };
    return icons[ext?.toLowerCase()] || 'insert_drive_file';
  };

  const statusColor = (status) => {
    const colors = {
      uploaded: 'text-slate-500',
      processing: 'text-blue-600',
      extracting_text: 'text-blue-600',
      chunking: 'text-blue-600',
      embedding: 'text-blue-600',
      indexing: 'text-blue-600',
      ready: 'text-green-600',
      approved: 'text-green-700 font-bold',
      failed: 'text-red-600',
    };
    return colors[status] || 'text-slate-500';
  };

  return (
    <div ref={mainRef} {...dropHandlers} className="flex h-full overflow-hidden bg-slate-50">
      {/* Drag overlay */}
      {isDragging && (
        <div className="fixed inset-0 bg-primary/10 border-2 border-dashed border-primary flex items-center justify-center z-40 pointer-events-none">
          <div className="flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-primary text-6xl">cloud_upload</span>
            <p className="text-primary font-semibold">Drop files to upload</p>
          </div>
        </div>
      )}

      {/* Main content */}
      <section className="flex-1 flex flex-col overflow-hidden">
        <div className="p-8 border-b border-slate-200 bg-white flex-shrink-0">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Documents</h1>

          {/* Upload zone */}
          <div className="p-6 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 hover:border-primary transition-colors">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-3xl">cloud_upload</span>
                <div>
                  <p className="font-semibold text-slate-900">Drag files here</p>
                  <p className="text-sm text-slate-500">PDF, DOCX, images, spreadsheets...</p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.docx,.doc,.txt,.xlsx,.xls,.pptx,.ppt,.jpg,.jpeg,.png"
                onChange={(e) => handleFiles(e.target.files || [])}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap"
              >
                Choose Files
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="mt-6 relative max-w-xs">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
            />
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">search</span>
          </div>
        </div>

        {/* Documents list */}
        <div className="flex-1 overflow-y-auto p-8">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-slate-200 border-t-primary rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm text-slate-500">Loading documents...</p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <span className="material-symbols-outlined text-5xl block mb-3">folder_open</span>
              <p className="text-sm">No documents yet. Drag files above to get started.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(doc => (
                <div
                  key={doc.id}
                  className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-lg hover:shadow-sm transition-shadow"
                >
                  {/* File icon */}
                  <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-slate-600">{getIcon(doc.file_type)}</span>
                  </div>

                  {/* File info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate text-sm">{doc.file_name}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs">
                      <span className={`font-semibold ${statusColor(doc.status)} capitalize`}>
                        {doc.status === 'extracting_text' || doc.status === 'chunking' || doc.status === 'embedding' || doc.status === 'indexing'
                          ? `Processing... ${doc.processing_progress}%`
                          : doc.status}
                      </span>
                      {doc.document_type && doc.document_type !== 'other' && (
                        <span className="px-2 py-0.5 bg-primary/10 text-primary rounded font-semibold">
                          {doc.document_type}
                          {doc.department ? ` · ${doc.department}` : ''}
                        </span>
                      )}
                      <span className="text-slate-400">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar (if processing) */}
                  {['uploaded', 'processing', 'extracting_text', 'chunking', 'embedding', 'indexing'].includes(doc.status) && (
                    <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden flex-shrink-0">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${doc.processing_progress || 0}%` }}
                      />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {doc.status === 'ready' && canApprove && !doc.approved_by && (
                      <button
                        onClick={() => handleApprove(doc.id)}
                        className="px-3 py-1 bg-green-50 text-green-700 font-semibold text-xs rounded hover:bg-green-100 transition-colors flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        Approve
                      </button>
                    )}
                    {doc.approved_by && (
                      <span className="text-[10px] text-slate-500 font-semibold">
                        ✓ Approved
                      </span>
                    )}
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Upload queue toast */}
      {uploadQueue.filter(u => ['uploading', 'uploaded'].includes(u.status)).length > 0 && (
        <div className="fixed bottom-6 right-6 bg-white border border-slate-200 rounded-lg shadow-lg p-4 w-80 z-30">
          <p className="text-xs font-bold text-slate-500 uppercase mb-3">Uploading</p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {uploadQueue.filter(u => ['uploading', 'uploaded'].includes(u.status)).map(item => (
              <div key={item.id} className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center flex-shrink-0 text-xs">
                  <span className="material-symbols-outlined text-[12px] text-slate-600">insert_drive_file</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate">{item.name}</p>
                  {item.status === 'uploading' && (
                    <div className="mt-0.5 h-1 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-primary transition-all duration-300" style={{ width: '100%' }} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
