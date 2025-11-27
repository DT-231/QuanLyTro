"""FastAPI application entry point.

Khởi tạo và cấu hình FastAPI application cho hệ thống quản lý phòng trọ.
"""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.api import api_router
from app.core.settings import settings

# Tạo FastAPI application instance
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API cho hệ thống quản lý phòng trọ",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Cấu hình CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Đăng ký API router
app.include_router(api_router, prefix="/api/v1")


@app.get("/", tags=["Root"])
def read_root():
    """Health check endpoint."""
    return {
        "message": "Welcome to Room Management API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def health_check():
    """Health check endpoint for monitoring."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
