from sqlalchemy.orm import Session

from app.repositories import user_repository
from app.schemas.user_schema import UserCreate, UserRegister



class AuthService:
    def __init__(self, db: Session):
        self.db = db
        # user_repository in this package is a module; instantiate the class
        self.user_repo = user_repository.UserRepository(db)
        # self.permission_repo = permission_repository(db)

    def register_user(self,user_data:UserRegister):
        try:
            if self.user_repo.get_by_email(user_data.email):
                return False, "Email đã tồn tại", None
        except Exception:
            # allow exception to bubble as failure
            return False, "Lỗi kiểm tra tồn tại user", None

        # create user
        from app.core.security import get_password_hash, create_access_token, create_refresh_token

        hashed = get_password_hash(user_data.password)
        data = user_data.model_dump()
        data["password"] = hashed

        user_obj = self.user_repo.create_user(user_in=data)

        # create tokens
        access = create_access_token(str(user_obj.id))
        refresh = create_refresh_token(str(user_obj.id))

        return True, "Created", {"user": user_obj, "access_token": access, "refresh_token": refresh}

    def authenticate_user(self, email: str, password: str):
        """Verify credentials and return user if valid, otherwise None."""
        from app.core.security import verify_password, create_access_token, create_refresh_token

        user = self.user_repo.get_by_email(email)
        if not user:
            return None
        if not verify_password(password, user.password):
            return None

        access = create_access_token(str(user.id))
        refresh = create_refresh_token(str(user.id))
        return {"user": user, "access_token": access, "refresh_token": refresh}

    def refresh_access_token(self, refresh_token: str):
        """Validate refresh token and issue a new access token."""
        from app.core.security import decode_token, create_access_token

        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise ValueError("Invalid token type")
        sub = payload.get("sub")
        if not sub:
            raise ValueError("Invalid token payload")

        user = self.user_repo.get_by_id(sub)
        if not user:
            raise ValueError("User not found")

        access = create_access_token(str(user.id))
        return {"access_token": access}