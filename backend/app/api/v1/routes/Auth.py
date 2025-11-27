from fastapi import APIRouter, Depends

from app.infrastructure.db.session import get_db
from sqlalchemy.orm import Session

from app.schemas.auth_schema import TokenRefreshRequest
from app.schemas.user_schema import UserCreate, UserLogin, UserRegister
from app.services import AuthService


router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register")
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """
    Đăng ký tài khoản người dùng mới

    - **firstName**: Tên  (2-50 ký tự)
    - **lastName**: Họ (2-50 ký tự )
    - **email**: Địa chỉ email (duy nhất)
    - **password**: Mật khẩu (tối thiểu 6 ký tự)
    """
    auth_service = AuthService(db)
    ok, msg, payload = auth_service.register_user(user_data)
    if not ok:
        return {"code": 400, "message": msg}
    # return created user and tokens
    user = payload["user"]
    return {
        "code": 201,
        "message": "created",
        "data": {
            "user": user,
            "access_token": payload["access_token"],
            "refresh_token": payload["refresh_token"],
        },
    }


@router.post("/login")
async def login(
    credentials:UserLogin, db: Session = Depends(get_db)
):
    """
    Login with email/password and receive access + refresh tokens.

    - **email**: Địa chỉ email
    - **password**: Mật khẩu (tối thiểu 6 ký tự)

    """
    auth_service = AuthService(db)
    email = credentials.email
    password = credentials.password
    if not email or not password:
        return {"code": 400, "message": "email and password required"}

    auth = auth_service.authenticate_user(email, password)
    if not auth:
        return {"code": 401, "message": "Invalid credentials"}

    return {
        "code": 200,
        "message": "ok",
        "data": {
            "user": auth["user"],
            "access_token": auth["access_token"],
            "refresh_token": auth["refresh_token"],
        },
    }


@router.post("/refresh")
async def refresh(payload: TokenRefreshRequest, db: Session = Depends(get_db)):
    """Exchange refresh token for a new access token."""
    token = payload.refresh_token
    if not token:
        return {"code": 400, "message": "refresh_token is required"}

    auth_service = AuthService(db)
    try:
        data = auth_service.refresh_access_token(token)
    except Exception as e:
        return {"code": 401, "message": str(e)}

    return {"code": 200, "message": "ok", "data": data}
