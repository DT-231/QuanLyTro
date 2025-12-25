# Hướng Dẫn Hệ Thống Đặt Lịch Xem Phòng & Thông Báo

## Tổng Quan

Hệ thống này bao gồm 2 chức năng chính:

1. **Đặt lịch xem phòng**: Người dùng có thể đặt lịch xem phòng trực tiếp từ web, admin sẽ nhận thông báo và xử lý
2. **Thông báo tự động**: Khi admin tạo hợp đồng hoặc hóa đơn, khách hàng sẽ nhận thông báo để xem và thanh toán

---

## 1. Đặt Lịch Xem Phòng (Appointment System)

### Luồng Hoạt Động

```
[User] → Xem phòng trống → Nhấn "Đặt lịch xem phòng" → Điền form
   ↓
[Backend] → Lưu appointment → Gửi thông báo cho Admin
   ↓
[Admin] → Nhận thông báo → Xem danh sách appointment → Xử lý (Xác nhận/Từ chối)
```

### Backend (Đã tạo)

#### Models & Schema
- **Model**: `backend/app/models/appointment.py`
- **Schema**: `backend/app/schemas/appointment_schema.py`
- **Enum**: `backend/app/core/Enum/appointmentEnum.py`

#### API Endpoints

**Public API (Không cần đăng nhập):**
```
POST /api/v1/appointments
```
Body:
```json
{
  "full_name": "Nguyễn Văn A",
  "phone": "0912345678",
  "email": "example@email.com",
  "room_id": "uuid",
  "appointment_datetime": "2024-12-25T14:00:00",
  "notes": "Ghi chú"
}
```

**Admin API (Cần đăng nhập):**
```
GET /api/v1/appointments              - Danh sách appointments (với filter)
GET /api/v1/appointments/pending      - Appointments chờ xử lý
GET /api/v1/appointments/{id}         - Chi tiết appointment
PATCH /api/v1/appointments/{id}       - Cập nhật trạng thái
DELETE /api/v1/appointments/{id}      - Xóa appointment
```

#### Trạng Thái Appointment
- `PENDING`: Chờ xử lý (mới tạo)
- `CONFIRMED`: Đã xác nhận
- `REJECTED`: Từ chối
- `COMPLETED`: Đã hoàn thành
- `CANCELLED`: Đã hủy

### Frontend (Đã tạo)

#### Components

1. **AppointmentBookingForm.jsx**
   - Form đặt lịch cho user
   - Hiển thị dưới dạng Dialog/Modal
   - Validate input
   - Call API tạo appointment

2. **AppointmentManagement.jsx**
   - Trang quản lý cho admin
   - Xem danh sách appointments
   - Filter theo trạng thái
   - Cập nhật trạng thái và ghi chú

#### Cách Sử Dụng

**1. Thêm button đặt lịch vào trang chi tiết phòng:**

```jsx
import AppointmentBookingForm from '@/components/AppointmentBookingForm';

// Trong component RoomDetail
<AppointmentBookingForm 
  roomId={room.id}
  roomNumber={room.room_number}
  buildingName={room.building?.name}
/>
```

**2. Thêm route quản lý appointment cho admin:**

```jsx
// Trong router.jsx
import AppointmentManagement from '@/components/AppointmentManagement';

// Add route
{
  path: '/admin/appointments',
  element: <ProtectedRoute><AppointmentManagement /></ProtectedRoute>
}
```

**3. Thêm menu item trong Sidebar admin:**

```jsx
// Trong Sidebar.jsx
{
  name: 'Lịch hẹn xem phòng',
  icon: Calendar,
  path: '/admin/appointments',
  badge: pendingAppointmentsCount // Optional: hiển thị số lượng chờ xử lý
}
```

---

## 2. Hệ Thống Thông Báo

### Luồng Hoạt Động

```
[Admin] → Tạo Hợp đồng/Hóa đơn
   ↓
[Backend] → Tự động tạo notification → Lưu vào DB
   ↓
[User] → Nhận thông báo → Xem và thực hiện hành động
```

### Backend (Đã tạo)

#### Service
- **NotificationService**: `backend/app/services/NotificationService.py`
  - `create_contract_notification()`: Thông báo hợp đồng mới
  - `create_invoice_notification()`: Thông báo hóa đơn mới
  - `create_appointment_notification_for_admin()`: Thông báo lịch hẹn cho admin

#### API Endpoints

```
GET /api/v1/notifications                    - Danh sách thông báo
GET /api/v1/notifications/unread-count       - Số lượng chưa đọc
PATCH /api/v1/notifications/{id}/read        - Đánh dấu đã đọc
PATCH /api/v1/notifications/mark-all-read    - Đánh dấu tất cả đã đọc
DELETE /api/v1/notifications/{id}            - Xóa thông báo
```

#### Loại Thông Báo
- `CONTRACT`: Thông báo hợp đồng
- `INVOICE`: Thông báo hóa đơn
- `APPOINTMENT`: Thông báo lịch hẹn
- `PAYMENT`: Thông báo thanh toán
- `MAINTENANCE`: Thông báo bảo trì
- `SYSTEM`: Thông báo hệ thống

### Integration (Đã tích hợp)

**1. Contract API** (`backend/app/api/v1/routes/Contract.py`):
- Khi tạo hợp đồng mới → Tự động gửi thông báo cho tenant

**2. Invoice API** (`backend/app/api/v1/routes/Invoice.py`):
- Khi tạo hóa đơn mới → Tự động gửi thông báo cho tenant

**3. Appointment API** (`backend/app/api/v1/routes/Appointment.py`):
- Khi user đặt lịch → Tự động gửi thông báo cho tất cả admin

### Frontend (Đã tạo)

#### Component

**NotificationCenter.jsx**
- Icon chuông với badge số lượng chưa đọc
- Dropdown menu hiển thị thông báo gần nhất
- Dialog xem chi tiết
- Đánh dấu đã đọc, xóa thông báo
- Auto-refresh mỗi 30 giây

#### Cách Sử Dụng

**Thêm vào Header:**

```jsx
import NotificationCenter from '@/components/NotificationCenter';

// Trong Header component
<div className="flex items-center gap-4">
  <NotificationCenter />
  <UserMenu />
</div>
```

---

## 3. Database Migration

### Chạy Migration

```bash
cd backend

# Tạo revision mới (nếu cần)
alembic revision --autogenerate -m "Add appointments table"

# Chạy migration
alembic upgrade head

# Nếu có lỗi, rollback
alembic downgrade -1
```

### Migration File
File đã tạo: `backend/migrations/versions/add_appointments_table.py`

---

## 4. Testing

### Test API với cURL hoặc Postman

**1. Tạo Appointment (Public):**
```bash
curl -X POST http://localhost:8000/api/v1/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Nguyễn Văn A",
    "phone": "0912345678",
    "email": "test@example.com",
    "room_id": "your-room-uuid",
    "appointment_datetime": "2024-12-25T14:00:00",
    "notes": "Muốn xem vào buổi chiều"
  }'
```

**2. Lấy danh sách Appointments (Admin):**
```bash
curl -X GET http://localhost:8000/api/v1/appointments \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**3. Lấy Notifications:**
```bash
curl -X GET http://localhost:8000/api/v1/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**4. Đánh dấu thông báo đã đọc:**
```bash
curl -X PATCH http://localhost:8000/api/v1/notifications/{id}/read \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 5. Checklist Hoàn Thiện

### Backend
- [x] Tạo Appointment model
- [x] Tạo Appointment schema
- [x] Tạo Appointment repository
- [x] Tạo Appointment service
- [x] Tạo Appointment API routes
- [x] Tạo NotificationService
- [x] Tạo Notification API routes
- [x] Tích hợp thông báo vào Contract API
- [x] Tích hợp thông báo vào Invoice API
- [x] Tạo migration file

### Frontend
- [x] Tạo AppointmentBookingForm component
- [x] Tạo AppointmentManagement component
- [x] Tạo NotificationCenter component
- [ ] Thêm AppointmentBookingForm vào RoomDetail
- [ ] Thêm route cho AppointmentManagement
- [ ] Thêm NotificationCenter vào Header
- [ ] Thêm menu item trong Sidebar

### Database
- [ ] Chạy migration
- [ ] Verify bảng appointments đã tạo
- [ ] Test insert data

---

## 6. Các Bước Tiếp Theo

### Bước 1: Setup Database
```bash
cd backend
alembic upgrade head
```

### Bước 2: Khởi động Backend
```bash
cd backend
python main.py
# hoặc
uvicorn main:app --reload
```

### Bước 3: Khởi động Frontend
```bash
cd front-end
npm run dev
```

### Bước 4: Tích hợp Components

**a. Trong RoomDetail.jsx:**
```jsx
import AppointmentBookingForm from '@/components/AppointmentBookingForm';

// Thêm button vào phần actions
<div className="flex gap-2">
  {room.status === 'AVAILABLE' && (
    <AppointmentBookingForm 
      roomId={room.id}
      roomNumber={room.room_number}
      buildingName={room.building?.name}
    />
  )}
  {/* Other buttons */}
</div>
```

**b. Trong router.jsx:**
```jsx
import AppointmentManagement from '@/components/AppointmentManagement';

// Thêm vào routes
{
  path: '/admin/appointments',
  element: (
    <ProtectedRoute>
      <AppointmentManagement />
    </ProtectedRoute>
  )
}
```

**c. Trong Header.jsx:**
```jsx
import NotificationCenter from '@/components/NotificationCenter';

// Thêm vào header
<div className="flex items-center gap-4">
  <NotificationCenter />
  {/* User menu, etc */}
</div>
```

**d. Trong Sidebar.jsx (cho admin):**
```jsx
import { Calendar } from 'lucide-react';

// Thêm vào menu items
{
  name: 'Lịch hẹn',
  icon: Calendar,
  path: '/admin/appointments'
}
```

---

## 7. Troubleshooting

### Lỗi thường gặp:

**1. CORS Error:**
```python
# Trong main.py, đảm bảo có:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**2. Migration Error:**
```bash
# Reset migration nếu cần
alembic downgrade base
alembic upgrade head
```

**3. Import Error:**
```bash
# Đảm bảo đã cài đặt dependencies
pip install -r requirements.txt
```

**4. Frontend API Error:**
```javascript
// Kiểm tra .env file
VITE_API_URL=http://localhost:8000
```

---

## 8. Tính Năng Mở Rộng (Future)

1. **Email Notification**: Gửi email khi có thông báo mới
2. **Real-time Notification**: Sử dụng WebSocket cho thông báo real-time
3. **SMS Notification**: Gửi SMS cho lịch hẹn quan trọng
4. **Calendar Integration**: Tích hợp với Google Calendar
5. **Reminder System**: Nhắc nhở trước khi đến hạn thanh toán/xem phòng

---

## 9. Contact & Support

Nếu có vấn đề hoặc câu hỏi, vui lòng:
1. Kiểm tra lại các bước trong hướng dẫn
2. Xem log trong terminal (backend và frontend)
3. Test API bằng Postman/cURL trước khi test trên UI

---

**Chúc bạn triển khai thành công! 🎉**
