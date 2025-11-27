#!/bin/bash

# Script test Room API với utilities và photos

BASE_URL="http://localhost:8000/api/v1"

echo "================================================"
echo "  TEST ROOM API - CREATE/UPDATE WITH UTILITIES"
echo "================================================"

# Test 1: Tạo phòng mới với utilities và photos
echo -e "\n1. Tạo phòng mới (với utilities và photos):"
curl -s -X POST "${BASE_URL}/rooms" \
  -H "Content-Type: application/json" \
  -d '{
    "building_id": "YOUR-BUILDING-UUID",
    "room_number": "101.A203",
    "room_name": "Căn hộ studio",
    "area": 50.0,
    "capacity": 2,
    "base_price": 2000000,
    "electricity_price": 4000,
    "water_price_per_person": 50000,
    "deposit_amount": 2000000,
    "status": "AVAILABLE",
    "description": "Phòng đẹp, view đẹp",
    "utilities": ["Điều hoà", "Bếp", "Giường", "TV", "Ban công"],
    "photo_urls": ["https://example.com/photo1.jpg", "https://example.com/photo2.jpg"]
  }' | jq '.'

# Test 2: Lấy chi tiết phòng
echo -e "\n2. Lấy chi tiết phòng (với utilities và photos):"
echo "curl -s -X GET \"\${BASE_URL}/rooms/ROOM-UUID\" | jq '.'"

# Test 3: Cập nhật phòng (partial update)
echo -e "\n3. Cập nhật phòng (thêm/xóa utilities):"
curl -s -X PUT "${BASE_URL}/rooms/ROOM-UUID" \
  -H "Content-Type: application/json" \
  -d '{
    "room_name": "Căn hộ studio cao cấp",
    "base_price": 2500000,
    "utilities": ["Điều hoà", "Bếp", "Giường", "TV", "Ban công", "Tủ lạnh"],
    "photo_urls": ["https://example.com/photo1-new.jpg"]
  }' | jq '.'

echo -e "\n================================================"
echo "  Expected Response Format:"
echo "================================================"
cat << 'EOF'
{
  "code": 201,
  "message": "Tạo phòng thành công",
  "data": {
    "id": "uuid",
    "building_id": "uuid",
    "room_number": "101.A203",
    "room_name": "Căn hộ studio",
    "area": 50.0,
    "capacity": 2,
    "base_price": 2000000,
    "electricity_price": 4000,
    "water_price_per_person": 50000,
    "deposit_amount": 2000000,
    "status": "AVAILABLE",
    "description": "Phòng đẹp, view đẹp",
    "utilities": ["Điều hoà", "Bếp", "Giường", "TV", "Ban công"],
    "photo_urls": ["https://example.com/photo1.jpg", "https://example.com/photo2.jpg"],
    "created_at": "2025-01-23T...",
    "updated_at": "2025-01-23T..."
  }
}
EOF

echo -e "\n================================================"
echo "  TEST COMPLETED"
echo "================================================"
