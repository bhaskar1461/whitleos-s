from fastapi import FastAPI
from api.auth import router as auth_router
from dotenv import load_dotenv
import os
from fastapi_limiter import FastAPILimiter
from redis.asyncio import Redis
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend

load_dotenv()

app = FastAPI(title="Backend API")

@app.on_event("startup")
async def startup():
    redis_host = os.getenv("REDIS_HOST", "redis")
    redis_port = int(os.getenv("REDIS_PORT", 6379))
    redis_db = int(os.getenv("REDIS_DB", 0))
    redis = Redis(host=redis_host, port=redis_port, db=redis_db, encoding="utf-8", decode_responses=True)
    await FastAPILimiter.init(redis)
    FastAPICache.init(RedisBackend(redis), prefix="fastapi-cache")

app.include_router(auth_router, prefix="/auth", tags=["auth"])

@app.get("/")
def root():
    return {"status": "ok"}
