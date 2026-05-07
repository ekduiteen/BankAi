#!/usr/bin/env bash
# Generate a self-signed TLS certificate for local/dev use.
# For production, replace these files with certs from Let's Encrypt or your CA.
set -euo pipefail

CERT_DIR="$(cd "$(dirname "$0")" && pwd)"
COMMON_NAME="${SSL_COMMON_NAME:-202.51.2.50}"
ALT_NAMES="${SSL_ALT_NAMES:-DNS:localhost,IP:127.0.0.1,IP:202.51.2.50}"

openssl req -x509 -nodes -days 3650 \
  -newkey rsa:2048 \
  -keyout "$CERT_DIR/server.key" \
  -out "$CERT_DIR/server.crt" \
  -subj "/C=US/ST=Local/L=Local/O=BankAi/CN=$COMMON_NAME" \
  -addext "subjectAltName=$ALT_NAMES"

echo "Self-signed certificate written to $CERT_DIR/server.crt and $CERT_DIR/server.key"
echo "NOTE: Replace with a CA-signed certificate before going to production."
