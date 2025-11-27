#!/bin/bash
# Room API Test Examples
# Chạy: bash test_room_api_examples.sh

BASE_URL="http://localhost:8000/api/v1"

echo "========================================="
echo "Room Management API Test Examples"
echo "========================================="
echo ""

# 1. Health check
echo "1. Health Check"
echo "GET /health"
curl -X GET "${BASE_URL%/api/v1}/health" | jq
echo -e "\n"

# 2. Tạo phòng mới
echo "2. Tạo phòng mới"
echo "POST /api/v1/rooms"
ROOM_RESPONSE=$(curl -X POST "$BASE_URL/rooms" \
  -H "Content-Type: application/json" \
  -d '{
    "building_id": "123e4567-e89b-12d3-a456-426614174000",
    "room_number": "101",
    "room_name": "Phòng đơn cao cấp",
    "area": 25.0,
    "capacity": 2,
    "base_price": "3000000.00",
    "electricity_price": "3500.00",
    "water_price_per_person": "100000.00",
    "deposit_amount": "3000000.00",
    "status": "AVAILABLE",
    "description": "Phòng đẹp, view thoáng, đầy đủ tiện nghi"
  }' -s)
echo $ROOM_RESPONSE | jq
ROOM_ID=$(echo $ROOM_RESPONSE | jq -r '.data.id')
echo "Created Room ID: $ROOM_ID"
echo -e "\n"

# 3. Lấy danh sách phòng
echo "3. Lấy danh sách phòng"
echo "GET /api/v1/rooms?limit=10&offset=0"
curl -X GET "$BASE_URL/rooms?limit=10&offset=0" | jq
echo -e "\n"

# 4. Lấy danh sách phòng theo status
echo "4. Lấy danh sách phòng AVAILABLE"
echo "GET /api/v1/rooms?status=AVAILABLE"
curl -X GET "$BASE_URL/rooms?status=AVAILABLE" | jq
echo -e "\n"

# 5. Xem chi tiết phòng
if [ ! -z "$ROOM_ID" ] && [ "$ROOM_ID" != "null" ]; then
  echo "5. Xem chi tiết phòng"
  echo "GET /api/v1/rooms/$ROOM_ID"
  curl -X GET "$BASE_URL/rooms/$ROOM_ID" | jq
  echo -e "\n"
fi

# 6. Cập nhật phòng (partial update)
if [ ! -z "$ROOM_ID" ] && [ "$ROOM_ID" != "null" ]; then
  echo "6. Cập nhật phòng"
  echo "PUT /api/v1/rooms/$ROOM_ID"
  curl -X PUT "$BASE_URL/rooms/$ROOM_ID" \
    -H "Content-Type: application/json" \
    -d '{
      "room_name": "Phòng VIP",
      "base_price": "3500000.00",
      "status": "OCCUPIED"
    }' | jq
  echo -e "\n"
fi

# 7. Xóa phòng
if [ ! -z "$ROOM_ID" ] && [ "$ROOM_ID" != "null" ]; then
  echo "7. Xóa phòng"
  echo "DELETE /api/v1/rooms/$ROOM_ID"
  curl -X DELETE "$BASE_URL/rooms/$ROOM_ID" | jq
  echo -e "\n"
fi

# 8. Test validation errors
echo "8. Test validation - Tạo phòng với giá âm (should fail)"
echo "POST /api/v1/rooms"
curl -X POST "$BASE_URL/rooms" \
  -H "Content-Type: application/json" \
  -d '{
    "building_id": "123e4567-e89b-12d3-a456-426614174000",
    "room_number": "102",
    "room_name": "Test Room",
    "capacity": 1,
    "base_price": "-1000.00",
    "status": "AVAILABLE"
  }' | jq
echo -e "\n"

# 9. Test duplicate room number
echo "9. Test duplicate room number (should fail if room exists)"
echo "POST /api/v1/rooms"
curl -X POST "$BASE_URL/rooms" \
  -H "Content-Type: application/json" \
  -d '{
    "building_id": "123e4567-e89b-12d3-a456-426614174000",
    "room_number": "101",
    "room_name": "Duplicate Room",
    "capacity": 1,
    "base_price": "2000000.00",
    "status": "AVAILABLE"
  }' | jq
echo -e "\n"

# 10. Test invalid status
echo "10. Test invalid status (should fail)"
echo "POST /api/v1/rooms"
curl -X POST "$BASE_URL/rooms" \
  -H "Content-Type: application/json" \
  -d '{
    "building_id": "123e4567-e89b-12d3-a456-426614174000",
    "room_number": "103",
    "room_name": "Test Room",
    "capacity": 1,
    "base_price": "2000000.00",
    "status": "INVALID_STATUS"
  }' | jq
echo -e "\n"

echo "========================================="
echo "Tests completed!"
echo "========================================="
