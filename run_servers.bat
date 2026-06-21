@echo off
title SuperBookingApp Launcher
echo ===================================================
echo   Welcome to SuperBookingApp Launcher
echo ===================================================
echo.
echo Choose the running environment:
echo [1] Development Mode - Local SQLite DB
echo [2] Production Mode - Render PostgreSQL DB / Supabase
echo.
set /p choice="Enter your choice (1 or 2): "

set "settings=backend.settings.dev"
if "%choice%"=="2" (
    set "settings=backend.settings.prod"
    echo Starting in PRODUCTION mode...
) else (
    echo Starting in DEVELOPMENT mode...
)

echo.
:: Start Backend Server
echo [1/2] Launching Django Backend on port 8000...
start "SuperBooking Backend" cmd /k "echo [BACKEND] Starting Django server... && cd backend && ..\env\Scripts\python.exe manage.py runserver --settings=%settings%"

:: Start Frontend Server
echo [2/2] Launching Vite Frontend on port 5173...
start "SuperBooking Frontend" cmd /k "echo [FRONTEND] Starting Vite dev server... && cd frontend && npm run dev"

echo.
echo ===================================================
echo   All servers launched!
echo   Close the newly opened windows to stop them.
echo ===================================================
echo.
pause
