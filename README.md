# BankAi: Private Banking AI Assistant

A secure, high-fidelity, enterprise-grade RAG-based AI assistant designed specifically for banks and financial institutions. BankAi provides a hardened infrastructure where staff can securely upload internal documents, perform isolated session-bound analysis, and interact with private LLMs.

## 🚀 Key Features

### 🏛️ Enterprise Chat Experience
*   **Asynchronous Document Ingestion:** Upload PDF, DOCX, XLSX, and images without blocking the chat. Processing happens in the background.
*   **Real-time Progress Tracking:** Visual file cards with animated progress bars showing state (Extracting Text → Embedding → Ready).
*   **Conversational Memory:** 10-message sliding window memory ensuring contextual follow-up awareness.
*   **Stop & Regenerate:** Full control over generation with the ability to stop long-running streams or regenerate previous responses.

### 🔍 Advanced RAG & Compliance
*   **Session-Bound Isolation:** Secure context routing ensuring that documents uploaded in one chat session are never leaked to another.
*   **Source Citations:** Transparent assistant responses with clickable cards showing the exact source document and page number.
*   **Predictive Follow-ups:** Dynamically generated follow-up questions at the end of every response to guide user investigation.
*   **Audit Logging:** Comprehensive logging of all queries, file uploads, and AI responses for regulatory compliance.

### 🛡️ Security & Privacy
*   **Data Sovereignty:** Fully air-gapped capable; runs with local vLLM model servers and self-hosted vector databases (Qdrant).
*   **PII Masking:** Automatic detection and masking of sensitive Personally Identifiable Information (PII) before LLM processing.
*   **RBAC:** Role-Based Access Control (Super Admin, Bank Admin, Staff) with bank-level data partitioning.

---

## 🛠️ Tech Stack

*   **Frontend:** React (Vite), Tailwind CSS, Lucide Icons.
*   **Backend:** FastAPI (Python 3.10), SQLModel, PostgreSQL 15.
*   **Vector Engine:** Qdrant (Semantic Search & Session Filtering).
*   **LLM Orchestration:** vLLM with Redis-backed admission control for private local inference.
*   **Storage:** MinIO (S3-compatible persistent storage).
*   **Streaming:** Server-Sent Events (SSE) for both generation and document status tracking.

---

## 🏗️ Architecture

BankAi uses a decoupled **Worker-Observer** architecture for document processing:
1.  **Ingestion:** Files are uploaded to an async worker that handles OCR, chunking, and embedding.
2.  **Streaming:** The UI subscribes to an SSE status stream to update progress cards in real-time.
3.  **Retrieval:** Context is retrieved from Qdrant using a session-aware metadata filter.
4.  **Admission Control:** Redis coordinates per-model and per-user concurrency so GPU memory is protected under load.
5.  **Generation:** Response is streamed token-by-token from the local vLLM runtime.

---

## 🚀 Deployment

### Prerequisites
*   Docker and Docker Compose.
*   NVIDIA container runtime for GPU-backed vLLM services.
*   Local Gemma model files mounted on the inference host.

### Quick Start

1.  **Clone the Repository:**
    ```bash
    git clone <repo-url>
    cd BankAi
    ```

2.  **Environment Setup:**
    ```bash
    cp .env.example .env
    # Configure secrets, public origin, model paths, and TLS settings for your host.
    ```

3.  **Run with Docker Compose:**
    ```bash
    docker-compose up -d --build
    ```

4.  **Database Migration:**
    If you are updating from a previous version, run the migration script:
    ```bash
    docker exec bankai-backend python app/db/migrate_chat_ux.py
    ```

### Access Points
*   **Frontend UI:** `http://localhost:3000`
*   **API Documentation:** `http://localhost:8000/docs`
*   **MinIO Console:** `http://localhost:9001`

### Current Production Access

*   **Public UI:** `https://ai.silverlining.com.np`
*   **Fast model:** clean Gemma 4 4B served by vLLM on GPU 0.
*   **Deep model:** clean Gemma 4 26B 4-bit served by vLLM on GPU 1.
*   **Queueing:** Redis limits concurrent requests per model and per user.

---

## ⚖️ Disclaimer
This system is designed for private banking infrastructure. Production deployments should enforce TLS/SSL, strict network isolation (VPC), and integrate with enterprise IAM providers (OIDC/SAML).
