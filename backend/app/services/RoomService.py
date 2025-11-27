"""Room Service - business logic layer cho Room entity.

Service xử lý các use case và business rules liên quan đến Room.
"""

from __future__ import annotations

from typing import Optional
from uuid import UUID
from sqlalchemy.orm import Session

from app.repositories.room_repository import RoomRepository
from app.schemas.room_schema import RoomCreate, RoomOut, RoomUpdate, RoomListItem, RoomDetailOut
from app.models.room import Room
from app.models.room_utility import RoomUtility
from app.models.room_photo import RoomPhoto
from app.core.Enum.roomEnum import RoomStatus
from app.core.utils.uuid import generate_uuid7


class RoomService:
    """Service xử lý business logic cho Room.
    
    - Validate các quy tắc nghiệp vụ.
    - Điều phối CRUD operations qua Repository.
    
    Args:
        db: SQLAlchemy Session được inject từ FastAPI Depends.
    """
    
    def __init__(self, db: Session):
        self.db = db
        self.room_repo = RoomRepository(db)

    def create_room(self, room_data: RoomCreate, user_id: Optional[UUID] = None) -> RoomDetailOut:
        """Tạo phòng mới với validation, utilities và photos.
        
        Business rules:
        - Số phòng phải unique trong cùng tòa nhà.
        - Base price phải > 0.
        - Status phải hợp lệ theo enum.
        
        Args:
            room_data: Thông tin phòng từ request.
            user_id: UUID của user tạo phòng (để gán cho photos).
            
        Returns:
            RoomDetailOut schema với utilities và photos.
            
        Raises:
            ValueError: Nếu vi phạm business rules.
        """
        # Validate base_price
        if room_data.base_price <= 0:
            raise ValueError("Giá thuê phải lớn hơn 0")
        
        # Validate capacity
        if room_data.capacity < 1:
            raise ValueError("Sức chứa phải ít nhất 1 người")
        
        # Validate status
        valid_statuses = [s.value for s in RoomStatus]
        if room_data.status not in valid_statuses:
            raise ValueError(f"Trạng thái không hợp lệ. Phải là một trong: {valid_statuses}")
        
        # Kiểm tra số phòng đã tồn tại trong tòa nhà chưa
        existing = self.room_repo.get_by_building_and_number(
            building_id=room_data.building_id,
            room_number=room_data.room_number
        )
        if existing:
            raise ValueError(f"Số phòng {room_data.room_number} đã tồn tại trong tòa nhà này")
        
        # Extract utilities và photo_urls từ room_data
        utilities = room_data.utilities or []
        photo_urls = room_data.photo_urls or []
        
        # Tạo dict từ room_data (exclude utilities và photo_urls)
        room_dict = room_data.model_dump(exclude={'utilities', 'photo_urls'})
        
        # Tạo phòng mới
        room = self.room_repo.create_room_basic(room_dict)
        
        # Thêm utilities nếu có
        if utilities:
            for utility_name in utilities:
                utility = RoomUtility(
                    utility_id=generate_uuid7(),
                    room_id=room.id,
                    utility_name=utility_name,
                    description=None
                )
                self.db.add(utility)
        
        # Thêm photos nếu có
        if photo_urls and user_id:
            for idx, url in enumerate(photo_urls):
                photo = RoomPhoto(
                    room_id=room.id,
                    url=url,
                    is_primary=(idx == 0),  # Ảnh đầu tiên làm primary
                    sort_order=idx,
                    uploaded_by=user_id
                )
                self.db.add(photo)
        
        # Commit tất cả
        self.db.commit()
        self.db.refresh(room)
        
        # Convert sang RoomDetailOut
        return self._room_to_detail_out(room)

    def get_room(self, room_id: UUID) -> RoomDetailOut:
        """Lấy thông tin chi tiết phòng với utilities và photos.
        
        Args:
            room_id: UUID của phòng cần lấy.
            
        Returns:
            RoomDetailOut schema với utilities và photos.
            
        Raises:
            ValueError: Nếu không tìm thấy phòng.
        """
        room = self.room_repo.get_by_id_with_relations(room_id)
        if not room:
            raise ValueError(f"Không tìm thấy phòng với ID: {room_id}")
        
        return self._room_to_detail_out(room)

    def list_rooms(
        self,
        building_id: Optional[UUID] = None,
        status: Optional[str] = None,
        offset: int = 0,
        limit: int = 100,
    ) -> dict:
        """Lấy danh sách phòng với thông tin đầy đủ, filter và pagination.
        
        Args:
            building_id: Lọc theo tòa nhà (optional).
            status: Lọc theo trạng thái (optional).
            offset: Vị trí bắt đầu.
            limit: Số lượng tối đa (max 100).
            
        Returns:
            Dict chứa items (danh sách phòng với details), total, offset, limit.
            
            Response format:
            {
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
                        "representative": "Nguyễn Văn A"
                    }
                ],
                "total": 50,
                "offset": 0,
                "limit": 20
            }
        """
        # Validate limit
        if limit > 100:
            limit = 100
        if limit < 1:
            limit = 20
            
        # Validate status nếu có
        if status:
            valid_statuses = [s.value for s in RoomStatus]
            if status not in valid_statuses:
                raise ValueError(f"Trạng thái không hợp lệ. Phải là một trong: {valid_statuses}")
        
        # Lấy danh sách với details
        items_data = self.room_repo.list_with_details(
            building_id=building_id,
            status=status,
            offset=offset,
            limit=limit
        )
        
        # Lấy tổng số
        total = self.room_repo.count(building_id=building_id, status=status)
        
        # Convert dict sang Pydantic schemas
        items_out = [RoomListItem(**item) for item in items_data]
        
        return {
            "items": items_out,
            "total": total,
            "offset": offset,
            "limit": limit,
        }

    def update_room(self, room_id: UUID, room_data: RoomUpdate, user_id: Optional[UUID] = None) -> RoomDetailOut:
        """Cập nhật thông tin phòng, utilities và photos.
        
        Business rules:
        - Không được update sang số phòng đã tồn tại trong cùng tòa nhà.
        - Giá thuê phải > 0 nếu được update.
        - Status phải hợp lệ nếu được update.
        
        Args:
            room_id: UUID của phòng cần update.
            room_data: Dữ liệu cập nhật.
            user_id: UUID của user update (để gán cho photos mới).
            
        Returns:
            RoomDetailOut schema đã được cập nhật.
            
        Raises:
            ValueError: Nếu không tìm thấy phòng hoặc vi phạm rules.
        """
        # Lấy room ORM instance (KHÔNG load relationships để tránh conflict)
        room_orm = self.room_repo.get_by_id(room_id)
        if not room_orm:
            raise ValueError(f"Không tìm thấy phòng với ID: {room_id}")
        
        # Validate các field được update
        if room_data.base_price is not None and room_data.base_price <= 0:
            raise ValueError("Giá thuê phải lớn hơn 0")
        
        if room_data.capacity is not None and room_data.capacity < 1:
            raise ValueError("Sức chứa phải ít nhất 1 người")
        
        if room_data.status is not None:
            valid_statuses = [s.value for s in RoomStatus]
            if room_data.status not in valid_statuses:
                raise ValueError(f"Trạng thái không hợp lệ. Phải là một trong: {valid_statuses}")
        
        # Kiểm tra trùng số phòng nếu update room_number hoặc building_id
        if room_data.room_number or room_data.building_id:
            new_building_id = room_data.building_id or room_orm.building_id
            new_room_number = room_data.room_number or room_orm.room_number
            
            # Chỉ check nếu thay đổi
            if new_building_id != room_orm.building_id or new_room_number != room_orm.room_number:
                existing = self.room_repo.get_by_building_and_number(
                    building_id=new_building_id,
                    room_number=new_room_number
                )
                if existing and existing.id != room_id:
                    raise ValueError(f"Số phòng {new_room_number} đã tồn tại trong tòa nhà này")
        
        # Extract utilities và photo_urls nếu có
        utilities = room_data.utilities
        photo_urls = room_data.photo_urls
        
        # UPDATE room basic info TRƯỚC (exclude utilities và photo_urls)
        room_dict = room_data.model_dump(exclude_unset=True, exclude={'utilities', 'photo_urls'})
        if room_dict:  # Chỉ update nếu có data
            updated_room = self.room_repo.update_room_basic(room_orm, room_dict)
        else:
            updated_room = room_orm
        
        # XÓA utilities/photos CŨ SAU (query trực tiếp, không qua relationship)
        if utilities is not None:
            # Xóa utilities cũ bằng query trực tiếp
            self.db.query(RoomUtility).filter(RoomUtility.room_id == room_id).delete(
                synchronize_session=False
            )
            self.db.flush()
        
        if photo_urls is not None and user_id:
            # Xóa photos cũ bằng query trực tiếp
            self.db.query(RoomPhoto).filter(RoomPhoto.room_id == room_id).delete(
                synchronize_session=False
            )
            self.db.flush()
        
        # THÊM utilities/photos MỚI
        if utilities is not None:
            # Thêm utilities mới
            for utility_name in utilities:
                utility = RoomUtility(
                    utility_id=generate_uuid7(),
                    room_id=room_id,
                    utility_name=utility_name,
                    description=None
                )
                self.db.add(utility)
        
        if photo_urls is not None and user_id:
            # Thêm photos mới
            for idx, url in enumerate(photo_urls):
                photo = RoomPhoto(
                    room_id=room_id,
                    url=url,
                    is_primary=(idx == 0),
                    sort_order=idx,
                    uploaded_by=user_id
                )
                self.db.add(photo)
        
        # Commit tất cả thay đổi
        self.db.commit()
        
        # Get lại room với relationships để convert sang RoomDetailOut
        final_room = self.room_repo.get_by_id_with_relations(room_id)
        
        # Convert sang RoomDetailOut
        return self._room_to_detail_out(final_room)

    def delete_room(self, room_id: UUID) -> None:
        """Xóa phòng.
        
        Business rules:
        - Không xóa phòng đang có hợp đồng active (optional, có thể thêm sau).
        
        Args:
            room_id: UUID của phòng cần xóa.
            
        Raises:
            ValueError: Nếu không tìm thấy phòng.
        """
        # Lấy ORM instance để xóa (không dùng get_room vì nó trả RoomDetailOut)
        room_orm = self.room_repo.get_by_id(room_id)
        if not room_orm:
            raise ValueError(f"Không tìm thấy phòng với ID: {room_id}")
        
        # TODO: Kiểm tra phòng có hợp đồng active không
        # if room_orm.contracts với status active:
        #     raise ValueError("Không thể xóa phòng đang có hợp đồng")
        
        # Xóa utilities của phòng trước
        self.db.query(RoomUtility).filter(RoomUtility.room_id == room_id).delete(
            synchronize_session=False
        )
        
        # Xóa photos của phòng trước
        self.db.query(RoomPhoto).filter(RoomPhoto.room_id == room_id).delete(
            synchronize_session=False
        )
        
        # Xóa phòng
        self.room_repo.delete(room_orm)
    
    def _room_to_detail_out(self, room: Room) -> RoomDetailOut:
        """Convert Room ORM instance sang RoomDetailOut schema.
        
        Args:
            room: Room ORM instance.
            
        Returns:
            RoomDetailOut schema với utilities và photos.
        """
        # Lấy utilities
        utilities = [u.utility_name for u in room.utilities] if room.utilities else []
        
        # Lấy photo URLs, sắp xếp theo sort_order
        photos = sorted(room.room_photos, key=lambda p: p.sort_order) if room.room_photos else []
        photo_urls = [p.url for p in photos]
        
        # Build dict data
        room_data = {
            'id': room.id,
            'building_id': room.building_id,
            'room_number': room.room_number,
            'room_name': room.room_name,
            'area': room.area,
            'capacity': room.capacity,
            'base_price': room.base_price,
            'electricity_price': room.electricity_price,
            'water_price_per_person': room.water_price_per_person,
            'deposit_amount': room.deposit_amount,
            'status': room.status,
            'description': room.description,
            'utilities': utilities,
            'photo_urls': photo_urls,
            'created_at': room.created_at,
            'updated_at': room.updated_at,
        }
        
        return RoomDetailOut(**room_data)