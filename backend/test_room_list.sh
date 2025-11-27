#!/bin/bash

# Script để test Room API với list có full details

BASE_URL="http://localhost:8000/api/v1"

echo "======================================"
echo "  TEST ROOM API - LIST WITH DETAILS"
echo "======================================"

# Test 1: Lấy danh sách phòng với details
echo -e "\n1. Lấy danh sách phòng (với thông tin đầy đủ):"
curl -s -X GET "${BASE_URL}/rooms?limit=10" \
  -H "Content-Type: application/json" | jq '.'

# Test 2: Lấy danh sách với filter status
echo -e "\n2. Lấy danh sách phòng (status=OCCUPIED):"
curl -s -X GET "${BASE_URL}/rooms?status=OCCUPIED&limit=5" \
  -H "Content-Type: application/json" | jq '.'

# Test 3: Lọc theo building_id (thay UUID thật)
echo -e "\n3. Lấy danh sách phòng theo tòa nhà (cần UUID thật):"
# curl -s -X GET "${BASE_URL}/rooms?building_id=YOUR-BUILDING-UUID&limit=10" \
#   -H "Content-Type: application/json" | jq '.'
echo "Skipped - cần building_id thật"

# Test 4: Lấy danh sách với pagination
echo -e "\n4. Lấy danh sách phòng (offset=0, limit=3):"
curl -s -X GET "${BASE_URL}/rooms?offset=0&limit=3" \
  -H "Content-Type: application/json" | jq '.'

echo -e "\n======================================"
echo "  Response Format Expected:"
echo "======================================"
cat << 'EOF'
{
  "code": 200,
  "message": "Lấy danh sách phòng thành công",
  "data": {
    "items": [
      {
        "id": "uuid",
        "room_number": "101",
        "building_name": "Chung cư hoàng anh gia lai",
        "area": 50.0,
        "capacity": 4,
        "current_occupants": 2,
        "status": "OCCUPIED",
        "base_price": 7000000,
        "representative": "Phan Mạnh Quỳnh"
      },
      {
        "id": "uuid",
        "room_number": "602",
        "building_name": "VinHome quận 7",
        "area": 75.0,
        "capacity": 2,
        "current_occupants": 0,
        "status": "AVAILABLE",
        "base_price": 7000000,
        "representative": null
      }
    ],
    "total": 50,
    "offset": 0,
    "limit": 20
  }
}
EOF

echo -e "\n======================================"
echo "  TEST COMPLETED"
echo "======================================"
