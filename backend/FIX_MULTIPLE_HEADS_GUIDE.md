# Hướng dẫn sửa lỗi Multiple Heads trong Alembic

## Vấn đề
Khi chạy `alembic upgrade head` gặp lỗi:
```
ERROR [alembic.util.messaging] Multiple head revisions are present for given argument 'head'
```

## Nguyên nhân
Có 2 hoặc nhiều migration heads (đầu nhánh) trong database, thường xảy ra khi:
- Nhiều người cùng tạo migration song song
- Merge code từ nhiều branch khác nhau

## Giải pháp

### Bước 1: Kiểm tra các heads hiện tại
```bash
cd backend
python -m alembic heads
```

Kết quả sẽ hiển thị:
```
01b690237671 (head)
1e6cf6cc7cd0 (head)
```

### Bước 2: Tạo migration merge
```bash
python -m alembic merge -m "merge_multiple_heads" 01b690237671 1e6cf6cc7cd0
```

**Lưu ý:** Thay `01b690237671` và `1e6cf6cc7cd0` bằng các revision IDs bạn thấy ở bước 1.

### Bước 3: Chạy migration
```bash
python -m alembic upgrade head
```

### Bước 4: Kiểm tra lại
```bash
python -m alembic current
python -m alembic heads
```

Bây giờ chỉ còn 1 head.

## Script tự động (Windows)

Tạo file `fix_multiple_heads.bat`:
```batch
@echo off
echo Checking heads...
python -m alembic heads

echo.
echo Creating merge migration...
python -m alembic merge -m "merge_multiple_heads" heads

echo.
echo Running migration...
python -m alembic upgrade head

echo.
echo Done! Checking result...
python -m alembic current
python -m alembic heads
```

Chạy:
```
fix_multiple_heads.bat
```

## Script tự động (Unix/Mac)

Tạo file `fix_multiple_heads.sh`:
```bash
#!/bin/bash
echo "Checking heads..."
python -m alembic heads

echo ""
echo "Creating merge migration..."
python -m alembic merge -m "merge_multiple_heads" heads

echo ""
echo "Running migration..."
python -m alembic upgrade head

echo ""
echo "Done! Checking result..."
python -m alembic current
python -m alembic heads
```

Chạy:
```bash
chmod +x fix_multiple_heads.sh
./fix_multiple_heads.sh
```

## Hoặc dùng script Python

File `scripts/fix_multiple_heads.py` đã có sẵn trong project.

Chạy:
```bash
python scripts/fix_multiple_heads.py
```
