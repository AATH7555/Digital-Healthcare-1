@echo off
REM Restart Backend Server with Vaccination Fix
echo.
echo ===================================================
echo 🔄 RESTARTING BACKEND WITH VACCINATION FIX
echo ===================================================
echo.

REM Kill existing Node processes
echo ⏹️  Stopping existing backend server...
taskkill /F /IM node.exe /FI "CommandLine *backend*" 2>nul

REM Wait a moment
timeout /t 2 /nobreak

REM Start backend
echo.
echo ▶️  Starting backend server...
cd /d "%~dp0backend"
npm start

echo.
echo ===================================================
echo ✅ Backend started with updated Vaccination schema
echo ===================================================
echo.
