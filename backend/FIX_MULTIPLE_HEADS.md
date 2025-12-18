# 🔧 Khắc Phục Lỗi Multiple Heads trong Alembic

## ❌ Lỗi hiện tại

```
ERROR [alembic.util.messaging] Multiple head revisions are present for given argument 'head'
```

**Heads hiện tại:**
- `58e08dc8c28e` (head)
- `6908f870e506` (head)

## ✅ Giải pháp

### **Option 1: Merge Heads (Recommended)**

Tạo migration merge để hợp nhất 2 heads:

```cmd
REM Kích hoạt virtual environment
env\Scripts\activate

REM Tạo merge migration
alembic merge -m "merge_multiple_heads" 58e08dc8c28e 6908f870e506

REM Chạy migration mới
alembic upgrade head
```

### **Option 2: Reset Database (Nhanh nhưng mất data)**

Nếu đây là môi trường development và có thể mất data:

```cmd
REM 1. Drop tất cả tables trong database
REM Cách 1: Dùng psql
psql -h localhost -p 5433 -U postgres -d rental_management -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

REM Cách 2: Dùng pgAdmin
REM - Kết nối vào database rental_management
REM - Click chuột phải vào database → Query Tool
REM - Chạy: DROP SCHEMA public CASCADE; CREATE SCHEMA public;

REM 2. Xóa bảng alembic_version
psql -h localhost -p 5433 -U postgres -d rental_management -c "DROP TABLE IF EXISTS alembic_version;"

REM 3. Chạy lại tất cả migrations từ đầu
alembic upgrade head
```

### **Option 3: Upgrade từng head riêng rẽ**

```cmd
REM Upgrade head 1
alembic upgrade 58e08dc8c28e

REM Upgrade head 2 (nếu cần)
alembic upgrade 6908f870e506
```

### **Option 4: Xóa migration duplicate (Nếu migration rỗng)**

Kiểm tra nội dung migration `58e08dc8c28e`:

```cmd
type migrations\versions\58e08dc8c28e_add_display_name_to_roles.py
```

Nếu migration này **rỗng** (chỉ có `pass`), xóa nó:

```cmd
REM Backup trước
copy migrations\versions\58e08dc8c28e_add_display_name_to_roles.py migrations\versions\58e08dc8c28e_backup.py

REM Xóa file
del migrations\versions\58e08dc8c28e_add_display_name_to_roles.py

REM Thử upgrade lại
alembic upgrade head
```

## 📋 Quy trình chi tiết (Recommended)

### **Bước 1: Kiểm tra heads**

```cmd
alembic heads
```

Output:
```
58e08dc8c28e (head)
6908f870e506 (head)
```

### **Bước 2: Xem lịch sử migrations**

```cmd
alembic history
```

### **Bước 3: Kiểm tra current revision trong DB**

```cmd
psql -h localhost -p 5433 -U postgres -d rental_management -c "SELECT * FROM alembic_version;"
```

### **Bước 4: Merge heads**

```cmd
alembic merge -m "merge_heads" 58e08dc8c28e 6908f870e506
```

Alembic sẽ tạo file mới trong `migrations/versions/` với cả 2 heads làm `down_revision`.

### **Bước 5: Upgrade**

```cmd
alembic upgrade head
```

### **Bước 6: Verify**

```cmd
REM Kiểm tra không còn multiple heads
alembic heads

REM Kiểm tra version hiện tại
alembic current
```

## 🛠️ Troubleshooting

### **Lỗi: "Can't locate revision 6908f870e506"**

Revision này có thể đến từ:
1. **Branch khác trong Git** - Ai đó đã tạo migration trên branch khác
2. **Database cũ** - Database đang chứa revision không có trong code hiện tại

**Giải pháp:**

```cmd
REM Xóa alembic_version trong database
psql -h localhost -p 5433 -U postgres -d rental_management -c "DELETE FROM alembic_version WHERE version_num = '6908f870e506';"

REM Chạy lại
alembic upgrade head
```

### **Lỗi: Migration conflict**

Nếu 2 migrations đều thay đổi cùng 1 table/column:

```cmd
REM Sửa thủ công file migration để tránh conflict
REM Hoặc reset database (Option 2 ở trên)
```

## 🎯 Khuyến nghị cho team

### **Ngăn chặn multiple heads trong tương lai:**

1. **Pull code trước khi tạo migration:**
```cmd
git pull
alembic upgrade head
alembic revision --autogenerate -m "your_message"
```

2. **Kiểm tra heads trước khi commit:**
```cmd
alembic heads
REM Chỉ nên có 1 head
```

3. **Không tạo migration khi đang có uncommitted migrations:**
```cmd
git status migrations/versions/
```

4. **Merge heads ngay khi phát hiện:**
```cmd
alembic merge heads -m "merge_conflict"
```

## 📝 Script tự động fix (Quick Fix)

Tạo file `fix_multiple_heads.bat`:

```batch
@echo off
echo ========================================
echo FIX MULTIPLE HEADS - ALEMBIC
echo ========================================

REM Activate venv
call env\Scripts\activate

echo.
echo Checking heads...
alembic heads

echo.
echo Current revision in DB...
psql -h localhost -p 5433 -U postgres -d rental_management -c "SELECT * FROM alembic_version;"

echo.
set /p confirm="Do you want to merge heads? (y/n): "
if /i "%confirm%"=="y" (
    echo Merging heads...
    alembic merge heads -m "auto_merge_heads"
    
    echo Upgrading...
    alembic upgrade head
    
    echo.
    echo ========================================
    echo DONE! Verify:
    alembic heads
    alembic current
    echo ========================================
) else (
    echo Cancelled.
)

pause
```

Chạy: `fix_multiple_heads.bat`

---

**Khuyến nghị:** Dùng **Option 1 (Merge)** để giữ lại lịch sử migrations đầy đủ.
