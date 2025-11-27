"""Room Router - RESTful API endpoints cho quản lý phòng.

Các endpoint tuân thủ REST conventions:
- GET /rooms - Lấy danh sách phòng
- POST /rooms - Tạo phòng mới
- GET /rooms/{room_id} - Xem chi tiết phòng
- PUT /rooms/{room_id} - Cập nhật phòng
- DELETE /rooms/{room_id} - Xóa phòng
"""

from __future__ import annotations

from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.infrastructure.db.session import get_db
from app.schemas.room_schema import RoomCreate, RoomUpdate, RoomOut, RoomListItem, RoomDetailOut
from app.services.RoomService import RoomService
from app.core import response
from app.schemas.response_schema import Response

router = APIRouter(prefix="/rooms", tags=["Room Management"])


@router.get(
    "",
    response_model=Response[dict],
    status_code=status.HTTP_200_OK,
    summary="Lấy danh sách phòng với thông tin chi tiết",
    description="Lấy danh sách phòng kèm tên tòa nhà, số người đang ở, đại diện",
    responses={
        200: {
            "description": "Successful Response",
            "content": {
                "application/json": {
                    "example": {
                        "code": 200,
                        "message": "Lấy danh sách phòng thành công",
                        "data": {
                            "items": [
                                {
                                    "id": "123e4567-e89b-12d3-a456-426614174000",
                                    "room_number": "101",
                                    "building_name": "Chung cư Hoàng Anh",
                                    "area": 50.0,
                                    "capacity": 4,
                                    "current_occupants": 2,
                                    "status": "OCCUPIED",
                                    "base_price": 7000000,
                                    "representative": "Phan Mạnh Quỳnh"
                                }
                            ],
                            "total": 50,
                            "offset": 0,
                            "limit": 20
                        }
                    }
                }
            }
        }
    }
)
def list_rooms(
    building_id: Optional[UUID] = Query(None, description="Lọc theo tòa nhà"),
    room_status: Optional[str] = Query(None, description="Lọc theo trạng thái phòng", alias="status"),
    offset: int = Query(0, ge=0, description="Vị trí bắt đầu"),
    limit: int = Query(20, ge=1, le=100, description="Số lượng tối đa (max 100)"),
    db: Session = Depends(get_db),
):
    """Lấy danh sách phòng với thông tin đầy đủ.
    
    Query params:
    - building_id: UUID của tòa nhà (optional)
    - status: Trạng thái phòng (AVAILABLE, OCCUPIED, MAINTENANCE, RESERVED)
    - offset: Vị trí bắt đầu (default 0)
    - limit: Số lượng tối đa (default 20, max 100)
    
    Response format:
    {
        "code": 200,
        "message": "success",
        "data": {
            "items": [
                {
                    "id": "uuid",
                    "room_number": "101",
                    "building_name": "Chung cư hoàng anh",
                    "area": 50.0,
                    "capacity": 4,
                    "current_occupants": 2,
                    "status": "OCCUPIED",
                    "base_price": 7000000,
                    "representative": "Phan Mạnh Quỳnh"
                }
            ],
            "total": 50,
            "offset": 0,
            "limit": 20
        }
    }
    """
    try:
        room_service = RoomService(db)
        result = room_service.list_rooms(
            building_id=building_id,
            status=room_status,
            offset=offset,
            limit=limit,
        )
        return response.success(data=result, message="Lấy danh sách phòng thành công")
    except ValueError as e:
        return response.bad_request(message=str(e))
    except Exception as e:
        return response.internal_error(message=f"Lỗi hệ thống: {str(e)}")


@router.post(
    "",
    response_model=Response[RoomDetailOut],
    status_code=status.HTTP_201_CREATED,
    summary="Tạo phòng mới với utilities và photos",
    description="Tạo phòng mới bao gồm thông tin cơ bản, tiện ích và ảnh phòng",
    responses={
        201: {
            "description": "Room created successfully",
            "content": {
                "application/json": {
                    "example": {
                        "code": 201,
                        "message": "Tạo phòng thành công",
                        "data": {
                            "id": "123e4567-e89b-12d3-a456-426614174000",
                            "room_number": "101",
                            "building_id": "223e4567-e89b-12d3-a456-426614174001",
                            "room_type": "STUDIO",
                            "area": 30.5,
                            "capacity": 2,
                            "description": "Phòng studio hiện đại",
                            "status": "AVAILABLE",
                            "base_price": 5000000,
                            "deposit_amount": 10000000,
                            "electricity_cost": 3500,
                            "water_cost": 20000,
                            "utilities": ["Điều hoà", "Bếp", "Giường"],
                            "photo_urls": ["https://example.com/photo1.jpg"]
                        }
                    }
                }
            }
        }
    }
)
def create_room(
    room_data: RoomCreate,
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user)  # TODO: Uncomment khi có auth
):
    """Tạo phòng mới với đầy đủ thông tin.
    
    **Tab 1 - Thông tin**:
    - Phòng, Trạng thái, Toà, Loại, Diện tích, Tối đa người, Mô tả
    - Tiện ích: ["Điều hoà", "Bếp", "Giường", "TV", "Ban công", "Cửa sổ"]
    
    **Tab 2 - Ảnh phòng**:
    - Danh sách URL ảnh: ["url1", "url2", ...]
    
    **Tab 3 - Tiền**:
    - Giá thuê, Giá cọc, Tiền điện, Tiền nước
    
    Business rules:
    - Số phòng phải unique trong cùng tòa nhà
    - Giá thuê phải > 0
    - Status phải hợp lệ (AVAILABLE, OCCUPIED, MAINTENANCE, RESERVED)
    
    Returns:
        RoomDetailOut với utilities và photo_urls
    """
    try:
        room_service = RoomService(db)
        # TODO: Thay None bằng current_user.id khi có auth
        room = room_service.create_room(room_data, user_id=None)
        return response.created(data=room, message="Tạo phòng thành công")
    except ValueError as e:
        # Business rule violations
        return response.conflict(message=str(e))
    except Exception as e:
        return response.internal_error(message=f"Lỗi hệ thống: {str(e)}")


@router.get(
    "/{room_id}",
    response_model=Response[RoomDetailOut],
    status_code=status.HTTP_200_OK,
    summary="Xem chi tiết phòng với utilities và photos",
    description="Lấy thông tin chi tiết phòng bao gồm tiện ích và ảnh",
    responses={
        200: {
            "description": "Successful Response",
            "content": {
                "application/json": {
                    "example": {
                        "code": 200,
                        "message": "Lấy thông tin phòng thành công",
                        "data": {
                            "id": "123e4567-e89b-12d3-a456-426614174000",
                            "room_number": "101",
                            "building_id": "223e4567-e89b-12d3-a456-426614174001",
                            "room_type": "STUDIO",
                            "area": 30.5,
                            "capacity": 2,
                            "description": "Phòng studio hiện đại",
                            "status": "AVAILABLE",
                            "base_price": 5000000,
                            "deposit_amount": 10000000,
                            "electricity_cost": 3500,
                            "water_cost": 20000,
                            "utilities": ["Điều hoà", "Bếp", "Giường", "TV"],
                            "photo_urls": ["https://example.com/photo1.jpg", "https://example.com/photo2.jpg"]
                        }
                    }
                }
            }
        },
        404: {
            "description": "Room not found",
            "content": {
                "application/json": {
                    "example": {
                        "code": 404,
                        "message": "Không tìm thấy phòng",
                        "data": {}
                    }
                }
            }
        }
    }
)
def get_room(
    room_id: UUID,
    db: Session = Depends(get_db),
):
    """Xem chi tiết phòng theo ID với đầy đủ thông tin.
    
    Response bao gồm:
    - Thông tin cơ bản: room_number, building_id, area, capacity, prices
    - Utilities: ["Điều hoà", "Bếp", "TV", ...]
    - Photo URLs: ["url1", "url2", ...]
        `
    Args:
        room_id: UUID của phòng cần xem
    
    Returns:
        RoomDetailOut với utilities và photo_urls
    """
    try:
        room_service = RoomService(db)
        room = room_service.get_room(room_id)
        return response.success(data=room, message="Lấy thông tin phòng thành công")
    except ValueError as e:
        return response.not_found(message=str(e))
    except Exception as e:
        return response.internal_error(message=f"Lỗi hệ thống: {str(e)}")
    

@router.put(
    "/{room_id}",
    response_model=Response[RoomDetailOut],
    status_code=status.HTTP_200_OK,
    summary="Cập nhật phòng với utilities và photos",
    description="Cập nhật thông tin phòng bao gồm tiện ích và ảnh (partial update)",
    responses={
        200: {
            "description": "Room updated successfully",
            "content": {
                "application/json": {
                    "example": {
                        "code": 200,
                        "message": "Cập nhật phòng thành công",
                        "data": {
                            "id": "123e4567-e89b-12d3-a456-426614174000",
                            "room_number": "101",
                            "building_id": "223e4567-e89b-12d3-a456-426614174001",
                            "room_type": "STUDIO",
                            "area": 30.5,
                            "capacity": 2,
                            "description": "Phòng studio hiện đại - Đã cập nhật",
                            "status": "AVAILABLE",
                            "base_price": 5500000,
                            "deposit_amount": 11000000,
                            "electricity_cost": 3500,
                            "water_cost": 20000,
                            "utilities": ["Điều hoà", "Bếp", "Giường", "TV", "Ban công"],
                            "photo_urls": ["https://example.com/new_photo1.jpg"]
                        }
                    }
                }
            }
        },
        404: {
            "description": "Room not found",
            "content": {
                "application/json": {
                    "example": {
                        "code": 404,
                        "message": "Không tìm thấy phòng",
                        "data": {}
                    }
                }
            }
        }
    }
)
def update_room(
    room_id: UUID,
    room_data: RoomUpdate,
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user)  # TODO: Uncomment khi có auth
):
    """Cập nhật thông tin phòng với đầy đủ thông tin.
    
    Hỗ trợ partial update - chỉ cần gửi các field muốn thay đổi.
    
    **Cập nhật Utilities**:
    - Gửi `utilities: ["Điều hoà", "Bếp"]` → thay thế toàn bộ utilities cũ
    - Không gửi `utilities` → giữ nguyên utilities hiện tại
    - Gửi `utilities: []` → xóa tất cả utilities
    
    **Cập nhật Photos**:
    - Gửi `photo_urls: ["url1", "url2"]` → thay thế toàn bộ photos cũ
    - Không gửi `photo_urls` → giữ nguyên photos hiện tại
    - Gửi `photo_urls: []` → xóa tất cả photos
    
    Business rules:
    - Không được update sang số phòng đã tồn tại
    - Giá thuê phải > 0 nếu được update
    - Status phải hợp lệ nếu được update
    
    Args:
        room_id: UUID của phòng cần update
        room_data: Dữ liệu cập nhật (các field optional)
    
    Returns:
        RoomDetailOut đã được cập nhật với utilities và photo_urls
    """
    try:
        room_service = RoomService(db)
        # TODO: Thay None bằng current_user.id khi có auth
        room = room_service.update_room(room_id, room_data, user_id=None)
        return response.success(data=room, message="Cập nhật phòng thành công")
    except ValueError as e:
        # Có thể là not found hoặc business rule violation
        error_msg = str(e).lower()
        if "không tìm thấy" in error_msg or "not found" in error_msg:
            return response.not_found(message=str(e))
        else:
            return response.bad_request(message=str(e))
    except Exception as e:
        return response.internal_error(message=f"Lỗi hệ thống: {str(e)}")


@router.delete(
    "/{room_id}",
    response_model=Response,
    status_code=status.HTTP_200_OK,
    summary="Xóa phòng",
    description="Xóa phòng khỏi hệ thống",
    responses={
        200: {
            "description": "Room deleted successfully",
            "content": {
                "application/json": {
                    "example": {
                        "code": 200,
                        "message": "Xóa phòng thành công",
                        "data": {}
                    }
                }
            }
        },
        404: {
            "description": "Room not found",
            "content": {
                "application/json": {
                    "example": {
                        "code": 404,
                        "message": "Không tìm thấy phòng",
                        "data": {}
                    }
                }
            }
        }
    }
)
def delete_room(
    room_id: UUID,
    db: Session = Depends(get_db),
):
    """Xóa phòng.
    
    Business rules:
    - Không xóa được phòng đang có hợp đồng active (có thể thêm sau)
    
    Args:
        room_id: UUID của phòng cần xóa
    
    Returns:
        Success message
    """
    try:
        room_service = RoomService(db)
        room_service.delete_room(room_id)
        return response.success(message="Xóa phòng thành công")
    except ValueError as e:
        return response.not_found(message=str(e))
    except Exception as e:
        return response.internal_error(message=f"Lỗi hệ thống: {str(e)}") 