@echo off
:: Batch file tu dong mo cong 8080 Windows Firewall (chay voi quyen Administrator)
chcp 65001 >nul
title Mở Cổng 8080 - Windows Firewall

echo ===============================================================
echo     ĐANG THIẾT LẬP MỞ CỔNG 8080 CHO MẠNG NỘI BỘ BỆNH VIỆN
echo ===============================================================
echo.

:: Kiem tra quyen Admin
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [!] Vui lòng bấm CHUỘT PHẢI vào file này và chọn "Run as administrator"
    echo     (Chạy với quyền Quản trị viên)!
    echo.
    pause
    exit /b
)

netsh advfirewall firewall delete rule name="Giao Ban Noi Bo (Port 8080)" >nul 2>&1
netsh advfirewall firewall add rule name="Giao Ban Noi Bo (Port 8080)" dir=in action=allow protocol=TCP localport=8080

echo [OK] ĐÃ MỞ CỔNG 8080 THÀNH CÔNG!
echo Các máy tính trong mạng nội bộ hiện đã có thể kết nối vào máy chủ.
echo.
pause
