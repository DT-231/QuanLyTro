"""Room schemas cho hệ thống quản lý phòng trọ.

Pydantic schemas cho Room entity - dùng cho validation và serialization.
"""

from __future__ import annotations

from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
import uuid

from app.core.Enum.roomEnum import RoomStatus


class RoomBase(BaseModel):
    """Base schema for Room shared properties.

    Chứa các trường cơ bản của phòng trọ.
    """

    building_id: uuid.UUID
    room_number: str = Field(..., min_length=1, max_length=20)
    room_name: Optional[str] = Field(None, max_length=100)
    area: Optional[float] = Field(None, gt=0)
    capacity: int = Field(default=1, ge=1)
    base_price: Decimal = Field(..., ge=0, decimal_places=2)
    electricity_price: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    water_price_per_person: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    deposit_amount: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    status: str = Field(default=RoomStatus.AVAILABLE.value)
    description: Optional[str] = None

    model_config = {"from_attributes": True}


class RoomCreate(RoomBase):
    """Schema for creating a new room.

    Kế thừa từ RoomBase, yêu cầu các trường bắt buộc.
    Hỗ trợ thêm utilities (tiện ích) và photos (ảnh phòng).
    """
    
    # Danh sách tên tiện ích (Điều hoà, Bếp, Giường, TV, Ban công, Cửa sổ, Tủ lạnh, Tiền rác)
    utilities: Optional[List[str]] = Field(default_factory=list, description="Danh sách tiện ích")
    
    # Danh sách URL ảnh phòng (tạm thời dùng string URLs, sau này có thể upload file)
    photo_urls: Optional[List[str]] = Field(default_factory=list, description="Danh sách URL ảnh phòng")
    
    @validator('utilities')
    def validate_utilities(cls, v):
        """Validate danh sách utilities không rỗng và hợp lệ."""
        if v:
            # Trim whitespace
            return [utility.strip() for utility in v if utility.strip()]
        return []
    
    @validator('photo_urls')
    def validate_photo_urls(cls, v):
        """Validate danh sách photo URLs."""
        if v:
            return [url.strip() for url in v if url.strip()]
        return []


class RoomUpdate(BaseModel):
    """Schema for updating an existing room.

    Tất cả các trường đều optional để hỗ trợ partial update.
    Hỗ trợ cập nhật utilities và photos.
    """

    building_id: Optional[uuid.UUID] = None
    room_number: Optional[str] = Field(None, min_length=1, max_length=20)
    room_name: Optional[str] = Field(None, max_length=100)
    area: Optional[float] = Field(None, gt=0)
    capacity: Optional[int] = Field(None, ge=1)
    base_price: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    electricity_price: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    water_price_per_person: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    deposit_amount: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    status: Optional[str] = None
    description: Optional[str] = None
    
    # Update utilities và photos
    utilities: Optional[List[str]] = Field(None, description="Danh sách tiện ích (replace toàn bộ)")
    photo_urls: Optional[List[str]] = Field(None, description="Danh sách URL ảnh (replace toàn bộ)")
    
    @validator('utilities')
    def validate_utilities(cls, v):
        """Validate danh sách utilities."""
        if v is not None:
            return [utility.strip() for utility in v if utility.strip()]
        return None
    
    @validator('photo_urls')
    def validate_photo_urls(cls, v):
        """Validate danh sách photo URLs."""
        if v is not None:
            return [url.strip() for url in v if url.strip()]
        return None

    model_config = {"from_attributes": True}


class RoomOut(RoomBase):
    """Schema returned by the API for Room resources.

    Bao gồm metadata như id và timestamps.
    """

    id: uuid.UUID
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class RoomDetailOut(BaseModel):
    """Schema for Room detail with utilities and photos.
    
    Dùng cho API get room detail, bao gồm utilities và photos.
    """
    
    id: uuid.UUID
    building_id: uuid.UUID
    room_number: str
    room_name: Optional[str] = None
    area: Optional[float] = None
    capacity: int
    base_price: Decimal
    electricity_price: Optional[Decimal] = None
    water_price_per_person: Optional[Decimal] = None
    deposit_amount: Optional[Decimal] = None
    status: str
    description: Optional[str] = None
    
    # Utilities và photos
    utilities: List[str] = Field(default_factory=list, description="Danh sách tiện ích")
    photo_urls: List[str] = Field(default_factory=list, description="Danh sách URL ảnh")
    
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    model_config = {"from_attributes": True}


class RoomListItem(BaseModel):
    """Schema for Room list item with additional data.
    
    Dùng cho API list rooms, bao gồm thông tin building và tenant.
    """
    
    id: uuid.UUID
    room_number: str
    building_name: str  # Tên tòa nhà từ relationship
    area: Optional[float] = None
    capacity: int
    current_occupants: int = 0  # Số người đang ở (từ contract active)
    status: str
    base_price: Decimal
    representative: Optional[str] = None  # Tên người đại diện (từ contract)
    
    model_config = {"from_attributes": True}
