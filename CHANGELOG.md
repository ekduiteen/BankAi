# Changelog

## 2026-05-07

- Fixed the chat shell for mobile by replacing the always-pinned sidebar with a responsive drawer and mobile-safe top bar.
- Updated chat controls to match the deployed clean Gemma 4 vLLM runtime: fast 4B and analyst/report 26B.
- Allowed ready uploaded documents to remain queryable while unrelated session uploads are still processing.
- Tightened RAG retrieval so uploaded-document questions do not automatically cite unrelated global documents.
- Preserved real message timestamps and fixed stopped-generation partial response handling.
- Replaced overclaimed "Encrypted End-to-End" UI copy with "Encrypted in transit".
- Switched the frontend icon font to Material Symbols Outlined.
- Replaced the default Vite favicon reference with an inline BankAi favicon.
- Updated Playwright config and chat e2e tests to use env-driven base URL and credentials with installed Chrome.

Verification:

- `npm run lint`
- `npm run build`
- `python -m py_compile backend\app\api\chat.py backend\app\services\rag_service.py`
- Local Chrome smoke screenshots for desktop and mobile chat layouts.

## 2026-04-28

- Completed BankAi recovery audit and documented current frontend, backend, database, Docker, and test state in `RESUME_REPORT.md`.
- Fixed local backend import/test failure by moving upload directory creation out of module import and into request-time helpers.
- Added configurable upload paths through `UPLOAD_DIR` and `CHAT_UPLOAD_DIR`, defaulting to the OS temp directory for local development.
- Fixed active session upload restoration for staff users by allowing `/api/documents` to return the current user's non-disabled `session_upload` documents alongside approved global documents.
- Sanitized chat audit metadata and prompt-injection security metadata so masked queries are stored instead of raw user input.
- Added focused backend tests for session upload reload behavior and session-first RAG priority over global knowledge.

Verification:

- `python -m py_compile app\api\chat.py app\api\documents.py app\services\rag_service.py app\services\guardrail_service.py`
- `python -m pytest tests\test_main.py tests\test_session_documents.py -p no:cacheprovider`
- `npm run build`
