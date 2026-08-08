@echo off
REM Change directory to the script's location to ensure paths are correct
cd /d "%~dp0"

TITLE Digital Healthcare System - Run
COLOR 0A
CLS

ECHO ========================================================
ECHO      DIGITAL HEALTHCARE SYSTEM - STARTING
ECHO ========================================================
ECHO.

REM --- BACKEND SETUP ---
ECHO [*] Checking Backend...

IF NOT EXIST "backend\node_modules" (
    ECHO [!] Backend dependencies not found. Installing...
    cd backend
    call npm install
    cd ..
)

IF NOT EXIST "backend\.env" (
    ECHO [!] Backend .env not found. Creating from example...
    copy "backend\.env.example" "backend\.env"
)

REM --- FRONTEND SETUP ---
ECHO [*] Checking Frontend...

IF NOT EXIST "frontend\node_modules" (
    ECHO [!] Frontend dependencies not found. Installing...
    cd frontend
    call npm install
    cd ..
)

REM --- START SERVERS ---
ECHO.
ECHO [*] Starting Backend Server (Port 5000)...
start "Backend Server" cmd /k "cd backend && npm run dev"

ECHO [*] Starting Frontend Client (Port 3000)...
start "Frontend Client" cmd /k "cd frontend && npm start"

ECHO.
ECHO [SUCCESS] Application launching! Check the new windows.
PAUSE