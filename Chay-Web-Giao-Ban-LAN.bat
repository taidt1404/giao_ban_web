@echo off
chcp 65001 >nul
title Hệ Thống Báo Cáo Giao Ban Bệnh Viện - Mạng Nội Bộ (LAN)
cd /d "%~dp0"

echo ===============================================================
echo     ĐANG KHỞI ĐỘNG HỆ THỐNG GIAO BAN BỆNH VIỆN - MẠNG NỘI BỘ
echo ===============================================================
echo.

if not exist "dist\index.html" (
    echo [1/2] Chưa có bản build dist, đang tiến hành đóng gói...
    call npm run build
    echo.
)

echo [2/2] Đang kích hoạt máy chủ mạng nội bộ...
echo.
node lan-server.js
pause
