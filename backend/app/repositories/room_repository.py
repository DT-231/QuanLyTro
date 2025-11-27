"""Room Repository - data access layer cho Room entity.

Chỉ xử lý truy vấn database, không chứa business logic.
"""

from __future__ import annotations

from typing import Optional
from uuid import UUID
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select, func, case

from app.models.room import Room
from app.models.building import Building
from app.models.contract import Contract
from app.models.user import User
from app.schemas.room_schema import RoomCreate, RoomUpdate
from app.core.Enum.contractEnum import ContractStatus


class RoomRepository:
    """Repository để thao tác với Room entity trong database.
    
    Args:
        db: SQLAlchemy Session được inject từ FastAPI Depends.
    """
    
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, room_id: UUID) -> Optional[Room]:
        """Lấy Room theo ID (không load relationships).
        
        Args:
            room_id: UUID của phòng cần tìm.
            
        Returns:
            Room instance hoặc None nếu không tìm thấy.
        """
        return self.db.query(Room).filter(Room.id == room_id).first()
    
    def get_by_id_with_relations(self, room_id: UUID) -> Optional[Room]:
        """Lấy Room theo ID với eager loading utilities và photos.
        
        Args:
            room_id: UUID của phòng cần tìm.
            
        Returns:
            Room instance với utilities và room_photos, hoặc None.
        """
        return (
            self.db.query(Room)
            .options(
                joinedload(Room.utilities),
                joinedload(Room.room_photos)
            )
            .filter(Room.id == room_id)
            .first()
        )

    def get_by_building_and_number(
        self, building_id: UUID, room_number: str
    ) -> Optional[Room]:
        """Kiểm tra phòng có số phòng trong tòa nhà đã tồn tại chưa.
        
        Args:
            building_id: UUID của tòa nhà.
            room_number: Số phòng cần kiểm tra.
            
        Returns:
            Room instance hoặc None.
        """
        return (
            self.db.query(Room)
            .filter(Room.building_id == building_id, Room.room_number == room_number)
            .first()
        )

    def list(
        self,
        building_id: Optional[UUID] = None,
        status: Optional[str] = None,
        offset: int = 0,
        limit: int = 100,
    ) -> list[Room]:
        """Lấy danh sách phòng với filter và pagination.
        
        Args:
            building_id: Lọc theo tòa nhà (optional).
            status: Lọc theo trạng thái phòng (optional).
            offset: Vị trí bắt đầu lấy dữ liệu.
            limit: Số lượng tối đa trả về.
            
        Returns:
            Danh sách Room instances.
        """
        query = self.db.query(Room)
        
        if building_id:
            query = query.filter(Room.building_id == building_id)
        if status:
            query = query.filter(Room.status == status)
            
        return query.offset(offset).limit(limit).all()

    def count(
        self,
        building_id: Optional[UUID] = None,
        status: Optional[str] = None,
    ) -> int:
        """Đếm tổng số phòng theo filter.
        
        Args:
            building_id: Lọc theo tòa nhà (optional).
            status: Lọc theo trạng thái (optional).
            
        Returns:
            Tổng số phòng.
        """
        query = self.db.query(Room)
        
        if building_id:
            query = query.filter(Room.building_id == building_id)
        if status:
            query = query.filter(Room.status == status)
            
        return query.count()

    def create(self, data: RoomCreate) -> Room:
        """Tạo phòng mới trong database (deprecated - use create_room_basic).
        
        Args:
            data: RoomCreate schema chứa dữ liệu phòng.
            
        Returns:
            Room instance vừa được tạo.
        """
        room = Room(**data.model_dump())
        self.db.add(room)
        self.db.commit()
        self.db.refresh(room)
        return room
    
    def create_room_basic(self, room_dict: dict) -> Room:
        """Tạo phòng mới (chỉ basic info, không có utilities/photos).
        
        Args:
            room_dict: Dict chứa dữ liệu phòng.
            
        Returns:
            Room instance vừa được tạo.
        """
        room = Room(**room_dict)
        self.db.add(room)
        self.db.flush()  # Flush để có id nhưng chưa commit
        return room

    def update(self, room: Room, data: RoomUpdate) -> Room:
        """Cập nhật thông tin phòng (deprecated - use update_room_basic).
        
        Args:
            room: Room instance cần update.
            data: RoomUpdate schema chứa dữ liệu mới.
            
        Returns:
            Room instance đã được cập nhật.
        """
        # Chỉ update các field được set trong request
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(room, field, value)
            
        self.db.commit()
        self.db.refresh(room)
        return room
    
    def update_room_basic(self, room: Room, room_dict: dict) -> Room:
        """Cập nhật phòng (chỉ basic info, không có utilities/photos).
        
        Args:
            room: Room instance cần update.
            room_dict: Dict chứa dữ liệu mới.
            
        Returns:
            Room instance đã được cập nhật.
        """
        for field, value in room_dict.items():
            if hasattr(room, field):
                setattr(room, field, value)
        
        self.db.flush()  # Flush để update nhưng chưa commit
        return room

    def delete(self, room: Room) -> None:
        """Xóa phòng khỏi database.
        
        Args:
            room: Room instance cần xóa.
        """
        self.db.delete(room)
        self.db.commit()
    
    def list_with_details(
        self,
        building_id: Optional[UUID] = None,
        status: Optional[str] = None,
        offset: int = 0,
        limit: int = 100,
    ) -> list[dict]:
        """Lấy danh sách phòng kèm thông tin building và tenant.
        
        Args:
            building_id: Lọc theo tòa nhà (optional).
            status: Lọc theo trạng thái phòng (optional).
            offset: Vị trí bắt đầu lấy dữ liệu.
            limit: Số lượng tối đa trả về.
            
        Returns:
            List of dict chứa thông tin room với building name và tenant info.
        """
        # Subquery để lấy contract ACTIVE mới nhất của mỗi room
        active_contract_subq = (
            self.db.query(
                Contract.room_id,
                Contract.tenant_id,
                Contract.number_of_tenants,
                func.row_number()
                .over(
                    partition_by=Contract.room_id,
                    order_by=Contract.created_at.desc()
                )
                .label('rn')
            )
            .filter(Contract.status == ContractStatus.ACTIVE.value)
            .subquery()
        )
        
        # Main query với joins
        query = (
            self.db.query(
                Room.id,
                Room.room_number,
                Room.area,
                Room.capacity,
                Room.status,
                Room.base_price,
                Building.building_name,
                func.coalesce(active_contract_subq.c.number_of_tenants, 0).label('current_occupants'),
                func.concat(User.last_name, ' ', User.first_name).label('representative'),
            )
            .join(Building, Room.building_id == Building.id)
            .outerjoin(
                active_contract_subq,
                (Room.id == active_contract_subq.c.room_id) & (active_contract_subq.c.rn == 1)
            )
            .outerjoin(User, active_contract_subq.c.tenant_id == User.id)
        )
        
        # Apply filters
        if building_id:
            query = query.filter(Room.building_id == building_id)
        if status:
            query = query.filter(Room.status == status)
        
        # Apply pagination
        results = query.offset(offset).limit(limit).all()
        
        # Convert to dict
        return [
            {
                'id': row.id,
                'room_number': row.room_number,
                'building_name': row.building_name,
                'area': row.area,
                'capacity': row.capacity,
                'current_occupants': row.current_occupants,
                'status': row.status,
                'base_price': row.base_price,
                'representative': row.representative if row.representative else None,
            }
            for row in results
        ]
