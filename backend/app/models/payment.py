"""Payment model cho hệ thống quản lý phòng trọ.

Model này định nghĩa cấu trúc thanh toán theo database schema.
"""

from __future__ import annotations

from sqlalchemy import Column, String, DateTime, DECIMAL, Text, ForeignKey, func
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID

from .base import BaseModel


class Payment(BaseModel):
    """Model cho bảng payments.
    
    Lưu trữ thông tin thanh toán của người thuê cho hóa đơn.
    """
    __tablename__ = "payments"
    
    # payment_id là unique identifier riêng, không phải PK (PK là 'id' từ BaseModel)
    payment_id = Column(UUID(as_uuid=True), unique=True, nullable=False, index=True)
    invoice_id = Column(UUID(as_uuid=True), ForeignKey("invoices.invoice_id"), nullable=False, index=True)
    payer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True)
    amount = Column(DECIMAL(10, 2), nullable=False)
    method = Column(String(50), nullable=False)  # Cash, Bank Transfer, Momo, etc.
    paid_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), index=True)
    reference_code = Column(String(100), nullable=True)  # Mã giao dịch ngân hàng
    proof_url = Column(Text, nullable=True)              # URL ảnh chứng từ
    note = Column(Text, nullable=True)
    
    # Relationships
    invoice = relationship("Invoice", back_populates="payments")
    payer = relationship("User", back_populates="payments")
