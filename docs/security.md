# Security Architecture

## Isolation
- **Logical Isolation:** All critical database tables contain a `bank_id`. Qdrant queries strictly enforce `bank_id` filters before retrieval.
- **Physical Isolation (Optional):** The Docker Compose stack can be deployed on a physically isolated server or VPC per bank.

## Authentication & Authorization
- Passwords hashed using bcrypt.
- Stateless JWT authentication.
- Strict Role-Based Access Control (RBAC):
  - `super_admin`: Global system management.
  - `bank_admin`: Bank-level management, document approval.
  - `staff_user`: Query-only, restricted document access.

## RAG Security
- **Prompt Guardrails:** The system prompt strictly instructs the LLM to only use provided context.
- **Source Verification:** Every answer is tied to a specific chunk and document in the Qdrant DB.

## Auditing
- Every API action (upload, approval, query) creates an `AuditLog` entry in the PostgreSQL database.
