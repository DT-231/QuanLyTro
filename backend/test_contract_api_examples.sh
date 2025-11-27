#!/bin/bash

# Test Contract API Examples
# Run: chmod +x test_contract_api_examples.sh && ./test_contract_api_examples.sh

BASE_URL="http://localhost:8000"

echo "==================================="
echo "Contract API Test Examples"
echo "==================================="
echo ""

# 1. Get Contract Statistics
echo "1. GET /api/v1/contracts/stats - Lấy thống kê hợp đồng"
echo "-----------------------------------"
curl -X GET "${BASE_URL}/api/v1/contracts/stats" \
  -H "Content-Type: application/json" | jq .
echo ""
echo ""

# 2. List Contracts (page 1)
echo "2. GET /api/v1/contracts?page=1&size=10 - Danh sách hợp đồng"
echo "-----------------------------------"
curl -X GET "${BASE_URL}/api/v1/contracts?page=1&size=10" \
  -H "Content-Type: application/json" | jq .
echo ""
echo ""

# 3. List Contracts with filters
echo "3. GET /api/v1/contracts?status=ACTIVE - Lọc hợp đồng đang hoạt động"
echo "-----------------------------------"
curl -X GET "${BASE_URL}/api/v1/contracts?page=1&size=10&status=ACTIVE" \
  -H "Content-Type: application/json" | jq .
echo ""
echo ""

# 4. Search Contracts
echo "4. GET /api/v1/contracts?search=HD01 - Tìm kiếm hợp đồng"
echo "-----------------------------------"
curl -X GET "${BASE_URL}/api/v1/contracts?search=HD01" \
  -H "Content-Type: application/json" | jq .
echo ""
echo ""

# 5. Create Contract
echo "5. POST /api/v1/contracts - Tạo hợp đồng mới"
echo "-----------------------------------"
echo "NOTE: Cần thay ROOM_ID và TENANT_ID bằng UUID thực tế từ database"
# curl -X POST "${BASE_URL}/api/v1/contracts" \
#   -H "Content-Type: application/json" \
#   -d '{
#     "room_id": "REPLACE_WITH_ROOM_UUID",
#     "tenant_id": "REPLACE_WITH_USER_UUID",
#     "start_date": "2025-01-01",
#     "end_date": "2025-12-31",
#     "rental_price": 2000000.00,
#     "deposit_amount": 2000000.00,
#     "payment_day": 15,
#     "number_of_tenants": 1,
#     "terms_and_conditions": "Điều khoản hợp đồng...",
#     "notes": "Ghi chú...",
#     "payment_cycle_months": 3,
#     "electricity_price": 3500.00,
#     "water_price": 15000.00,
#     "service_fees": ["Phí rác", "Phí giữ xe"]
#   }' | jq .
echo "Skipped - Cần UUID thực tế"
echo ""
echo ""

# 6. Get Contract Detail
echo "6. GET /api/v1/contracts/{id} - Chi tiết hợp đồng"
echo "-----------------------------------"
echo "NOTE: Cần thay CONTRACT_ID bằng UUID thực tế"
# curl -X GET "${BASE_URL}/api/v1/contracts/REPLACE_WITH_CONTRACT_UUID" \
#   -H "Content-Type: application/json" | jq .
echo "Skipped - Cần UUID thực tế"
echo ""
echo ""

# 7. Update Contract
echo "7. PUT /api/v1/contracts/{id} - Cập nhật hợp đồng"
echo "-----------------------------------"
echo "NOTE: Cần thay CONTRACT_ID bằng UUID thực tế"
# curl -X PUT "${BASE_URL}/api/v1/contracts/REPLACE_WITH_CONTRACT_UUID" \
#   -H "Content-Type: application/json" \
#   -d '{
#     "rental_price": 2500000.00,
#     "notes": "Đã tăng giá thuê"
#   }' | jq .
echo "Skipped - Cần UUID thực tế"
echo ""
echo ""

# 8. Delete Contract
echo "8. DELETE /api/v1/contracts/{id} - Xóa hợp đồng"
echo "-----------------------------------"
echo "NOTE: Cần thay CONTRACT_ID bằng UUID thực tế"
# curl -X DELETE "${BASE_URL}/api/v1/contracts/REPLACE_WITH_CONTRACT_UUID" \
#   -H "Content-Type: application/json"
echo "Skipped - Cần UUID thực tế"
echo ""
echo ""

echo "==================================="
echo "Hướng dẫn sử dụng:"
echo "==================================="
echo ""
echo "1. Chạy server: python main.py hoặc uvicorn main:app --reload"
echo "2. Truy cập Swagger UI: http://localhost:8000/docs"
echo "3. Test các endpoints với dữ liệu thực tế"
echo ""
echo "Các endpoint chính:"
echo "- GET  /api/v1/contracts/stats       - Thống kê cho dashboard"
echo "- GET  /api/v1/contracts             - List với pagination & filters"
echo "- POST /api/v1/contracts             - Tạo hợp đồng mới"
echo "- GET  /api/v1/contracts/{id}        - Chi tiết hợp đồng"
echo "- PUT  /api/v1/contracts/{id}        - Cập nhật hợp đồng"
echo "- DELETE /api/v1/contracts/{id}      - Xóa hợp đồng"
echo ""
echo "Query parameters cho list:"
echo "- page: Số trang (default: 1)"
echo "- size: Số items/trang (default: 20, max: 100)"
echo "- status: Lọc theo ACTIVE/EXPIRED/TERMINATED/PENDING"
echo "- building: Lọc theo tên tòa nhà"
echo "- search: Tìm kiếm theo mã/tên/sđt"
echo ""
