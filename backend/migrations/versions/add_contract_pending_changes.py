"""add contract pending changes table

Revision ID: add_contract_pending_changes
Revises: d8480d7c0168
Create Date: 2024-12-24

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSON


# revision identifiers, used by Alembic.
revision = 'add_contract_pending_changes'
down_revision = 'd8480d7c0168'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Tạo bảng contract_pending_changes để lưu các thay đổi chờ tenant xác nhận."""
    op.create_table(
        'contract_pending_changes',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('contract_id', UUID(as_uuid=True), sa.ForeignKey('contracts.id'), nullable=False, index=True),
        sa.Column('changes', JSON, nullable=False),
        sa.Column('requested_by', UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False, index=True),
        sa.Column('reason', sa.Text, nullable=True),
        sa.Column('status', sa.String(20), nullable=False, default='PENDING', index=True),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime, server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    
    # Thêm trạng thái PENDING_UPDATE cho contracts nếu chưa có
    # (Nếu dùng PostgreSQL ENUM, cần thêm giá trị mới)
    # op.execute("ALTER TYPE contract_status ADD VALUE IF NOT EXISTS 'PENDING_UPDATE'")


def downgrade() -> None:
    """Xóa bảng contract_pending_changes."""
    op.drop_table('contract_pending_changes')
