# Deployment Guide

## MVP Deployment via Docker Compose

The simplest way to deploy the MVP is using the provided Docker Compose configuration.

1. Provision a secure Linux VM (Ubuntu 22.04 LTS recommended) with at least 16GB RAM (32GB+ if running local LLMs).
2. Install Docker and Docker Compose.
3. Clone the repository and configure `.env` with strong passwords and secrets.
4. Run `docker-compose up -d --build`.
5. Since the MVP uses Ollama for local LLM inference, you need to pull the `llama3` model inside the container:
   ```bash
   docker exec -it bankai-ollama ollama run llama3
   ```
   *(You can exit the prompt inside the container once it's downloaded, or it will download automatically and wait for input).*

## Production Considerations

For a production banking environment, consider the following:
- **Kubernetes:** Migrate from Docker Compose to Helm charts on a managed Kubernetes cluster (EKS, AKS, GKE) or on-premise OpenShift.
- **Managed Databases:** Use managed PostgreSQL (e.g., RDS) rather than a Docker container.
- **Network Security:** Place the entire system behind a WAF (Web Application Firewall) and use an API Gateway.
- **LLM Hosting:** Depending on compliance, either host a robust private instance of vLLM / TGI on GPU instances or use a secure, enterprise-contracted API (Azure OpenAI with strict data isolation).
