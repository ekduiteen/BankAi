# BankAi: Deployment Guide

This guide covers the steps required to deploy BankAi in a production or staging environment.

## 1. Prerequisites
*   **Operating System:** Ubuntu 22.04 LTS (recommended) or any system with Docker support.
*   **Hardware:** 
    *   Minimum 16GB RAM (32GB recommended for LLM inference).
    *   NVIDIA GPU with 8GB+ VRAM (strongly recommended for Ollama performance).
*   **Software:** Docker 24.0+, Docker Compose 2.20+.

## 2. Environment Configuration

Copy the example environment file and configure the secrets:
```bash
cp .env.example .env
```

### Essential Variables:
| Variable | Description | Recommended |
| :--- | :--- | :--- |
| `JWT_SECRET` | Secret key for auth tokens | Generate a random 64-char string |
| `POSTGRES_PASSWORD` | Database password | Secure random string |
| `LLM_API_BASE` | URL for Ollama | `http://ollama:11434` (Internal Docker) |
| `OLLAMA_KEEP_ALIVE` | How long to keep model in RAM | `-1` (Never unload) |

---

## 3. Deployment Steps

### Step 1: Clone and Build
```bash
git clone <repo-url>
cd BankAi
docker-compose up -d --build
```

### Step 2: Database Migration
For new features (Chat UX, SSE, Suggestions), you must run the migration script to update the PostgreSQL schema:
```bash
docker exec bankai-backend python app/db/migrate_chat_ux.py
```

### Step 3: Verify Services
Check the health of the containers:
```bash
docker-compose ps
```
*   `bankai-backend`: Should be listening on port 8000.
*   `bankai-frontend`: Should be listening on port 3000.
*   `bankai-qdrant`: Should be listening on 6333.
*   `bankai-ollama`: Ensure the model (e.g., `mistral` or `llama2`) is pulled and ready.

---

## 4. Production Hardening

### SSL/TLS Termination
It is strongly recommended to place BankAi behind a reverse proxy like **Nginx** or **Traefik** to handle SSL certificates.

Example Nginx config:
```nginx
server {
    listen 443 ssl;
    server_name bankai.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
    }
}
```

### Security Considerations
1.  **VPC Isolation:** Ensure the database and vector engine are not accessible from the public internet.
2.  **Firewall:** Only allow traffic on port 443 (HTTPS) and port 22 (SSH).
3.  **MinIO:** Configure MinIO with a private bucket and rotate access keys regularly.
