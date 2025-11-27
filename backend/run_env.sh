#!/bin/bash
# Dòng trên gọi là "shebang" — chỉ cho hệ thống biết dùng bash để chạy
echo "Tên file là: $1"
echo "Kích hoạt môi trường ảo..."
source venv/bin/activate
