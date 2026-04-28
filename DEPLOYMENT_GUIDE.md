# BankAi Enterprise Deployment Guide

**Version:** 1.0  
**Date:** April 28, 2026  
**For:** On-Premises Data Center Deployment

---

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Installation Steps](#installation-steps)
4. [Post-Deployment Configuration](#post-deployment-configuration)
5. [Operations & Maintenance](#operations--maintenance)
6. [Troubleshooting](#troubleshooting)
7. [Security Hardening](#security-hardening)
8. [Backup & Recovery](#backup--recovery)

---

## System Requirements

### Hardware Specifications (Minimum)

| Component | Requirement |
|-----------|-------------|
| CPU | 8+ cores (16+ recommended) |
| RAM | 32 GB (64 GB recommended) |
| Storage | 500 GB SSD (1TB+ for document storage) |
| Network | 1 Gbps connectivity |
| GPU | Optional (NVIDIA for faster LLM inference) |

### Software Requirements

| Component | Version |
|-----------|---------|
| OS | Ubuntu 22.04 LTS or RHEL 8+ |
| Docker | 20.10+ |
| Docker Compose | 2.0+ |
| Git | 2.30+ |

### Network Requirements

- **Outbound:** None required (fully air-gapped capable)
- **Inbound:** HTTP/HTTPS ports (80, 443) for UI access
- **Internal:** Docker network for service communication
- **Firewall:** Allow traffic on ports 80, 443 (and 3000 for internal testing)

---

## Pre-Deployment Checklist

### 1. Server Preparation

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### 2. System Configuration

```bash
# Create application user
sudo useradd -m -s /bin/bash bankai
sudo usermod -aG docker bankai

# Create data directories
sudo mkdir -p /data/bankai
sudo chown -R bankai:bankai /data/bankai

# Set appropriate permissions
sudo chmod 755 /data/bankai
```

### 3. Network Configuration

- Ensure DNS is configured
- Set static IP if required
- Configure firewall rules for ports 80, 443
- Set up SSL/TLS certificates (recommended)

---

## Installation Steps

### Step 1: Deploy Application Stack

```bash
# Navigate to deployment directory
cd /data/bankai

# Create environment file
cp .env.example .env
nano .env  # Edit with your configuration

# Build Docker images
docker compose build

# Start services
docker compose up -d

# Verify all services are running
docker compose ps
```

### Step 2: Initialize Database

```bash
# Run database migrations
docker compose exec backend alembic upgrade head

# Create initial super admin user
docker compose exec backend python -c "
from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash

db = SessionLocal()
admin = User(
    email='admin@bankai.io',
    name='Admin',
    password_hash=get_password_hash('ChangeMe123!'),
    is_active=True,
    is_superuser=True
)
db.add(admin)
db.commit()
print('Admin user created successfully')
"
```

### Step 3: Pre-Load LLM Models

```bash
# Pull required Ollama models
docker compose exec ollama ollama pull gemma4
docker compose exec ollama ollama pull embedding-model

# Verify models are loaded
docker compose exec ollama ollama list
```

### Step 4: Verify Installation

```bash
# Check all services health
docker compose ps

# Test frontend accessibility
curl http://localhost/

# Test API health
curl http://localhost/api/health

# Check logs for errors
docker compose logs --tail=50
```

---

## Post-Deployment Configuration

### 1. Update Admin Credentials

**CRITICAL:** Change default admin password immediately!

```bash
# Login to UI and change password via Settings
# OR via API:
curl -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@bankai.io&password=ChangeMe123!"
```

### 2. Configure SSL/TLS Certificates

```bash
# Copy your SSL certificates to the server
sudo cp /path/to/cert.crt /data/bankai/certs/
sudo cp /path/to/key.key /data/bankai/certs/

# Update nginx.conf with SSL configuration
sudo nano /data/bankai/nginx.conf
```

**Example SSL configuration:**
```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /etc/nginx/certs/cert.crt;
    ssl_certificate_key /etc/nginx/certs/key.key;
    # ... rest of configuration
}
```

### 3. Configure Storage (MinIO)

```bash
# Access MinIO console
# URL: http://localhost:9001
# Username: admin
# Password: password (from .env)

# Create buckets:
# - bank-documents (for uploaded files)
# - backups (for backup archives)
```

### 4. Configure Monitoring & Logging

```bash
# Enable Docker logging
docker compose logs -f backend

# Set up log rotation
sudo tee /etc/docker/daemon.json > /dev/null <<EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF

sudo systemctl restart docker
```

---

## Operations & Maintenance

### Daily Operations

```bash
# Start services
docker compose up -d

# Check service health
docker compose ps
docker compose exec backend curl http://localhost:8000/health

# View recent logs
docker compose logs --tail=100 backend
```

### Regular Maintenance

```bash
# Weekly: Update base images
docker compose pull
docker compose up -d --build

# Monthly: Database maintenance
docker compose exec db pg_dump -U postgres bankai > backup_$(date +%Y%m%d).sql

# Quarterly: Clean up unused Docker resources
docker system prune -a
```

### Adding New Users

```bash
# Via UI: Admin Panel → Users → Add User
# OR via API:
curl -X POST http://localhost/api/users \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@institution.com",
    "name": "User Name",
    "password": "InitialPassword123!",
    "institution_id": 1
  }'
```

---

## Troubleshooting

### Service Won't Start

```bash
# Check logs
docker compose logs backend

# Common issues:
# 1. Port already in use
sudo lsof -i :80,443,8000,5432

# 2. Insufficient permissions
sudo chown -R 1000:1000 /data/bankai

# 3. Docker daemon not running
sudo systemctl restart docker
```

### Database Connection Issues

```bash
# Verify database is running
docker compose ps db

# Check database logs
docker compose logs db

# Connect to database directly
docker compose exec db psql -U postgres -d bankai
```

### File Upload Failures

```bash
# Check MinIO status
docker compose exec minio mc admin info minio

# Verify bucket exists
docker compose exec minio mc ls minio/bank-documents

# Check disk space
df -h /data/bankai
```

### LLM/Ollama Issues

```bash
# Check Ollama status
docker compose exec ollama ollama list

# Verify model is loaded
docker compose logs ollama | grep "pulling"

# Restart Ollama service
docker compose restart ollama
```

---

## Security Hardening

### 1. Network Security

```bash
# Configure UFW firewall (if enabled)
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw deny 3000/tcp  # Block direct frontend access
sudo ufw deny 8000/tcp  # Block direct API access
sudo ufw enable
```

### 2. Access Control

```bash
# Change default credentials in .env
DATABASE_PASSWORD=SecurePassword123!
MINIO_ROOT_PASSWORD=SecurePassword456!
JWT_SECRET=VeryLongSecureRandomString789...

# Restart services to apply
docker compose down
docker compose up -d
```

### 3. Enable HTTPS

```bash
# Generate self-signed certificate (for testing)
openssl req -x509 -newkey rsa:4096 -keyout key.key -out cert.crt -days 365 -nodes

# Or use Let's Encrypt with Certbot
sudo apt install certbot python3-certbot-nginx
sudo certbot certonly --standalone -d yourdomain.com
```

### 4. Database Security

```bash
# Change PostgreSQL admin password
docker compose exec db psql -U postgres
> ALTER USER postgres WITH PASSWORD 'NewSecurePassword';
> \q

# Restrict database network access
# Only allow connections from localhost in pg_hba.conf
```

### 5. Audit Logging

All access is logged to the database:
- User login/logout
- Document uploads
- API queries
- Administrative actions

View audit logs:
```bash
# Via UI: Audit Log page
# Via API:
curl -H "Authorization: Bearer TOKEN" \
  http://localhost/api/audit-logs?limit=100
```

---

## Backup & Recovery

### Automated Backups

```bash
# Create backup script
cat > /usr/local/bin/bankai-backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/data/bankai/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
docker compose -f /data/bankai/docker-compose.yml exec -T db \
  pg_dump -U postgres bankai > $BACKUP_DIR/db_$TIMESTAMP.sql

# Backup documents
tar -czf $BACKUP_DIR/documents_$TIMESTAMP.tar.gz \
  /data/bankai/uploads/

# Backup configuration
tar -czf $BACKUP_DIR/config_$TIMESTAMP.tar.gz \
  /data/bankai/.env \
  /data/bankai/nginx.conf

# Cleanup old backups (keep last 30 days)
find $BACKUP_DIR -mtime +30 -delete

echo "Backup completed: $TIMESTAMP"
EOF

chmod +x /usr/local/bin/bankai-backup.sh

# Schedule daily backups
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/bankai-backup.sh
```

### Manual Restore

```bash
# Stop services
docker compose down

# Restore database
docker compose up -d db
sleep 10
docker compose exec -T db psql -U postgres < backup_20260428.sql

# Restore documents
tar -xzf documents_20260428.tar.gz -C /

# Restore configuration
tar -xzf config_20260428.tar.gz -C /

# Start all services
docker compose up -d
```

### Disaster Recovery

```bash
# Full system restore from backup
1. Set up new server with same OS and Docker
2. Copy backups to /data/bankai/backups/
3. Run restore scripts above
4. Verify all services are running
5. Test user login and data access
6. Update DNS/load balancer to point to new server
```

---

## Performance Tuning

### Database Optimization

```bash
# Connect to database
docker compose exec db psql -U postgres -d bankai

# View table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
FROM pg_tables 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

# Create indexes for common queries
CREATE INDEX idx_documents_session ON documents(session_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
```

### Memory Management

```bash
# Monitor container memory usage
docker stats

# Adjust memory limits in docker-compose.yml
services:
  backend:
    mem_limit: 4g
    memswap_limit: 4g
  db:
    mem_limit: 8g
```

### Document Processing

```bash
# Increase worker processes for faster document processing
# Edit backend environment variables:
CELERY_WORKERS=4  # Increase for more parallel processing
```

---

## Support & Documentation

For additional support:
- **Documentation:** `/data/bankai/docs/`
- **Issue Tracker:** GitHub Issues
- **Security:** Report to security@bankai.io

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-04-28 | Initial release for enterprise deployment |

---

**Last Updated:** April 28, 2026  
**Status:** Production Ready
