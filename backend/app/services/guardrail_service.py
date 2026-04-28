from sqlmodel import Session
from ..services.audit_service import log_security_event
import re

def detect_prompt_injection(query: str, db: Session, user_id: int, bank_id: int) -> bool:
    """
    Placeholder for Prompt Injection Detection.
    """
    suspicious_phrases = ["ignore previous instructions", "system prompt", "you are now"]
    lower_query = query.lower()
    for phrase in suspicious_phrases:
        if phrase in lower_query:
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
                    "pii_detected": masked_query != query,
                    "masking_mode": "redact",
                }
            )
            return True
    return False

_PII_PATTERNS = [
    (r'\b\d{3}-\d{2}-\d{4}\b',                                          '[REDACTED SSN]'),
    (r'\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b',                       '[REDACTED CC]'),
    # Nepal mobile: starts with 9[6-9] followed by 8 more digits
    (r'\b9[6-9]\d{8}\b',                                                 '[REDACTED PHONE]'),
    # Email addresses
    (r'\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b',          '[REDACTED EMAIL]'),
    # Nepal bank account numbers (typically 16 digits)
    (r'\b\d{16}\b',                                                       '[REDACTED ACCOUNT]'),
    (r'\b[A-Z]{2,4}\d{8,16}\b',                                           '[REDACTED ACCOUNT]'),
    # Nepal citizenship number: xx-xx-xx-xxxxx format
    (r'\b\d{2}-\d{2}-\d{2}-\d{5}\b',                                    '[REDACTED CITIZENSHIP]'),
    # Passport number (Nepali: Pa followed by 7 digits, or generic 1-2 letters + 6-8 digits)
    (r'\bPa\d{7}\b',                                                     '[REDACTED PASSPORT]'),
    (r'\b[A-Z]{1,2}\d{6,8}\b',                                           '[REDACTED PASSPORT]'),
    # PAN/VAT (Nepal): 9 digit numeric
    (r'\b(?:PAN|VAT|pan|vat)[\s:]*\d{9}\b',                             '[REDACTED PAN]'),
    (r'\b\d{9}\b',                                                       '[REDACTED PAN]'),
    # Date of birth labels followed by dates
    (r'(?i)\b(?:dob|date of birth|born on|born|birthday)[\s:=]*\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}\b', 'DOB: [REDACTED]'),
]

def detect_and_mask_pii(query: str) -> str:
    masked = query
    for pattern, replacement in _PII_PATTERNS:
        masked = re.sub(pattern, replacement, masked)
    return masked
