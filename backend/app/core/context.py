from contextvars import ContextVar

# Holds the client IP for the current request, set by the IP middleware.
request_ip: ContextVar[str] = ContextVar("request_ip", default="")
