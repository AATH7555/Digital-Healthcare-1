@echo off
REM Start the application with proper error handling
cd /d "%~dp0"

TITLE Digital Healthcare System - Running
COLOR 0A
CLS

ECHO ========================================================
ECHO      DIGITAL HEALTHCARE SYSTEM - LAUNCHING
ECHO ========================================================
ECHO.

REM Check if node_modules exist in backend
IF NOT EXIST "backend\node_modules" (
    ECHO Installing backend dependencies...
    cd backend
    call npm install
    cd ..
)

REM Check if node_modules exist in frontend
IF NOT EXIST "frontend\node_modules" (
    ECHO Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

ECHO.
ECHO [*] Starting Backend Server (Port 5000)...
start "Backend - Port 5000" cmd /k "cd /d %cd%\backend && npm start"

TIMEOUT /T 3 /NOBREAK

ECHO [*] Starting Frontend Client (Port 3000)...
start "Frontend - Port 3000" cmd /k "cd /d %cd%\frontend && npm start"

ECHO.
ECHO [SUCCESS] Application is launching!
ECHO.
ECHO Backend: http://localhost:5000
ECHO Frontend: http://localhost:3000
ECHO.
PAUSE
