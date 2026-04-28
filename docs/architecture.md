# Architecture

The Bank's Own LLM architecture is designed around isolation, security, and the Retrieval-Augmented Generation (RAG) pattern.

## Components
1. **Frontend (React + Vite):** A static SPA served by Nginx. Communicates exclusively with the Backend API.
2. **Backend (FastAPI):** The core orchestration layer. Handles Auth, RBAC, document ingestion orchestration, and RAG prompt construction.
3. **PostgreSQL:** Stores relational metadata: Users, Banks, Document Metadata, Chat History, and Audit Logs.
4. **MinIO:** S3-compatible object storage for storing raw uploaded documents securely.
5. **Qdrant:** Vector database storing text chunk embeddings with payload metadata (bank_id, document_id) for precise, isolated retrieval.
6. **LLM Engine:** Configurable engine (Ollama for local MVP, OpenAI/vLLM compatible API for production).

## Data Flow (Chat)
1. User submits query.
2. Backend authenticates user and determines `bank_id` and role permissions.
3. Query is embedded using Sentence-Transformers.
4. Qdrant is queried with the embedding, heavily filtered by `bank_id`.
5. Backend verifies document access levels against the user's role.
6. Context is constructed and sent to the LLM.
7. LLM response and sources are saved to DB and returned to the user.
