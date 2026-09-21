@echo off
:: Batch file cai dat khoi dong tu dong cung Windows (Run as administrator)
chcp 65001 >nul
title Cài đặt tự động khởi động cùng Windows
cd /d "%~dp0"

echo ===============================================================
echo     CẤU HÌNH TỰ ĐỘNG KHỞI ĐỘNG HỆ THỐNG GIAO BAN CÙNG WINDOWS
echo ===============================================================
echo.

net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [!] Vui lòng bấm CHUỘT PHẢI vào file này và chọn "Run as administrator"
    echo     (Chạy với quyền Quản trị viên)!
    echo.
    pause
    exit /b
)

schtasks /delete /tn "GiaoBanWebLAN" /f >nul 2>&1
schtasks /create /tn "GiaoBanWebLAN" /tr "\"%~dp0Chay-Web-Giao-Ban-LAN.bat\"" /sc onstart /ru SYSTEM /rl HIGHEST /f

echo.
echo [OK] ĐÃ CÀI ĐẶT TỰ ĐỘNG KHỞI ĐỘNG THÀNH CÔNG!
echo Mỗi khi máy chủ bật lên, Web Giao Ban sẽ tự động chạy phục vụ mạng nội bộ.
echo.
pause
