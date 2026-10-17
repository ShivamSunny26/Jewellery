from datetime import datetime, timezone


def utcnow() -> datetime:
    """Naive UTC timestamp — matching how the models store DateTime columns."""
    return datetime.now(timezone.utc).replace(tzinfo=None)
