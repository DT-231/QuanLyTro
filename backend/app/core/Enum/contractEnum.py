"""Enums cho Contract entity trong hệ thống quản lý phòng trọ.

Các enum định nghĩa trạng thái của hợp đồng theo database schema.
"""

from __future__ import annotations

from .base_enum import BaseEnum


class ContractStatus(BaseEnum):
    """Trạng thái hợp đồng trong hệ thống.
    
    Theo contract_status enum trong database:
    - PENDING: Hợp đồng mới tạo, chờ tenant xác nhận
    - ACTIVE: Hợp đồng đang có hiệu lực
    - EXPIRED: Hợp đồng đã hết hạn
    - TERMINATED: Hợp đồng đã bị chấm dứt trước hạn
    - TERMINATION_REQUESTED_BY_TENANT: Người thuê yêu cầu chấm dứt hợp đồng
    - TERMINATION_REQUESTED_BY_LANDLORD: Chủ nhà yêu cầu chấm dứt hợp đồng
    - PENDING_UPDATE: Có thay đổi đang chờ tenant xác nhận
    """
    
    PENDING = "PENDING"                     # Hợp đồng mới, chờ xác nhận
    ACTIVE = "ACTIVE"                       # Hợp đồng đang có hiệu lực
    EXPIRED = "EXPIRED"                     # Hợp đồng đã hết hạn
    TERMINATED = "TERMINATED"               # Hợp đồng đã bị chấm dứt trước hạn  
    PENDING_UPDATE = "PENDING_UPDATE"       # Có thay đổi chờ xác nhận
    TERMINATION_REQUESTED_BY_TENANT = "TERMINATION_REQUESTED_BY_TENANT"
    TERMINATION_REQUESTED_BY_LANDLORD = "TERMINATION_REQUESTED_BY_LANDLORD"


class ContractDocumentType(BaseEnum):
    """Loại tài liệu hợp đồng.
    
    Các loại tài liệu có thể đính kèm với hợp đồng:
    - CONTRACT: Hợp đồng chính
    - ADDENDUM: Phụ lục hợp đồng
    - OTHER: Tài liệu khác
    """
    
    CONTRACT = "CONTRACT"   # Hợp đồng chính
    ADDENDUM = "ADDENDUM"   # Phụ lục hợp đồng
    OTHER = "OTHER"         # Tài liệu khác
