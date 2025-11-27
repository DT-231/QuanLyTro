#!/bin/bash

# Script để test Building API với list có room statistics

BASE_URL="http://localhost:8000/api/v1"

echo "======================================"
echo "  TEST BUILDING API - LIST WITH STATS"
echo "======================================"

# Test 1: Lấy danh sách tòa nhà với stats
echo -e "\n1. Lấy danh sách tòa nhà (với thống kê phòng):"
curl -s -X GET "${BASE_URL}/buildings?limit=10" \
  -H "Content-Type: application/json" | jq '.'

# Test 2: Lấy danh sách với filter status
echo -e "\n2. Lấy danh sách tòa nhà (status=ACTIVE):"
curl -s -X GET "${BASE_URL}/buildings?status=ACTIVE&limit=5" \
  -H "Content-Type: application/json" | jq '.'

# Test 3: Lấy danh sách với pagination
echo -e "\n3. Lấy danh sách tòa nhà (offset=0, limit=3):"
curl -s -X GET "${BASE_URL}/buildings?offset=0&limit=3" \
  -H "Content-Type: application/json" | jq '.'

echo -e "\n======================================"
echo "  Response Format Expected:"
echo "======================================"
cat << 'EOF'
{
  "code": 200,
  "message": "Lấy danh sách tòa nhà thành công",
  "data": {
    "items": [
      {
        "id": "uuid",
        "building_code": "BLD-001",
        "building_name": "Chung cư hoàng anh",
        "address_line": "72 Hàm nghi, Đà Nẵng",
        "total_rooms": 15,
        "available_rooms": 1,
        "rented_rooms": 14,
        "status": "ACTIVE",
        "description": "...",
        "created_at": "2025-02-10T..."
      }
    ],
    "total": 10,
    "offset": 0,
    "limit": 20
  }
}
EOF

echo -e "\n======================================"
echo "  TEST COMPLETED"
echo "======================================"
