# 🏠 Hệ Thống Quản Lý Phòng Trọ (Room Rental Management System)

## 📖 Tổng Quan Dự Án

Hệ thống quản lý phòng trọ là một ứng dụng web full-stack được xây dựng để hỗ trợ quản lý các phòng trọ, tòa nhà, hợp đồng thuê, thanh toán và người dùng. Dự án sử dụng kiến trúc microservices với Docker, giúp dễ dàng triển khai và mở rộng.

### 🎯 Mục Đích

- Quản lý thông tin phòng trọ, tòa nhà và địa chỉ
- Quản lý hợp đồng thuê phòng
- Quản lý thanh toán tiền thuê
- Quản lý người dùng và phân quyền
- Tích hợp thanh toán trực tuyến (PayOS)

### 🛠️ Công Nghệ Sử Dụng

#### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL 15
- **ORM**: SQLAlchemy
- **Migration**: Alembic
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: Bcrypt
- **Payment Integration**: PayOS
- **Testing**: Pytest

#### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI
- **Form Handling**: React Hook Form
- **Validation**: Zod
- **Routing**: React Router DOM v7
- **Icons**: Lucide React

#### DevOps
- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Nginx (trong container frontend)

## 📁 Cấu Trúc Dự Án

```
DoAnChuyenNghanh/
├── backend/                    # Backend API (FastAPI)
│   ├── app/
│   │   ├── api/               # API endpoints
│   │   ├── core/              # Core configurations
│   │   ├── infrastructure/    # Infrastructure layer
│   │   ├── models/            # Database models
│   │   ├── repositories/      # Data access layer
│   │   ├── schemas/           # Pydantic schemas
│   │   └── services/          # Business logic
│   ├── migrations/            # Alembic migrations
│   ├── scripts/               # Utility scripts
│   ├── tests/                 # Unit tests
│   ├── doc/                   # API documentation
│   ├── main.py                # Application entry point
│   ├── requirements.txt       # Python dependencies
│   ├── Dockerfile             # Backend Docker config
│   └── alembic.ini           # Alembic configuration
├── front-end/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── Pages/            # Page components
│   │   ├── components/       # Reusable components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utility functions
│   │   ├── assets/           # Static assets
│   │   ├── App.jsx           # Main App component
│   │   └── main.jsx          # Application entry point
│   ├── public/               # Public static files
│   ├── package.json          # Node.js dependencies
│   ├── vite.config.js        # Vite configuration
│   └── Dockerfile            # Frontend Docker config
├── postgres_data/            # PostgreSQL data (gitignored)
├── docker-compose.yml        # Docker Compose configuration
├── DOCKER_GUIDE.md          # Docker usage guide
└── README.md                 # This file
```

## 🚀 Hướng Dẫn Cài Đặt và Chạy

### Yêu Cầu Hệ Thống

- **Docker Desktop** (phiên bản 20.10 trở lên)
- **Docker Compose** (phiên bản 1.29 trở lên)
- **Git**

### 1. Clone Repository

```bash
git clone https://github.com/DT-231/QuanLyTro.git
cd QuanLyTro
```

### 2. Cấu Hình Biến Môi Trường

Tạo file `.env` ở thư mục gốc:

```bash
# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=rental_management

# Backend Configuration
SECRET_KEY=your-secret-key-change-this-in-production
ACCESS_TOKEN_EXPIRE=30
REFRESH_TOKEN_EXPIRE_DAY=7
BACKEND_CORS_ORIGINS=http://localhost:3000,http://localhost:5173
ENVIRONMENT=development

# PayOS Configuration (nếu cần)
PAYOS_CLIENT_ID=your-client-id
PAYOS_API_KEY=your-api-key
PAYOS_CHECKSUM_KEY=your-checksum-key
```

### 3. Khởi Động Ứng Dụng

#### Sử Dụng Docker (Khuyến nghị)

```bash
# Build và khởi động tất cả services
docker-compose up -d --build

# Kiểm tra trạng thái containers
docker-compose ps

# Xem logs
docker-compose logs -f
```

#### Hoặc Chạy Development Mode (Local)

**Backend:**
```bash
cd backend
python -m venv env
source env/bin/activate  # On Windows: env\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd front-end
npm install
npm run dev
```

### 4. Chạy Database Migrations

```bash
# Trong Docker
docker exec -it rental_api alembic upgrade head

# Hoặc local
cd backend
alembic upgrade head
```

### 5. Seed Roles và Tạo Tài Khoản Admin (Bắt buộc)

**Sau khi chạy migrations, bạn cần seed roles và tạo tài khoản admin đầu tiên:**

```bash
# Cách 1: Sử dụng script tổng hợp (Khuyến nghị)
docker exec -it rental_api python scripts/seed_roles_and_admin.py

# Cách 2: Sử dụng shell script
docker exec -it rental_api bash scripts/setup_admin.sh

# Cách 3: Custom thông tin admin
docker exec -it rental_api python scripts/seed_roles_and_admin.py \
  --email boss@company.com --password SecurePass123

# Hoặc chạy local
cd backend
python scripts/seed_roles_and_admin.py
```

**Thông tin đăng nhập mặc định:**
- Email: `admin@rental.com`
- Password: `Admin@123456`

⚠️ **Lưu ý:** Vui lòng đổi password ngay sau khi đăng nhập lần đầu!

**Chi tiết:** Xem [backend/scripts/README.md](backend/scripts/README.md) để biết thêm về các script khác.

## 🌐 Truy Cập Ứng Dụng

Sau khi khởi động thành công:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation (Swagger)**: http://localhost:8000/docs
- **API Documentation (ReDoc)**: http://localhost:8000/redoc
- **Database**: localhost:5433 (PostgreSQL)

## 📚 Tài Liệu API

### Các Module Chính

1. **Authentication & Users**
   - Đăng ký, đăng nhập, quản lý token
   - Quản lý người dùng và phân quyền

2. **Buildings & Addresses**
   - Quản lý tòa nhà và địa chỉ
   - Chi tiết: [ADDRESS_BUILDING_SUMMARY.md](backend/doc/ADDRESS_BUILDING_SUMMARY.md)

3. **Rooms**
   - Quản lý phòng trọ
   - Chi tiết: [ROOM_API_SUMMARY.md](backend/doc/ROOM_API_SUMMARY.md)

4. **Contracts**
   - Quản lý hợp đồng thuê
   - Chi tiết: [CONTRACT_API_SUMMARY.md](backend/doc/CONTRACT_API_SUMMARY.md)

5. **Payments**
   - Quản lý thanh toán
   - Tích hợp PayOS
   - Chi tiết: [PAYMENT_SUMMARY.md](backend/doc/PAYMENT_SUMMARY.md)

### Testing Scripts

Dự án bao gồm các script test để kiểm tra API:

```bash
# Test API phòng
./backend/test_room_api_examples.sh

# Test API hợp đồng
./backend/test_contract_api_examples.sh

# Test API thanh toán
./backend/test_payment_api.sh

# Test phân quyền người dùng
./backend/test_user_roles.sh
```

## 🔧 Vận Hành và Bảo Trì

### Quản Lý Containers

```bash
# Khởi động services
docker-compose up -d

# Dừng services
docker-compose down

# Dừng và xóa volumes (xóa database)
docker-compose down -v

# Rebuild một service cụ thể
docker-compose up -d --build api

# Xem logs theo thời gian thực
docker-compose logs -f api
```

### Backup Database

```bash
# Backup database
docker exec -t rental_db pg_dump -U postgres rental_management > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore database
docker exec -i rental_db psql -U postgres rental_management < backup_file.sql
```

### Truy Cập Database

```bash
# Truy cập PostgreSQL CLI
docker exec -it rental_db psql -U postgres -d rental_management

# Hoặc qua localhost
psql -h localhost -p 5433 -U postgres -d rental_management
```

### Database Migrations

```bash
# Tạo migration mới
docker exec -it rental_api alembic revision --autogenerate -m "description"

# Chạy migrations
docker exec -it rental_api alembic upgrade head

# Rollback migration
docker exec -it rental_api alembic downgrade -1

# Xem lịch sử migrations
docker exec -it rental_api alembic history
```

### Monitoring và Logs

```bash
# Xem logs tất cả services
docker-compose logs -f

# Xem logs của service cụ thể với số dòng giới hạn
docker-compose logs --tail=100 -f api

# Kiểm tra resource usage
docker stats
```

### Troubleshooting

#### Container không khởi động
```bash
# Kiểm tra logs
docker-compose logs api

# Rebuild từ đầu
docker-compose down -v
docker-compose up -d --build
```

#### Database connection error
```bash
# Kiểm tra database đã sẵn sàng chưa
docker exec -it rental_db pg_isready -U postgres

# Restart database
docker-compose restart db
```

#### Port đã được sử dụng
```bash
# Kiểm tra port đang được sử dụng
lsof -i :8000  # hoặc :3000, :5433

# Đổi port trong docker-compose.yml hoặc kill process
```

## 🧪 Testing

### Backend Tests

```bash
# Chạy tất cả tests
docker exec -it rental_api pytest

# Chạy tests với coverage
docker exec -it rental_api pytest --cov=app tests/

# Chạy test file cụ thể
docker exec -it rental_api pytest tests/test_room_api.py
```

### Manual API Testing

Sử dụng Swagger UI tại http://localhost:8000/docs để test API interactively.

## 🔐 Bảo Mật

### Production Checklist

- [ ] Đổi `SECRET_KEY` trong file `.env`
- [ ] Sử dụng password mạnh cho database
- [ ] Enable HTTPS
- [ ] Cấu hình CORS properly
- [ ] Không commit file `.env` vào git
- [ ] Sử dụng environment variables cho sensitive data
- [ ] Enable rate limiting
- [ ] Cấu hình firewall
- [ ] Regular security updates

## 📝 Các Lệnh Hữu Ích

### Development

```bash
# Rebuild và restart service
docker-compose up -d --build api

# Xem environment variables trong container
docker exec -it rental_api env

# Truy cập shell trong container
docker exec -it rental_api bash

# Copy file từ container ra host
docker cp rental_api:/app/logs/app.log ./logs/

# Copy file từ host vào container
docker cp ./config.json rental_api:/app/config.json
```

### Database

```bash
# Export schema
docker exec -t rental_db pg_dump -U postgres -s rental_management > schema.sql

# List tất cả databases
docker exec -it rental_db psql -U postgres -c "\l"

# List tất cả tables
docker exec -it rental_db psql -U postgres -d rental_management -c "\dt"

# Check database size
docker exec -it rental_db psql -U postgres -d rental_management -c "SELECT pg_size_pretty(pg_database_size('rental_management'));"
```

## 🤝 Đóng Góp

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

Dự án này được phát triển cho mục đích học tập.

## 👥 Tác Giả

- **Repository**: [DT-231/QuanLyTro](https://github.com/DT-231/QuanLyTro)
- **Branch**: main

## 📞 Liên Hệ và Hỗ Trợ

- Xem chi tiết tài liệu API trong thư mục `backend/doc/`
- Xem hướng dẫn Docker chi tiết trong `DOCKER_GUIDE.md`
- Tạo issue trên GitHub để báo lỗi hoặc đề xuất tính năng

## 🔄 Changelog

### Version 1.0.0
- Quản lý phòng trọ, tòa nhà, địa chỉ
- Quản lý hợp đồng thuê
- Quản lý thanh toán tích hợp PayOS
- Hệ thống authentication và phân quyền
- Docker containerization
- API documentation đầy đủ

---

**Happy Coding! 🚀**
