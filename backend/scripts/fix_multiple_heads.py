"""Script tự động fix multiple heads trong Alembic.

Khi có nhiều migration heads, script này sẽ:
1. Kiểm tra và hiển thị các heads hiện tại
2. Tạo merge migration tự động
3. Chạy migration để merge các heads

Cách dùng:
    python scripts/fix_multiple_heads.py
"""

import subprocess
import sys
import re


def run_command(command, description):
    """Chạy command và trả về output."""
    print(f"\n{'='*60}")
    print(f"🔧 {description}")
    print(f"{'='*60}")
    
    try:
        result = subprocess.run(
            command,
            check=True,
            text=True,
            capture_output=True,
            shell=True
        )
        output = result.stdout + result.stderr
        print(output)
        return output, True
    except subprocess.CalledProcessError as e:
        output = e.stdout + e.stderr
        print(output)
        print(f"❌ Lỗi: {description}")
        return output, False


def get_heads():
    """Lấy danh sách heads từ alembic."""
    output, success = run_command(
        "python -m alembic heads",
        "Kiểm tra các heads hiện tại"
    )
    
    if not success:
        return []
    
    # Parse output để lấy revision IDs
    # Format: "01b690237671 (head)"
    heads = []
    for line in output.split('\n'):
        match = re.match(r'^([a-f0-9]+)\s+\(head\)', line.strip())
        if match:
            heads.append(match.group(1))
    
    return heads


def main():
    """Hàm chính."""
    print("\n" + "="*60)
    print("🔧 FIX MULTIPLE HEADS IN ALEMBIC")
    print("="*60)
    
    # Bước 1: Kiểm tra heads
    heads = get_heads()
    
    if len(heads) == 0:
        print("\n❌ Không thể lấy danh sách heads!")
        print("Vui lòng kiểm tra:")
        print("  - Database có đang chạy không?")
        print("  - Alembic có được cài đặt không?")
        sys.exit(1)
    elif len(heads) == 1:
        print(f"\n✅ Chỉ có 1 head: {heads[0]}")
        print("Không cần merge!")
        
        # Vẫn chạy upgrade để đảm bảo database up-to-date
        print("\n📦 Chạy upgrade để đảm bảo database cập nhật...")
        run_command(
            "python -m alembic upgrade head",
            "Upgrade database"
        )
        sys.exit(0)
    
    print(f"\n⚠️  Tìm thấy {len(heads)} heads:")
    for i, head in enumerate(heads, 1):
        print(f"  {i}. {head}")
    
    # Bước 2: Tạo merge migration
    print("\n📝 Đang tạo merge migration...")
    
    # Sử dụng "heads" để merge tất cả heads
    output, success = run_command(
        'python -m alembic merge -m "merge_multiple_heads" heads',
        "Tạo merge migration"
    )
    
    if not success:
        print("\n❌ Không thể tạo merge migration!")
        print("\nBạn có thể thử merge thủ công:")
        print(f"  python -m alembic merge -m \"merge_multiple_heads\" {' '.join(heads)}")
        sys.exit(1)
    
    # Bước 3: Chạy migration
    output, success = run_command(
        "python -m alembic upgrade head",
        "Chạy migration để merge heads"
    )
    
    if not success:
        print("\n❌ Migration thất bại!")
        sys.exit(1)
    
    # Bước 4: Kiểm tra kết quả
    print("\n📊 Kiểm tra kết quả...")
    
    run_command(
        "python -m alembic current",
        "Hiển thị revision hiện tại"
    )
    
    heads_after = get_heads()
    print(f"\n✅ Số heads sau khi merge: {len(heads_after)}")
    
    if len(heads_after) == 1:
        print(f"✅ Thành công! Hiện tại chỉ còn 1 head: {heads_after[0]}")
    else:
        print(f"⚠️  Vẫn còn {len(heads_after)} heads. Có thể cần merge lại.")
    
    print("\n" + "="*60)
    print("✅ HOÀN TẤT!")
    print("="*60)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Đã hủy bởi người dùng")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Lỗi không mong muốn: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
