# ⚡ Quick Start Guide - Khởi Động Nhanh

## 🎯 Mục Đích

Hướng dẫn khởi động nhanh hệ thống quản lý phòng trọ trong 5 phút.

## 📋 Yêu Cầu

- Docker Desktop đã cài đặt
- Git

## 🚀 Các Bước

### 1️⃣ Clone Repository (30s)

```bash
git clone https://github.com/DT-231/QuanLyTro.git
cd QuanLyTro
```

### 2️⃣ Tạo File Cấu Hình (30s)

Tạo file `.env` ở thư mục gốc:

```bash
cat > .env << 'EOF'
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=rental_management

# Backend
SECRET_KEY=dev-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE=30
REFRESH_TOKEN_EXPIRE_DAY=7
BACKEND_CORS_ORIGINS=http://localhost:3000,http://localhost:5173
ENVIRONMENT=development
EOF
```

### 3️⃣ Khởi Động Services (2 phút)

```bash
# Build và start containers
docker-compose up -d --build

# Xem logs để đảm bảo mọi thứ OK
docker-compose logs -f
```

Đợi cho đến khi thấy:
- ✅ `rental_db` healthy
- ✅ `rental_api` started
- ✅ `rental_web` started

Nhấn `Ctrl+C` để thoát logs.

### 4️⃣ Chạy Database Migrations (30s)

```bash
docker exec -it rental_api alembic upgrade head
```

### 5️⃣ Tạo Roles và Admin (30s)

```bash
docker exec -it rental_api python scripts/seed_roles_and_admin.py
```

Lưu lại thông tin đăng nhập được hiển thị:
- Email: `admin@rental.com`
- Password: `Admin@123456`

### 6️⃣ Test Đăng Nhập (30s)

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@rental.com",
    "password": "Admin@123456"
  }'
```

Bạn sẽ nhận được response với `access_token` và `refresh_token`.

## ✅ Xác Nhận Thành Công

Truy cập các URL sau:

- 🌐 **Frontend**: http://localhost:3000
- 🔧 **Backend API**: http://localhost:8000
- 📚 **API Docs**: http://localhost:8000/docs
- 📖 **ReDoc**: http://localhost:8000/redoc

## 🎉 Hoàn Thành!

Bây giờ bạn có thể:

1. **Đăng nhập vào hệ thống** với tài khoản admin
2. **Explore API** tại http://localhost:8000/docs
3. **Test các endpoint** với Swagger UI
4. **Phát triển tiếp** các tính năng mới

## 📝 Thông Tin Đăng Nhập

```
Email:    admin@rental.com
Password: Admin@123456
```

⚠️ **Đổi password ngay sau khi đăng nhập lần đầu!**

## 🔧 Các Lệnh Hữu Ích

```bash
# Xem logs
docker-compose logs -f

# Restart services
docker-compose restart

# Dừng services
docker-compose down

# Xóa hẳn (cả database)
docker-compose down -v

# Rebuild một service
docker-compose up -d --build api
```

## 🐛 Gặp Vấn Đề?

### Port đã được sử dụng

```bash
# Kiểm tra port
lsof -i :8000
lsof -i :3000
lsof -i :5433

# Hoặc đổi port trong docker-compose.yml
```

### Database connection error

```bash
# Kiểm tra database
docker exec -it rental_db pg_isready -U postgres

# Restart database
docker-compose restart db
```

### Container không start

```bash
# Xem chi tiết lỗi
docker-compose logs api
docker-compose logs db
docker-compose logs web

# Rebuild từ đầu
docker-compose down -v
docker-compose up -d --build
```

## 📚 Tài Liệu Chi Tiết

- [README.md](README.md) - Tài liệu đầy đủ
- [DOCKER_GUIDE.md](DOCKER_GUIDE.md) - Hướng dẫn Docker
- [backend/scripts/README.md](backend/scripts/README.md) - Script utilities
- [backend/doc/](backend/doc/) - API documentation

## 🎯 Next Steps

1. Đọc [API Documentation](backend/doc/)
2. Test các API endpoint tại http://localhost:8000/docs
3. Tạo buildings, rooms, contracts, payments
4. Customize frontend theo nhu cầu

---

**Happy Coding! 🚀**

*Thời gian tổng: ~5 phút*
