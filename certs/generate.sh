#!/usr/bin/env bash
# Generate a self-signed TLS certificate for local/dev use.
# For production, replace these files with certs from Let's Encrypt or your CA.
set -euo pipefail

CERT_DIR="$(cd "$(dirname "$0")" && pwd)"

openssl req -x509 -nodes -days 3650 \
  -newkey rsa:2048 \
  -keyout "$CERT_DIR/server.key" \
  -out "$CERT_DIR/server.crt" \
  -subj "/C=US/ST=Local/L=Local/O=BankAi/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"

echo "Self-signed certificate written to $CERT_DIR/server.crt and $CERT_DIR/server.key"
echo "NOTE: Replace with a CA-signed certificate before going to production."
