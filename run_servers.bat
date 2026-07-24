@echo off
title SuperBookingApp Launcher
echo ===================================================
echo   Welcome to SuperBookingApp Launcher
echo ===================================================
echo.

:: Check if setup is complete
set SETUP_COMPLETE=1

if not exist "frontend\node_modules\" set SETUP_COMPLETE=0
if not exist "env\" set SETUP_COMPLETE=0
if not exist "backend\db.sqlite3" set SETUP_COMPLETE=0

if "%SETUP_COMPLETE%"=="0" (
    echo [SETUP] Setup is incomplete. Running installation and seeding steps...
    echo.
    
    :: Install Frontend Dependencies
    if not exist "frontend\node_modules\" (
        echo [SETUP] Installing Frontend dependencies via npm install...
        cd frontend
        call npm install
        cd ..
    )
    
    :: Create Virtual Environment if not exists
    if not exist "env\" (
        echo [SETUP] Creating Python Virtual Environment...
        python -m venv env
    )
    
    :: Install Backend Dependencies
    echo [SETUP] Installing Backend dependencies via pip install...
    call env\Scripts\pip.exe install -r backend\requirements.txt
    
    :: Run Migrations and Import Data
    echo [SETUP] Running Django migrations and importing demo data...
    cd backend
    ..\env\Scripts\python.exe manage.py migrate
    set DJANGO_SUPERUSER_PASSWORD=superbookingapp
    ..\env\Scripts\python.exe manage.py createsuperuser --noinput --username=ZequeAdmin --email=admin@superbookingapp.com
    set DJANGO_SUPERUSER_PASSWORD=
    ..\env\Scripts\python.exe manage.py import_demo_data
    cd ..
    
    echo.
    echo [SETUP] Setup complete!
    echo ===================================================
    echo.
)

echo Starting in DEVELOPMENT mode...
echo.

:: Start Backend Server
echo [1/2] Launching Django Backend on port 8000...
start "SuperBooking Backend" cmd /k "echo [BACKEND] Starting Django server... && cd backend && ..\env\Scripts\python.exe manage.py runserver --settings=backend.settings.dev"

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
