from typing import Optional
from uuid import UUID
from sqlalchemy.orm import Session, joinedload

from app.models.user import User

class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: UUID) -> Optional[User]:
        """
        Lấy user theo ID
        
        Args:
            user_id: UUID của user
            
        Returns:
            User object nếu tìm thấy, None nếu không tìm thấy
        """
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_email(self, email: str) -> Optional[User]:
        """
        Lấy user theo email
        
        Args:
            email: Địa chỉ email
            
        Returns:
            User object nếu tìm thấy, None nếu không tìm thấy
        """
        return self.db.query(User).filter(User.email == email).first() 
    def create_user(self, *, user_in: dict) -> User:
        """
        Tạo một user mới và commit vào database.

        Args:
            user_in: dict chứa các trường mô tả user (đã hash password)

        Returns:
            User: ORM instance mới được persist
        """
        obj = User(**user_in)
        self.db.add(obj)
        self.db.commit()
        # refresh để có các trường mặc định như id/created_at
        self.db.refresh(obj)
        return obj
    

