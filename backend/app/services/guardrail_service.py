import re
import unicodedata
from sqlmodel import Session
from ..services.audit_service import log_security_event

# Expanded injection pattern list — covers Unicode-normalized homoglyph attacks
_INJECTION_PHRASES = [
    "ignore previous instructions", "ignore all instructions",
    "disregard previous instructions", "disregard all instructions",
    "forget previous instructions", "forget all instructions",
    "override instructions", "override your guidelines",
    "new instructions",
    "system prompt", "reveal your prompt", "show your instructions",
    "what are your instructions", "print your system",
    "you are now", "act as", "pretend you are", "pretend to be",
    "roleplay as", "you are a", "from now on you", "your new role",
    "jailbreak", "dan mode", "developer mode", "unrestricted mode",
    "no restrictions", "disable safety", "bypass safety", "ignore safety",
    "do anything now",
    "repeat after me", "echo back",
    "output everything above", "print everything above",
]


def detect_prompt_injection(query: str, db: Session, user_id: int, bank_id: int) -> bool:
    normalized = unicodedata.normalize("NFKC", query).lower()
    for phrase in _INJECTION_PHRASES:
        if phrase in normalized:
            masked_query = detect_and_mask_pii(query)
            log_security_event(
                db=db,
                event_type="prompt_injection_attempt",
                severity="high",
                description=f"Potential prompt injection detected: '{phrase}'",
                user_id=user_id,
                bank_id=bank_id,
                metadata={
                    "query": masked_query,
                    "matched_phrase": phrase,
                    "pii_detected": masked_query != query,
                    "masking_mode": "redact",
                }
            )
            return True
    return False


_PII_PATTERNS = [
    (r'\b\d{3}-\d{2}-\d{4}\b',                                          '[REDACTED SSN]'),
    (r'\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b',                       '[REDACTED CC]'),
    (r'\b9[6-9]\d{8}\b',                                                 '[REDACTED PHONE]'),
    (r'\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b',          '[REDACTED EMAIL]'),
    (r'\b\d{16}\b',                                                       '[REDACTED ACCOUNT]'),
    (r'\b[A-Z]{2,4}\d{8,16}\b',                                           '[REDACTED ACCOUNT]'),
    (r'\b\d{2}-\d{2}-\d{2}-\d{5}\b',                                    '[REDACTED CITIZENSHIP]'),
    (r'\bPa\d{7}\b',                                                     '[REDACTED PASSPORT]'),
    (r'\b[A-Z]{1,2}\d{6,8}\b',                                           '[REDACTED PASSPORT]'),
    (r'\b(?:PAN|VAT|pan|vat)[\s:]*\d{9}\b',                             '[REDACTED PAN]'),
    (r'\b\d{9}\b',                                                       '[REDACTED PAN]'),
    (r'(?i)\b(?:dob|date of birth|born on|born|birthday)[\s:=]*\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}\b', 'DOB: [REDACTED]'),
]


def detect_and_mask_pii(query: str) -> str:
    masked = query
    for pattern, replacement in _PII_PATTERNS:
        masked = re.sub(pattern, replacement, masked)
    return masked
