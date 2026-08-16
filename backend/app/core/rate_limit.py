import time
from collections import defaultdict, deque
from typing import Deque

from fastapi import HTTPException, Request, status


class SlidingWindowLimiter:
    def __init__(self):
        self._hits: dict[str, Deque[float]] = defaultdict(deque)

    def check(self, key: str, limit: int, window_seconds: int):
        now = time.time()
        q = self._hits[key]
        while q and now - q[0] > window_seconds:
            q.popleft()
        if len(q) >= limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please try again later.",
            )
        q.append(now)


limiter = SlidingWindowLimiter()
