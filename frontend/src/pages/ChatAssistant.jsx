import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, useOutletContext } from 'react-router-dom';
import api from '../api/axios';
import FilePreviewCard from '../components/chat/FilePreviewCard';

const FILE_ACCEPT = '.pdf,.docx,.txt,.xlsx,.xls,.pptx,.ppt,.jpg,.jpeg,.png';

// ── Markdown renderer ─────────────────────────────────────────────────────────
function inlineFormat(text) {
  if (!text) return null;
  const parts = [];
  let last = 0;
  const re = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(<span key={last}>{text.slice(last, m.index)}</span>);
    if (m[2]) parts.push(<strong key={m.index} className="font-semibold">{m[2]}</strong>);
    else if (m[3]) parts.push(<em key={m.index}>{m[3]}</em>);
    else if (m[4]) parts.push(<code key={m.index} className="bg-slate-100 text-secondary px-1 rounded text-xs font-mono">{m[4]}</code>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(<span key={last}>{text.slice(last)}</span>);
  return parts.length ? parts : text;
}

function renderMarkdown(text) {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    const t = line.trim();
    if (t.startsWith('### ')) return <h3 key={i} className="font-bold text-on-surface mt-3 mb-1 text-sm">{t.slice(4)}</h3>;
    if (t.startsWith('## '))  return <h2 key={i} className="font-bold text-on-surface mt-4 mb-1">{t.slice(3)}</h2>;
    if (t === '---')           return <hr key={i} className="border-slate-100 my-3" />;
    if (t.startsWith('• ') || t.startsWith('- ') || t.startsWith('* ')) {
      return <div key={i} className="flex items-start gap-2 ml-3 my-0.5 text-body-sm"><span className="text-secondary mt-0.5 flex-shrink-0">•</span><span>{inlineFormat(t.slice(2))}</span></div>;
    }
    if (/^\d+\.\s/.test(t)) {
      const num = t.match(/^(\d+)\./)[1];
      return <div key={i} className="flex items-start gap-2 ml-3 my-0.5 text-body-sm"><span className="text-secondary font-medium flex-shrink-0 w-4">{num}.</span><span>{inlineFormat(t.replace(/^\d+\.\s/, ''))}</span></div>;
    }
    if (t === '') return <div key={i} className="h-2" />;
    return <div key={i} className="text-body-sm leading-relaxed">{inlineFormat(line)}</div>;
  });
}

function safeJson(str, fallback) {
  try { return JSON.parse(str || 'null') ?? fallback; } catch { return fallback; }
}

function welcomeMsg() {
  return {
    id: 'welcome', role: 'assistant',
    content: 'नमस्ते! I am **BankAi** — your secure financial document intelligence workspace.\n\nUpload a document using the attachment icon below, or ask me anything about your uploaded files.',
    sources: [], suggestions: [],
  };
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ChatAssistant() {
  const [searchParams]  = useSearchParams();
  const outletCtx       = useOutletContext() || {};
  const language        = outletCtx.language || localStorage.getItem('language') || 'en';

  const [messages, setMessages]               = useState([]);
  const [input, setInput]                     = useState('');
  const [isLoading, setIsLoading]             = useState(false);
  const [sessionId, setSessionId]             = useState(null);
  const [sessions, setSessions]               = useState([]);
  const [activeDocuments, setActiveDocuments] = useState([]);
  const [streamingText, setStreamingText]     = useState('');
  const [statusMsg, setStatusMsg]             = useState('');
  const [sidebarOpen, setSidebarOpen]         = useState(false);
  const [editingId, setEditingId]             = useState(null);
  const [editText, setEditText]               = useState('');
  const [userScrolled, setUserScrolled]       = useState(false);
  const [abortCtrl, setAbortCtrl]             = useState(null);

  const endRef      = useRef(null);
  const bodyRef     = useRef(null);
  const fileRef     = useRef(null);
  const textareaRef = useRef(null);

  const scrollBottom = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { if (!userScrolled) scrollBottom(); }, [messages, streamingText, userScrolled]);

  // ── Fetch sessions list ──────────────────────────────────────────────────
  const fetchSessions = useCallback(async () => {
    try { const r = await api.get('/chat/sessions'); setSessions(r.data); } catch (_) {}
  }, []);

  // ── Load a session ───────────────────────────────────────────────────────
  const loadSession = useCallback(async (id) => {
    try {
      setSessionId(id);
      setSidebarOpen(false);
      const [msgR, sessR] = await Promise.all([
        api.get(`/chat/sessions/${id}/messages`),
        api.get(`/chat/sessions/${id}`),
      ]);
      const loaded = msgR.data.map(m => ({
        id: m.id, role: m.role, content: m.content,
        sources: safeJson(m.sources_json, []),
        suggestions: safeJson(m.suggestions_json, []),
      }));
      if (loaded.length === 0) loaded.unshift(welcomeMsg());
      setMessages(loaded);

      // Restore active session documents
      const activeIds = safeJson(sessR.data.active_document_ids_json, []);
      if (activeIds.length > 0) {
        try {
          const docsR = await api.get('/documents?limit=200');
          const sessionDocs = docsR.data.filter(d =>
            activeIds.includes(d.id) && d.session_id === id
          );
          setActiveDocuments(sessionDocs);
        } catch (_) { setActiveDocuments([]); }
      } else {
        setActiveDocuments([]);
      }
    } catch (err) { console.error('loadSession', err); }
  }, []);

  const createNewSession = useCallback(async () => {
    try {
      const r = await api.post('/chat/sessions', { title: 'New Analysis' });
      setSessionId(r.data.id);
      setActiveDocuments([]);
      setMessages([welcomeMsg()]);
      fetchSessions();
    } catch (_) {}
  }, [fetchSessions]);

  // ── Bootstrap ────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      await fetchSessions();
      const sid = searchParams.get('session');
      const prompt = searchParams.get('prompt');
      if (sid) {
        await loadSession(parseInt(sid));
        if (prompt) setInput(decodeURIComponent(prompt));
      } else {
        const r = await api.get('/chat/sessions').catch(() => ({ data: [] }));
        if (r.data.length > 0) await loadSession(r.data[0].id);
        else await createNewSession();
      }
    };
    init();
  }, []);

  // ── File upload ──────────────────────────────────────────────────────────
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      console.warn('No file selected');
      return;
    }

    console.log('File selected:', file.name, file.type, file.size, 'bytes');

    // Create session if needed
    if (!sessionId) {
      try {
        console.log('Creating new session...');
        const r = await api.post('/chat/sessions', { title: 'New Analysis' });
        console.log('Session created:', r.data.id);
        setSessionId(r.data.id);
      } catch (err) {
        console.error('Failed to create session:', err.response?.data || err.message);
        setActiveDocuments(prev => [...prev, {
          id: `tmp-${Date.now()}`, name: file.name, status: 'failed',
          processing_message: `Failed to create session: ${err.response?.data?.detail || err.message}`,
        }]);
        return;
      }
    }

    const tmpId = `tmp-${Date.now()}`;
    setActiveDocuments(prev => [...prev, {
      id: tmpId, name: file.name, status: 'uploading',
      processing_progress: 0, processing_message: 'Uploading document...',
    }]);

    try {
      const fd = new FormData();
      fd.append('file', file);
      console.log('Uploading file to session', sessionId);
      const r = await api.post(`/chat/sessions/${sessionId}/files`, fd);
      console.log('Upload successful:', r.data);
      setActiveDocuments(prev =>
        prev.map(d => d.id === tmpId ? { ...d, ...r.data, name: file.name, status: 'uploaded' } : d)
      );
    } catch (err) {
      const errorDetail = err.response?.data?.detail || err.message;
      console.error('File upload failed:', {
        status: err.response?.status,
        detail: errorDetail,
        fullError: err,
      });
      setActiveDocuments(prev =>
        prev.map(d => d.id === tmpId
          ? {
              ...d, status: 'failed',
              processing_message: `Upload failed: ${errorDetail}`
            } : d)
      );
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  // ── Send / Stream ────────────────────────────────────────────────────────
  const handleSend = async (e, override) => {
    e?.preventDefault();
    const content = (override ?? input).trim();
    if (!content || isLoading || !sessionId) return;

    // Warn if docs still processing
    const busy = activeDocuments.filter(
      d => !['ready','approved','indexed'].includes(d.status) && !String(d.id).startsWith('tmp')
    );
    if (busy.length) {
      setMessages(prev => [...prev, {
        id: Date.now(), role: 'assistant',
        content: `⚠️ **${busy[0].name || busy[0].file_name}** is still being processed. Please wait for "Ready" status before asking questions about it.`,
        sources: [], suggestions: [],
      }]);
      return;
    }

    setMessages(prev => [...prev, { id: Date.now(), role: 'user', content, sources: [], suggestions: [] }]);
    setInput('');
    if (textareaRef.current) { textareaRef.current.style.height = 'auto'; }
    setIsLoading(true);
    setStreamingText('');
    setStatusMsg('');
    setUserScrolled(false);

    const ctrl = new AbortController();
    setAbortCtrl(ctrl);

    try {
      const token = localStorage.getItem('token');
      const resp = await fetch(`/api/chat/sessions/${sessionId}/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          message: content,
          language,
          active_document_ids: activeDocuments
            .map(d => Number(d.document_id || d.id))
            .filter(id => Number.isInteger(id)),
        }),
        signal: ctrl.signal,
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      const reader  = resp.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let buffer   = '';
      let sources  = [];
      let suggestions = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          const t = line.trim();
          if (!t.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(t.slice(6));
            if (data.type === 'status') { setStatusMsg(data.message || ''); }
            else if (data.token) { fullText += data.token; setStreamingText(fullText); setStatusMsg(''); }
            if (data.sources)     sources     = data.sources;
            if (data.suggestions) suggestions = data.suggestions;
          } catch (_) {}
        }
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: 'assistant',
        content: fullText || 'No response received.',
        sources, suggestions,
      }]);
      fetchSessions();
    } catch (err) {
      if (err.name === 'AbortError') {
        setMessages(prev => [...prev, {
          id: Date.now() + 1, role: 'assistant',
          content: (streamingText || '') + '\n\n*(Generation stopped)*',
          sources: [], suggestions: [],
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: Date.now() + 1, role: 'assistant',
          content: 'Connection error. Please check the AI engine and try again.',
          sources: [], suggestions: [],
        }]);
      }
    } finally {
      setIsLoading(false); setStreamingText(''); setStatusMsg(''); setAbortCtrl(null);
    }
  };

  const stopGeneration = () => abortCtrl?.abort();

  const regenerate = async (idx) => {
    const prevUser = [...messages].slice(0, idx).reverse().find(m => m.role === 'user');
    if (!prevUser) return;
    setMessages(prev => prev.slice(0, idx));
    await handleSend(null, prevUser.content);
  };

  const startEdit = (msg) => { setEditingId(msg.id); setEditText(msg.content); };
  const submitEdit = async (idx) => {
    if (!editText.trim()) return;
    setMessages(prev => prev.slice(0, idx));
    setEditingId(null);
    await handleSend(null, editText.trim());
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main chat */}
      <div className="flex-1 flex flex-col bg-white border-r border-slate-200 min-w-0">

        {/* Sub-header */}
        <div className="h-14 flex items-center justify-between px-6 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary-container rounded flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
            </div>
            <span className="font-semibold text-on-surface text-sm truncate max-w-xs">
              {sessions.find(s => s.id === sessionId)?.title || 'New Analysis'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={createNewSession} className="flex items-center gap-1 text-xs border border-slate-200 px-3 py-1.5 rounded hover:bg-slate-50 transition-colors text-slate-600">
              <span className="material-symbols-outlined text-[15px]">add_comment</span> New Chat
            </button>
            <button onClick={() => setSidebarOpen(v => !v)} className="p-1.5 text-slate-500 hover:text-on-surface hover:bg-slate-100 rounded">
              <span className="material-symbols-outlined text-[20px]">history</span>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={bodyRef} onScroll={() => {
          const el = bodyRef.current;
          if (el) setUserScrolled(el.scrollHeight - el.scrollTop - el.clientHeight > 80);
        }} className="flex-1 overflow-y-auto px-gutter py-xl hide-scrollbar">
          <div className="max-w-3xl mx-auto space-y-8">
            {messages.map((msg, idx) => (
              <MsgBubble key={msg.id} msg={msg} idx={idx}
                isLast={idx === messages.length - 1} isLoading={isLoading}
                editingId={editingId} editText={editText} setEditText={setEditText}
                onCopy={(t) => navigator.clipboard.writeText(t)}
                onRegenerate={regenerate}
                onEdit={startEdit}
                onSubmitEdit={submitEdit}
                onCancelEdit={() => setEditingId(null)}
                onSuggestion={(s) => handleSend(null, s)}
              />
            ))}

            {isLoading && statusMsg && !streamingText && (
              <div className="flex gap-4 items-center">
                <AiBadge />
                <div className="flex items-center gap-3">
                  <span className="text-body-sm text-slate-500 italic">{statusMsg}</span>
                  <ThinkingDots />
                </div>
              </div>
            )}

            {isLoading && streamingText && (
              <div className="flex gap-4">
                <AiBadge />
                <div className="flex-1 text-body-sm text-on-surface leading-relaxed">
                  {renderMarkdown(streamingText)}
                  <span className="streaming-cursor" />
                </div>
              </div>
            )}

            {isLoading && !streamingText && !statusMsg && (
              <div className="flex gap-4 items-center">
                <div className="w-9 h-9 flex-shrink-0 bg-slate-100 rounded flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-400 text-[18px]">smart_toy</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-body-sm text-slate-500 italic">BankAi is analyzing your documents...</span>
                  <ThinkingDots />
                </div>
              </div>
            )}

            <div ref={endRef} className="h-4" />
          </div>
        </div>

        {/* Jump-to-bottom */}
        {userScrolled && (
          <button onClick={() => { setUserScrolled(false); scrollBottom(); }}
            className="absolute bottom-28 right-96 p-2 bg-white border border-slate-200 rounded-full shadow-floating text-slate-500 hover:text-on-surface z-10">
            <span className="material-symbols-outlined text-[20px]">keyboard_arrow_down</span>
          </button>
        )}

        {/* Footer input */}
        <footer className="p-6 bg-white border-t border-slate-200 flex-shrink-0">
          <div className="max-w-3xl mx-auto space-y-3">
            {activeDocuments.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeDocuments.map(d => (
                  <FilePreviewCard key={d.id} file={d} onRemove={doc => setActiveDocuments(prev => prev.filter(x => x.id !== doc.id))} />
                ))}
                <button onClick={() => {
                  console.log('Add reference document button clicked, fileRef:', fileRef.current);
                  fileRef.current?.click();
                }}
                  className="p-3 bg-white border-2 border-dashed border-slate-200 rounded flex items-center justify-center gap-2 cursor-pointer hover:border-secondary transition-colors text-slate-400 hover:text-secondary text-body-sm font-medium">
                  <span className="material-symbols-outlined">add_circle</span>
                  Add reference document
                </button>
              </div>
            )}

            <div className="relative">
              <button type="button" onClick={() => {
                console.log('Attachment button clicked, fileRef:', fileRef.current);
                fileRef.current?.click();
              }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors p-1"
                disabled={isLoading}>
                <span className="material-symbols-outlined text-[22px]">attachment</span>
              </button>
              <input type="file" ref={fileRef} onChange={handleFileSelect} className="hidden" accept={FILE_ACCEPT} data-testid="file-upload" />
              <textarea
                data-testid="chat-input"
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
                }}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
                placeholder={activeDocuments.length > 0
                  ? `Ask about ${activeDocuments.map(d => d.name || d.file_name).slice(0, 2).join(', ')} in English or नेपाली...`
                  : 'Ask BankAi about your documents in English or नेपाली...'}
                className="w-full pl-12 pr-28 py-4 bg-slate-100 border-none focus:ring-2 focus:ring-secondary/20 rounded font-body-sm text-on-surface placeholder:text-slate-400 resize-none min-h-[56px] max-h-[160px] leading-relaxed outline-none"
                rows={1}
                disabled={isLoading && !abortCtrl}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {isLoading ? (
                  <button onClick={stopGeneration}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-error/20 text-error hover:bg-error/5 rounded text-xs font-bold transition-colors">
                    <span className="material-symbols-outlined text-[16px]">stop_circle</span> STOP
                  </button>
                ) : (
                  <button onClick={handleSend} disabled={!input.trim() && activeDocuments.length === 0}
                    className="bg-primary text-white p-2.5 rounded shadow-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-40">
                    <span className="material-symbols-outlined text-[20px]">send</span>
                  </button>
                )}
              </div>
            </div>

            <p className="text-center text-[10px] text-slate-400 font-label-caps tracking-widest uppercase">
              Encrypted End-to-End · Private Cloud Environment
            </p>
          </div>
        </footer>
      </div>

      {/* History sidebar */}
      {sidebarOpen && (
        <div className="w-72 flex flex-col bg-slate-50 border-l border-slate-200 flex-shrink-0 animate-slide-in">
          <div className="h-14 flex items-center justify-between px-4 border-b border-slate-200 bg-white">
            <h3 className="font-semibold text-on-surface text-sm">Chat History</h3>
            <button onClick={() => setSidebarOpen(false)} className="p-1 text-slate-400 hover:text-on-surface rounded hover:bg-slate-100">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {sessions.map(sess => {
              const activeDocs = safeJson(sess.active_document_ids_json, []);
              return (
                <button key={sess.id} onClick={() => loadSession(sess.id)}
                  className={`w-full text-left p-3 rounded transition-colors ${sessionId === sess.id ? 'bg-white ring-1 ring-slate-200 shadow-sm text-on-surface' : 'text-slate-600 hover:bg-white hover:text-on-surface'}`}>
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[15px] mt-0.5 text-outline flex-shrink-0">chat_bubble_outline</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{sess.title}</p>
                      {activeDocs.length > 0 && (
                        <p className="text-[10px] text-outline mt-0.5">{activeDocs.length} file{activeDocs.length !== 1 ? 's' : ''} attached</p>
                      )}
                      <p className="text-[10px] text-outline mt-0.5">{new Date(sess.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </button>
              );
            })}
            {sessions.length === 0 && <p className="text-xs text-slate-400 text-center mt-6">No history yet</p>}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function AiBadge() {
  return (
    <div className="w-9 h-9 flex-shrink-0 bg-primary-container rounded flex items-center justify-center mt-1">
      <span className="material-symbols-outlined text-white text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
    </div>
  );
}

function ThinkingDots() {
  return (
    <div className="flex gap-1">
      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full typing-dot" />
      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full typing-dot" />
      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full typing-dot" />
    </div>
  );
}

function MsgBubble({ msg, idx, isLast, isLoading, editingId, editText, setEditText,
  onCopy, onRegenerate, onEdit, onSubmitEdit, onCancelEdit, onSuggestion }) {
  const isUser    = msg.role === 'user';
  const isEditing = editingId === msg.id;

  return (
    <div className={`flex ${isUser ? 'flex-col items-end' : 'gap-4'} group`}>
      {!isUser && <AiBadge />}
      <div className={isUser ? 'max-w-[78%]' : 'flex-1'}>
        {isEditing ? (
          <div className="space-y-2">
            <textarea value={editText} onChange={e => setEditText(e.target.value)} autoFocus
              className="w-full bg-slate-50 border border-secondary/30 rounded px-3 py-2 text-body-sm resize-none focus:outline-none focus:ring-1 focus:ring-secondary" rows={3} />
            <div className="flex gap-2 justify-end">
              <button onClick={onCancelEdit} className="px-3 py-1 text-xs border border-slate-200 rounded hover:bg-slate-50">Cancel</button>
              <button onClick={() => onSubmitEdit(idx)} className="px-3 py-1 text-xs bg-primary text-white rounded hover:opacity-90">Send</button>
            </div>
          </div>
        ) : (
          <div className={isUser ? 'bg-white border border-slate-200 rounded shadow-card p-4' : 'space-y-3'}>
            {isUser
              ? <p className="text-body-sm text-on-surface leading-relaxed" data-testid="message-content">{msg.content}</p>
              : <div className="text-body-sm text-on-surface" data-testid="message-content">{renderMarkdown(msg.content)}</div>
            }

            {/* Source chips */}
            {!isUser && msg.sources && msg.sources.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {msg.sources.map((s, i) => (
                  <span key={i} title={s.snippet} data-testid="source-card"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded text-[11px] font-medium text-slate-600">
                    <span className="material-symbols-outlined text-[13px] text-secondary">description</span>
                    {s.document_title || s.title || 'Source'}
                    {s.page_number && <span className="text-slate-400">[p.{s.page_number}]</span>}
                  </span>
                ))}
              </div>
            )}

            {/* Action bar — assistant */}
            {!isUser && msg.id !== 'welcome' && (
              <div className="flex items-center gap-4 pt-2 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onCopy(msg.content)} className="flex items-center gap-1 text-slate-400 hover:text-slate-900 text-[12px] transition-colors">
                  <span className="material-symbols-outlined text-[15px]">content_copy</span> Copy
                </button>
                <button onClick={() => onRegenerate(idx)} disabled={isLoading}
                  className="flex items-center gap-1 text-slate-400 hover:text-slate-900 text-[12px] transition-colors disabled:opacity-40">
                  <span className="material-symbols-outlined text-[15px]">refresh</span> Regenerate
                </button>
              </div>
            )}

            {/* Edit button — user */}
            {isUser && msg.id !== 'welcome' && (
              <div className="flex justify-end mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onEdit(msg)} className="flex items-center gap-1 text-slate-400 hover:text-slate-900 text-[11px]">
                  <span className="material-symbols-outlined text-[13px]">edit</span> Edit
                </button>
              </div>
            )}

            {/* Timestamp */}
            {isUser && (
              <div className="text-[10px] text-slate-400 text-right font-label-caps uppercase mt-1">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · EN
              </div>
            )}
          </div>
        )}

        {/* Follow-up suggestions */}
        {!isUser && msg.suggestions && msg.suggestions.length > 0 && isLast && !isLoading && (
          <div className="flex flex-wrap gap-2 mt-3">
            {msg.suggestions.map((s, i) => (
              <button key={i} onClick={() => onSuggestion(s)}
                className="px-3 py-1.5 text-xs bg-white border border-slate-200 text-slate-700 hover:border-secondary hover:text-secondary rounded transition-colors text-left">
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
