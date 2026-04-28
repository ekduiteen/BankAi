# Changelog

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
