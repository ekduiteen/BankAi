# BankAi Recovery Audit

Date: 2026-04-28
Workspace: `E:\BankAi`
Mode: Recovery audit before product code changes

## 1. Current Project Structure

Top-level structure:

```text
E:\BankAi
├── .git
├── backend
├── docs
├── frontend
├── stitch_bankai_enterprise_intelligence
├── .env
├── .env.example
├── ARCHITECTURE.md
├── DEPLOYMENT.md
├── docker-compose.yml
├── IMPLEMENTATION_PLAN.md
└── README.md
```

Important note: the local repository is newly initialized on `main` with no commits. All files are currently untracked.

## 2. Recovery Command Results

| Check | Result |
|---|---|
| Current working directory | `E:\BankAi` |
| Git branch | `main` |
| Git status | No commits yet; all project files are untracked |
| Recent commits | None; `git log --oneline -10` fails because branch has no commits |
| Uncommitted files | All files are uncommitted/untracked |
| Modified files | None tracked because nothing has been committed yet |
| New/untracked files | `.env`, `.env.example`, docs, backend, frontend, design references, Docker files |
| Existing package managers | Frontend uses npm with `package-lock.json`; backend uses `requirements.txt` |
| Frontend framework | React 18 + Vite + Tailwind CSS |
| Backend framework | FastAPI + SQLModel |
| Existing database/migration system | SQLModel `create_all`; ad-hoc migration script at `backend/app/db/migrate_chat_ux.py`; no Alembic migration directory found |
| Existing environment files | `.env`, `.env.example` |
| Existing Docker setup | Root `docker-compose.yml`; backend/frontend Dockerfiles |
| Existing test setup | Backend `pytest` tests in `backend/tests/test_main.py`; no frontend test script |
| Frontend install | `npm install` succeeds; 2 moderate npm audit findings |
| Frontend build | `npm run build` succeeds |
| Frontend test | `npm test` fails: missing `test` script |
| Frontend lint | `npm run lint` fails: `eslint` command not installed although script exists |
| Backend dependency install | Initial sandboxed pip failed due network permissions; escalated `python -m pip install -r requirements.txt` succeeded |
| Backend compile | Targeted `python -m py_compile ...` succeeds |
| Backend tests | `python -m pytest tests\test_main.py -p no:cacheprovider` fails during import: `PermissionError: [WinError 5] Access is denied: '/tmp'` from `backend/app/api/documents.py` |
| Docker compose ps | Local compose project has no running local BankAi containers |
| Docker compose config | Valid config produced; warning: Docker config file access denied and compose `version` is obsolete |

## 3. Existing Frontend Location

Frontend root: `frontend/`

Key files:

- `frontend/package.json`
- `frontend/vite.config.js`
- `frontend/tailwind.config.js`
- `frontend/src/App.jsx`
- `frontend/src/layouts/MainLayout.jsx`
- `frontend/src/pages/ChatAssistant.jsx`
- `frontend/src/pages/Documents.jsx`
- `frontend/src/components/chat/FilePreviewCard.jsx`
- `frontend/src/components/chat/SourceCards.jsx`
- `frontend/src/api/axios.js`

Framework: React 18, Vite, Tailwind CSS.

## 4. Existing Backend Location

Backend root: `backend/`

Key files:

- `backend/app/main.py`
- `backend/app/api/chat.py`
- `backend/app/api/documents.py`
- `backend/app/api/analytics.py`
- `backend/app/services/ingestion_service.py`
- `backend/app/services/rag_service.py`
- `backend/app/services/qdrant_service.py`
- `backend/app/services/query_rewrite_service.py`
- `backend/app/services/llm_service.py`
- `backend/app/services/guardrail_service.py`
- `backend/app/services/audit_service.py`
- `backend/app/models/chat.py`
- `backend/app/models/document.py`
- `backend/app/models/audit.py`
- `backend/app/db/session.py`
- `backend/app/db/migrate_chat_ux.py`

Framework: FastAPI with SQLModel.

## 5. Database and Migration Location

Database setup:

- SQLModel engine: `backend/app/db/session.py`
- Database URL from `.env` / environment: `DATABASE_URL`
- Tables are created with `SQLModel.metadata.create_all(engine)` in `init_db()`.
- Ad-hoc schema migration: `backend/app/db/migrate_chat_ux.py`

Model files found:

- `backend/app/models/bank.py`
- `backend/app/models/user.py`
- `backend/app/models/chat.py`
- `backend/app/models/document.py`
- `backend/app/models/audit.py`

Tables/entities found:

- `Bank`
- `User`
- `ChatSession`
- `ChatMessage`
- `Document`
- `DocumentChunk`
- `AuditLog`
- `SecurityEvent`

Not found:

- `GenerationRun` model/table
- first-class `Role` model/table
- `attachments_json` on chat messages
- `language_mode`, `status`, `updated_at` on chat sessions
- `file_size`, `updated_at`, PII fields on documents
- PII/source hash fields on document chunks

## 6. Existing Chat Implementation

Main backend chat routes: `backend/app/api/chat.py`

Found routes:

- `POST /api/chat/sessions`
- `GET /api/chat/sessions`
- `GET /api/chat/sessions/{session_id}`
- `GET /api/chat/sessions/{session_id}/messages`
- `POST /api/chat/sessions/{session_id}/messages`
- `POST /api/chat/sessions/{session_id}/stream`
- `POST /api/chat/sessions/{session_id}/files`
- `POST /api/chat/sessions/{session_id}/stream-file`

Main frontend chat page: `frontend/src/pages/ChatAssistant.jsx`

Existing UX support:

- Session creation and loading
- Session message loading
- File upload from chat
- Active document local state
- Streaming response handling over fetch/SSE-style chunks
- Status message display
- Stop generation using `AbortController`
- Regenerate button
- Copy button
- Edit and resend user message
- Suggested follow-up chips
- Smart autoscroll guard
- Session sidebar
- Language mode from shared layout/localStorage

## 7. Existing File Upload Implementation

Chat upload route:

- `backend/app/api/chat.py`, `upload_session_file`
- Stores file under `/tmp/chat_uploads`
- Creates `Document`
- Sets:
  - `bank_id`
  - `uploaded_by`
  - `session_id`
  - `document_scope = "session_upload"`
  - `status = "uploaded"`
- Adds document ID to `ChatSession.active_document_ids_json`
- Queues `process_document(doc.id, db)` as a background task

Global document upload route:

- `backend/app/api/documents.py`, `upload_document`
- Stores file under `/tmp/uploads`
- Requires bank admin
- Creates global document record
- Queues `process_document`

Problem found:

- `backend/app/api/documents.py` executes `os.makedirs("/tmp/uploads", exist_ok=True)` at import time. On Windows this fails during tests with `PermissionError: [WinError 5] Access is denied: '/tmp'`.
- Upload paths are Linux/container-oriented and not portable to local Windows tests.
- Background task receives an active SQLModel session object; this may be fragile after request lifecycle boundaries.

## 8. Existing Document Processing Implementation

Main file: `backend/app/services/ingestion_service.py`

Supported types found:

- PDF via `pypdf`
- DOCX via `python-docx`
- TXT
- XLSX/XLS via `openpyxl`
- PPTX/PPT via `python-pptx`
- JPG/JPEG/PNG via vision LLM

Current statuses used:

- `extracting_text`
- `chunking`
- `embedding`
- `indexing`
- `ready`
- `failed`

Gaps against target flow:

- No explicit `scanning`
- No explicit `running_ocr`
- No explicit `parsing_tables`
- PDF page numbers are not preserved into chunks
- XLSX sheet names are included in text but not stored as structured chunk metadata
- PPTX slide numbers are included in text but not stored as structured chunk metadata
- PII masking is not applied to extracted chunks before embedding/LLM context
- `DocumentChunk` stores raw `chunk_text`; no masked/encrypted chunk fields

## 9. Existing RAG / Vector Search Implementation

Main files:

- `backend/app/services/qdrant_service.py`
- `backend/app/services/rag_service.py`
- `backend/app/api/chat.py`

Current behavior:

- Qdrant collection: `bank_documents`
- Vectors include payload:
  - `bank_id`
  - `document_id`
  - `chunk_index`
  - `text`
  - `document_scope`
  - `session_id`
- `search_points` supports filters:
  - `bank_id`
  - `document_ids`
  - `session_id`
  - `document_scope`
- `rag_service.generate_rag_response` searches session uploads first, then global knowledge top-up.
- Streaming route has its own duplicated RAG logic with same priority order.

Problems/gaps:

- RAG logic is duplicated between `rag_service.py` and `chat.py`.
- No explicit selected-document priority tier.
- Session summary and active document summaries are not included in the retrieval prompt.
- Global knowledge status is filtered after Qdrant retrieval in SQL, not directly in vector payload.
- Context builder service is missing.

## 10. Existing LLM Integration

Main file: `backend/app/services/llm_service.py`

Providers:

- Ollama `/api/generate`
- OpenAI-compatible placeholder `/v1/chat/completions`

Streaming:

- `backend/app/api/chat.py` calls Ollama `/api/chat` directly with `httpx.stream`.

Gaps:

- LLM streaming is not abstracted into a service.
- Token counts, latency, generation run status are not captured.
- No `generation_runs` table.

## 11. Existing Streaming Implementation

Backend:

- `POST /api/chat/sessions/{session_id}/stream`
- Uses `StreamingResponse` with `data: {...}\n\n`
- Emits status events:
  - `Searching your uploaded documents...`
  - `Preparing source-based answer...`
- Streams token payloads as `{"token": "..."}`
- Final event includes `done`, `sources`, and `suggestions`

Frontend:

- `ChatAssistant.jsx` reads `resp.body.getReader()`
- Parses `data:` lines
- Displays status text before tokens
- Supports stop with `AbortController`

Gaps:

- Abort only cancels the browser fetch; backend does not persist a cancelled generation run status.
- `stream-file` route is a separate path and has less complete RAG/source handling.

## 12. Existing Session / History Implementation

Backend:

- `ChatSession` has:
  - `id`
  - `bank_id`
  - `user_id`
  - `title`
  - `active_document_ids_json`
  - `session_summary`
  - `created_at`
- `ChatMessage` has:
  - `id`
  - `bank_id`
  - `session_id`
  - `user_id`
  - `role`
  - `content`
  - `status`
  - `sources_json`
  - `suggestions_json`
  - `created_at`

Frontend:

- `ChatAssistant.loadSession()` fetches messages and session metadata.
- It parses `active_document_ids_json`.
- It reloads matching documents from `/documents?limit=200` and filters by `session_id`.

Problems/gaps:

- `GET /api/documents` filters staff users to `status == "approved"`, which can hide session uploads with status `ready`. This may break active-document restoration for staff users.
- `GET /api/chat/sessions` expects `skip`, but `SessionHistory.jsx` uses `offset`; pagination mismatch.
- No `updated_at`, `status`, or `language_mode` on `ChatSession`.

## 13. Existing PII Masking Implementation

Main file: `backend/app/services/guardrail_service.py`

Existing patterns:

- SSN-like
- Card-like 16 digit
- Nepal mobile
- Email
- 16 digit account
- account-like with prefix
- citizenship number
- passport
- PAN/VAT
- DOB labels

Current use:

- User question is masked before saving and LLM use.
- Prompt injection attempts log security events.

Problems/gaps:

- Audit metadata still includes raw `chat_request.message` in `chat.py`, which can store raw PII.
- Retrieved chunks are not masked before being sent to LLM.
- LLM answers are not masked before save/display.
- No structured PII metadata is returned, such as `pii_detected`, `pii_types`, or `pii_count`.
- Security event metadata can store raw query.

## 14. Existing Audit Log Implementation

Main files:

- `backend/app/models/audit.py`
- `backend/app/services/audit_service.py`
- `backend/app/api/audit.py`

Tables:

- `AuditLog`
- `SecurityEvent`

Existing audit route:

- `GET /api/audit`

Problems/gaps:

- Audit metadata is JSON text without schema validation.
- Audit metadata may include raw PII.
- No explicit evidence-trail model for retrieved chunks/source hashes/model latency/token counts.

## 15. Existing Roles / Permissions Implementation

Main files:

- `backend/app/models/user.py`
- `backend/app/api/users.py`
- `backend/app/api/deps.py`
- `frontend/src/pages/Users.jsx`

Roles are string-based:

- `super_admin`
- `bank_admin`
- `compliance_officer`
- `data_auditor`
- `staff_user`

Problems/gaps:

- No `roles` table.
- No granular permission persistence.
- User roles UI is largely management/configuration UI but role permissions appear front-end state only.

## 16. Build and Test Errors

| Command | Status | Evidence |
|---|---|---|
| `npm install` in `frontend` | working | Up to date; 2 moderate audit findings |
| `npm run build` in `frontend` | working | Vite build succeeded; 101 modules transformed |
| `npm test` in `frontend` | exists but broken | Missing script: `test` |
| `npm run lint` in `frontend` | exists but broken | `eslint` not recognized; dependency missing |
| `python -m pip install -r requirements.txt` in `backend` | working after escalation | Dependencies installed into user site-packages |
| `python -m py_compile ...` in `backend` | working | Targeted backend files compile |
| `python -m pytest tests\test_main.py -p no:cacheprovider` | exists but broken | Fails during import because `/tmp/uploads` creation is denied on Windows |
| `docker compose ps` | working | No local BankAi containers running |
| `docker compose config` | working with warning | Config resolves; Docker user config access warning; obsolete `version` warning |

## 17. Incomplete Files From Previous Session

Likely incomplete or fragile:

- `backend/app/api/chat.py`
  - Implements session-aware chat but duplicates RAG logic and stores raw query in audit metadata.
  - `stream-file` is separate and less complete.
- `backend/app/api/documents.py`
  - Import-time `/tmp/uploads` creation breaks local tests.
  - Staff users cannot list `ready` session uploads, likely breaking session reload.
- `backend/app/services/ingestion_service.py`
  - Missing page/sheet/slide structured metadata.
  - Does not mask chunks before embedding/context.
- `backend/app/services/query_rewrite_service.py`
  - Exists, but signature does not include active documents or session summary.
- `backend/app/services/rag_service.py`
  - Session-first priority exists, but no selected-doc tier and no context builder.
- `backend/app/models/chat.py`
  - Missing language/status/updated/attachments/PII fields from target model.
- `backend/app/models/document.py`
  - Missing file size, updated_at, PII fields, chunk metadata fields.
- `frontend/src/pages/ChatAssistant.jsx`
  - Good core UX present, but relies on `/documents` list for active session files and can be affected by backend staff filtering.
- `frontend/src/pages/SessionHistory.jsx`
  - Uses `offset` query param while backend sessions endpoint uses `skip`.

## 18. What Appears Already Finished

- React/Vite/Tailwind frontend exists and builds.
- Enterprise pages exist:
  - Login
  - Dashboard
  - Chat
  - Documents
  - Audit Logs
  - Sessions
  - Analytics
  - Users
  - Settings
  - Admin Security
  - Help
  - Compliance
- Backend FastAPI app exists.
- Docker Compose stack exists.
- Analytics endpoint exists and is registered.
- Session upload route attaches documents to sessions.
- `active_document_ids_json` exists on model/schema.
- Qdrant payload includes `bank_id`, `session_id`, `document_scope`.
- RAG searches active session docs before global docs.
- Query rewrite service exists.
- Chat UI supports streaming, stop, regenerate, copy, edit, suggestions, and active file cards.

## 19. What Appears Partially Implemented

- Session-aware RAG: mostly present, but duplicated and not covered by tests.
- File processing: supports many file types but lacks structured citations and robust OCR/table status stages.
- PII masking: patterns exist but metadata/audit/chunk/answer masking is incomplete.
- Audit trail: audit/security logs exist, but no full evidence trail.
- RBAC: role strings and admin gates exist, but no persisted granular permissions.
- Migrations: ad-hoc script exists, but no robust migration framework.
- Upload progress: backend status fields and frontend polling exist, but status vocabulary is narrower than target.

## 20. What Appears Broken

- Backend tests fail on Windows due `/tmp/uploads` import-time directory creation.
- Frontend lint script references missing `eslint`.
- Frontend test script missing.
- Git repo has no commits; all files are untracked.
- Local Docker Compose project is not running.
- Locked pytest cache directories exist under `backend/pytest-cache-files-*` and cause access-denied noise in recursive scans.
- `/api/documents` staff filter likely hides session uploads with `ready` status.
- Audit metadata can store raw PII.
- Session history pagination uses `offset`, backend expects `skip`.

## 21. Feature Status Table

| Area | Current Status | Files Found | Problem | Recommended Fix |
|---|---|---|---|---|
| Git/release state | partially working | `.git` | New repo with no commits; all files untracked | Add `.gitignore`, stage source only, make initial commit after audit/fix |
| Frontend framework | working | `frontend/package.json`, `frontend/src` | Build works; lint/test missing | Add ESLint dependency/config or remove lint script; add test runner if needed |
| Backend framework | partially working | `backend/app/main.py`, `backend/requirements.txt` | Tests fail on Windows import due `/tmp` path | Move upload dir creation into startup/request and use configurable temp path |
| Docker setup | working | `docker-compose.yml`, Dockerfiles | Local stack not running; obsolete compose version warning | Keep compose, optionally remove `version`; run only when needed |
| DB/migrations | partially working | `db/session.py`, `db/migrate_chat_ux.py` | SQLModel create_all plus ad-hoc migration; no Alembic | Make migration idempotent/transaction-safe or introduce Alembic later |
| Chat sessions | partially working | `models/chat.py`, `api/chat.py`, `ChatAssistant.jsx` | Missing target fields; reload depends on document list behavior | Fix document listing for session uploads; add missing fields only as needed |
| Chat messages | partially working | `models/chat.py`, `schemas/chat.py` | No attachments_json, PII metadata, masking mode | Add schema/model fields in targeted migration after core bug fixed |
| Chat upload binding | partially working | `api/chat.py` | Upload attaches session IDs; background DB session fragility remains | Use background task that opens its own DB session by document ID |
| Active document restore | partially working | `ChatAssistant.jsx`, `schemas/chat.py`, `api/documents.py` | Staff users may not see `ready` session uploads from `/documents` | Change `/documents` read filter to include own session uploads or add session-doc endpoint |
| RAG priority | partially working | `rag_service.py`, `qdrant_service.py`, `api/chat.py` | Session-first exists; no selected docs tier; duplicate logic | Centralize retrieval in service and add tests for session wins/global fallback |
| Query rewrite | partially working | `query_rewrite_service.py` | Does not accept active docs/session summary | Extend signature and use active doc names/summaries internally |
| Context builder | missing | none found | Prompt assembly is inline and duplicated | Add `context_builder_service.py` after core session bug is locked |
| LLM integration | partially working | `llm_service.py`, `api/chat.py` | Streaming bypasses LLM service; no generation run tracking | Refactor later; do not block core session fix |
| Streaming UX | working | `ChatAssistant.jsx`, `api/chat.py` | Backend cancellation status not persisted | Add generation_runs later |
| File preview/progress | partially working | `FilePreviewCard.jsx`, `documents.py` | Polls full `/documents`; no SSE use in chat card | Keep polling for now; fix backend list semantics first |
| Source cards | partially working | `SourceCards.jsx`, inline source chips | Limited fields; no source hash/scope/file type | Expand source payload after RAG tests |
| Document processing | partially working | `ingestion_service.py` | No structured page/sheet/slide citations; no PII masking on chunks | Add metadata fields and masking incrementally |
| PII masking | partially working | `guardrail_service.py`, `chat.py`, `audit_service.py` | Raw audit metadata possible; no structured PII result | Add PII result object and sanitize audit metadata |
| Audit logs | partially working | `audit_service.py`, `api/audit.py`, `models/audit.py` | Raw metadata; no evidence trail | Sanitize now, evidence trail later |
| Roles/permissions | partially working | `api/users.py`, `pages/Users.jsx`, `deps.py` | String roles only; UI permissions not persisted | Do not add roles table now; fix access checks for documents |
| Analytics | working | `api/analytics.py`, `pages/Analytics.jsx` | Some values are static defaults | Accept for now; not priority |
| Admin/security pages | working | `pages/AdminSecurity.jsx`, `pages/Settings.jsx` | Mostly UI-level controls | Defer until chat document context is reliable |

## 22. Recommended Next Safe Step

Do not start with dashboards or UI polish.

Next safe development step:

1. Fix the backend test/import blocker by making upload directories configurable and not created at import time.
2. Add service-level tests for session-aware document retrieval and active document restore behavior.
3. Fix `/api/documents` so users can reload their own `session_upload` documents with statuses like `ready`, while still preventing cross-session and cross-bank leakage.
4. Sanitize chat audit metadata so raw user PII is not stored.
5. Centralize session-aware retrieval so streaming and non-streaming chat use the same tested path.

Highest priority bug to verify after these fixes:

Uploaded file in Session A must remain active after refresh and must win over global knowledge for follow-up questions, while Session B and Bank B cannot retrieve it.

## 23. Post-Audit Fixes Applied

Date: 2026-04-28

| Area | Current Status | Files Found | Problem | Recommended Fix |
|---|---|---|---|---|
| Backend upload paths | working | `backend/app/core/config.py`, `backend/app/api/documents.py`, `backend/app/api/chat.py` | Import-time `/tmp/uploads` creation broke Windows tests and local startup | Added configurable `UPLOAD_DIR` and `CHAT_UPLOAD_DIR`; create directories inside request handlers instead of module import |
| Active document restore | working | `backend/app/api/documents.py`, `frontend/src/pages/ChatAssistant.jsx` | Staff users could not reload their own `ready` session-uploaded documents through `/api/documents` | Document list now includes approved global docs plus the current user's non-disabled `session_upload` docs |
| RAG priority coverage | working | `backend/app/services/rag_service.py`, `backend/tests/test_session_documents.py` | Session-first retrieval existed but was untested | Added service-level test proving active session uploads are searched before global knowledge |
| Session upload reload coverage | working | `backend/app/api/documents.py`, `backend/tests/test_session_documents.py` | Refresh/reopen could lose visible active uploaded file cards | Added API test proving a staff user's own ready session upload is returned while draft global docs stay hidden |
| Audit PII safety | partially working | `backend/app/api/chat.py`, `backend/app/services/guardrail_service.py` | Chat and security-event metadata could store raw user queries containing PII | Chat audit logs now store the masked message; prompt-injection security metadata stores masked query plus PII flags |

## 24. Post-Audit Verification

| Command | Status | Result |
|---|---|---|
| `python -m py_compile app\api\chat.py app\api\documents.py app\services\rag_service.py app\services\guardrail_service.py` | working | Compiles successfully |
| `python -m pytest tests\test_main.py tests\test_session_documents.py -p no:cacheprovider` | working | 7 passed, 53 warnings |
| `npm run build` in `frontend` | working | Vite production build succeeds |

Remaining verification gaps:

- Frontend still has no `npm test` script.
- Frontend lint still fails until `eslint` is installed/configured or the script is corrected.
- Full browser acceptance test with a real uploaded PDF still needs to be run against the live stack.
- Full remote rebuild/runtime verification should be repeated after pushing these fixes.
