"""Application Settings - Cấu hình ứng dụng từ biến môi trường.

Module này sử dụng pydantic-settings để load và validate
các biến cấu hình từ file .env hoặc biến môi trường hệ thống.

Ưu tiên:
1. Biến môi trường hệ thống (từ Docker/CI)
2. File .env.docker (khi chạy Docker)
3. File .env.development (khi dev local)
"""

from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings
from dotenv import load_dotenv
import os
import logging

# Setup logger để thay thế print statements
logger = logging.getLogger(__name__)

# Xác định đường dẫn tới thư mục backend
current_file = Path(__file__).resolve()
backend_dir = current_file.parent.parent.parent  # backend/

# Load .env files - KHÔNG override biến môi trường đã có (từ Docker)
env_docker_path = backend_dir / ".env.docker"
env_dev_path = backend_dir / ".env.development"

if env_docker_path.exists():
    load_dotenv(env_docker_path, override=False)
    logger.info(f"Loaded env file: {env_docker_path}")
elif env_dev_path.exists():
    load_dotenv(env_dev_path, override=False)
    logger.info(f"Loaded env file: {env_dev_path}")
else:
    logger.warning("No .env file found, using system environment variables only")

class Setting(BaseSettings):
    
    # Application
    PROJECT_NAME: str = "Tenant and Room Management System"

    # Database configuration
    DATABASE_URL: str = ""

    # JWT configuration  
    SECRET_KEY: str = ""
    ACCESS_TOKEN_EXPIRE: str = ""
    REFRESH_TOKEN_EXPIRE_DAY: str = ""
    ALGORITHM: str = "HS256"

    # CORS origins
    BACKEND_CORS_ORIGINS: str = ""

    # Environment
    ENVIRONMENT: str = "development"

    # PayOS configuration
    PAYOS_CLIENT_ID: str = ""
    PAYOS_API_KEY: str = ""
    PAYOS_CHECKSUM_KEY: str = ""
    PAYOS_RETURN_URL: str = "http://localhost:3000/payment/success"
    PAYOS_CANCEL_URL: str = "http://localhost:3000/payment/cancel"

    # Email configuration
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = "hoang2312004@gmail.com"
    SMTP_PASSWORD: str = "wksi wvfi hdpg yyme"
    SMTP_FROM_EMAIL: str = "hoang2312004@gmail.com"
    SMTP_FROM_NAME: str = "Phòng Trọ Online"

    @property
    def cors_origins(self) -> List[str]:
        """Parse CORS origins từ comma-separated string."""
        if not self.BACKEND_CORS_ORIGINS:
            return ["*"]
        return [origin.strip() for origin in self.BACKEND_CORS_ORIGINS.split(",") if origin.strip()]
    
    class Config:
        env_file_encoding = "utf-8"
        case_sensitive = True

# Khởi tạo settings toàn cục
settings = Setting()
