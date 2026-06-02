@echo off
title SuperBookingApp Dev Launcher
echo ===================================================
echo   Starting SuperBookingApp Development Servers...
echo ===================================================
echo.

:: Start Backend Server
echo [1/2] Launching Django Backend (port 8000)...
start "SuperBooking Backend" cmd /k "echo [BACKEND] Starting Django server... && cd backend && ..\env\Scripts\python.exe manage.py runserver --settings=backend.settings.dev"

:: Start Frontend Server
echo [2/2] Launching Vite Frontend (port 5173)...
start "SuperBooking Frontend" cmd /k "echo [FRONTEND] Starting Vite dev server... && cd frontend && npm run dev"

echo.
echo ===================================================
echo   All servers launched!
echo   Close the newly opened windows to stop them.
echo ===================================================
echo.
pause
