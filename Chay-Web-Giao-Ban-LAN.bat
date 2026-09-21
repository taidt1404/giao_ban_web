@echo off
chcp 65001 >nul
title Hệ Thống Báo Cáo Giao Ban Bệnh Viện - Mạng Nội Bộ (LAN)
cd /d "%~dp0"

echo ===============================================================
echo     ĐANG KHỞI ĐỘNG HỆ THỐNG GIAO BAN BỆNH VIỆN - MẠNG NỘI BỘ
echo ===============================================================
echo.

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [LỖI] Máy chủ này CHƯA CÀI ĐẶT Node.js!
    echo Vui lòng tải và cài đặt Node.js tại https://nodejs.org (chọn bản LTS), sau đó chạy lại file này.
    echo.
    pause
    exit /b 1
)

if not exist "dist\index.html" (
    echo [1/2] Chưa có bản build dist, đang tiến hành đóng gói...
    call npm run build
    echo.
)

echo [2/2] Đang kích hoạt máy chủ mạng nội bộ...
echo.
node lan-server.js
pause

