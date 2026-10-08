from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from qdrant_client import QdrantClient
from sqlalchemy import text

from app.auth.routes import router as auth_router
from app.core.config import settings
from app.database import engine

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1")


@app.get("/")
def root():
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
    }


@app.get("/api/v1/health")
def health():
    return {
        "status": "ok",
        "service": "api",
    }


@app.get("/api/v1/health/db")
def database_health():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "ok",
            "database": "connected",
        }
    except Exception:
        return {
            "status": "error",
            "database": "disconnected",
        }


@app.get("/api/v1/health/qdrant")
def qdrant_health():
    try:
        client = QdrantClient(url=settings.qdrant_url)
        client.get_collections()

        return {
            "status": "ok",
            "qdrant": "connected",
        }
    except Exception:
        return {
            "status": "error",
            "qdrant": "disconnected",
        }
