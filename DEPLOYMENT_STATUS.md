# BankAi Public Deployment - Live ✅

**Date:** April 28, 2026  
**Status:** Ready for Testing

## Public Access URL

```
http://202.51.2.50
```

**No tunneling required. Share this URL with testers.**

---

## Architecture

```
Users (Internet)
    ↓
[nginx reverse proxy on port 80]
    ↓
    ├→ Frontend (port 3000 internally)
    └→ Backend API (port 8000 internally)
        ├→ PostgreSQL (5432)
        ├→ Qdrant Vector DB (6333)
        ├→ MinIO Storage (9000)
        └→ Ollama LLM (11434)
```

---

## Running Services

| Service | Container | Status | Internal Port | External Port |
|---------|-----------|--------|---------------|---------------|
| **nginx** | bankai-nginx | ✅ Running | 80 | 80 |
| **frontend** | bankai-frontend | ✅ Running | 3000 | - |
| **backend** | bankai-backend | ✅ Running | 8000 | 8000 |
| **PostgreSQL** | bankai-db | ✅ Running | 5432 | 5432 |
| **Qdrant** | bankai-qdrant | ✅ Running | 6333 | 6333 |
| **MinIO** | bankai-minio | ✅ Running | 9000-9001 | 9000-9001 |
| **Ollama** | bankai-ollama | ✅ Running | 11434 | 11434 |

---

## Recent Fixes Deployed

✅ **File Upload**: FormData Content-Type header handling fixed  
✅ **Session Auto-creation**: Files uploaded without session now create session automatically  
✅ **Error Messages**: Backend validation errors now displayed to user  
✅ **Language Toggle**: Nepali/English toggle now responds to clicks  
✅ **Error Logging**: Upload errors logged to browser console for debugging  

---

## Testing Credentials

**Admin Account:**
- Email: `admin@bankai.io`
- Password: `admin123`

---

## How Testers Access

1. Open browser
2. Visit: **http://202.51.2.50**
3. Login with credentials above
4. Test file uploads, language toggle, chat features

No VPN, SSH tunneling, or port mapping needed.

---

## Key Features

- **Secure document analysis** with end-to-end encryption
- **Multi-language UI** (English / Nepali)
- **File upload with session auto-creation**
- **Vector-based document search** with Qdrant
- **LLM-powered analysis** with Ollama (gemma4)
- **Audit logging** of all access
- **S3-compatible storage** with MinIO

---

## Deployment Commands (Reference)

```bash
# View all running containers
docker compose ps

# View nginx logs
docker compose logs -f nginx

# Restart nginx
docker compose restart nginx

# Rebuild and restart all services
docker compose up -d --build
```

---

## Remote Server Details

- **IP**: 202.51.2.50
- **SSH Port**: 41447
- **Deployment Path**: /data/bankai
- **User**: ekduiteen

---

**Next Steps:**
- Share access URL with testers
- Monitor for issues in browser console
- Collect feedback on file upload and language features
- Check browser dev tools (F12 → Console) for any errors

