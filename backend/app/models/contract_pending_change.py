"""Contract Pending Change model - Lưu các thay đổi hợp đồng chờ tenant xác nhận.

Khi admin sửa hợp đồng đang ACTIVE, thay đổi sẽ được lưu vào bảng này
và chờ tenant xác nhận trước khi áp dụng vào hợp đồng chính.
"""

from __future__ import annotations

from sqlalchemy import Column, String, Date, DECIMAL, Integer, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, JSON

from .base import BaseModel


class ContractPendingChange(BaseModel):
    """Model cho bảng contract_pending_changes.
    
    Lưu trữ các thay đổi đang chờ tenant xác nhận.
    Khi tenant đồng ý, thay đổi sẽ được áp dụng vào Contract chính.
    Khi tenant từ chối, record này sẽ bị xóa.
    """
    __tablename__ = "contract_pending_changes"
    
    # Foreign key tới contract gốc
    contract_id = Column(UUID(as_uuid=True), ForeignKey("contracts.id"), nullable=False, index=True)
    
    # Lưu toàn bộ thay đổi dưới dạng JSON
    # Ví dụ: {"rental_price": 3000000, "end_date": "2026-01-01", "notes": "Đã tăng giá"}
    changes = Column(JSON, nullable=False)
    
    # Người tạo thay đổi (admin/landlord)
    requested_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    
    # Ghi chú về lý do thay đổi
    reason = Column(Text, nullable=True)
    
    # Trạng thái: PENDING, APPROVED, REJECTED
    status = Column(String(20), nullable=False, default="PENDING", index=True)
    
    # Relationships
    contract = relationship("Contract", back_populates="pending_changes")
    requester = relationship("User", foreign_keys=[requested_by])
