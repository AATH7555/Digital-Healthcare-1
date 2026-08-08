@echo off
REM Complete Error Checking and Validation Script

cd /d "%~dp0"
cls

ECHO.
ECHO ====================================================
ECHO   DIGITAL HEALTHCARE SYSTEM - VALIDATION ^& STARTUP
ECHO ====================================================
ECHO.

REM --- DEPENDENCY INSTALLATION ---
ECHO [STEP 1/4] Checking and installing dependencies...
ECHO.

IF NOT EXIST "backend\node_modules" (
    ECHO Installing backend dependencies...
    cd backend
    call npm install --silent
    IF ERRORLEVEL 1 (
        ECHO [ERROR] Backend npm install failed
        cd ..
        PAUSE
        EXIT /B 1
    )
    cd ..
)

IF NOT EXIST "frontend\node_modules" (
    ECHO Installing frontend dependencies...
    cd frontend
    call npm install --silent
    IF ERRORLEVEL 1 (
        ECHO [ERROR] Frontend npm install failed
        cd ..
        PAUSE
        EXIT /B 1
    )
    cd ..
)
ECHO [OK] Dependencies installed
ECHO.

REM --- ENVIRONMENT CONFIGURATION ---
ECHO [STEP 2/4] Checking environment configuration...
ECHO.

IF NOT EXIST "backend\.env" (
    IF EXIST "backend\.env.example" (
        copy "backend\.env.example" "backend\.env" > nul
        ECHO [OK] Environment file created
    ) ELSE (
        ECHO [ERROR] .env.example not found
        PAUSE
        EXIT /B 1
    )
) ELSE (
    ECHO [OK] Environment file exists
)
ECHO.

REM --- VALIDATION ---
ECHO [STEP 3/4] Validating all files...
ECHO.

REM Check backend server.js
cd backend
FOR /F "delims=" %%A IN ('node --check server.js 2^>^&1') DO (
    IF "%%A" NEQ "" (
        ECHO [ERROR] Syntax error in server.js
        ECHO %%A
        cd ..
        PAUSE
        EXIT /B 1
    )
)
cd ..
ECHO [OK] Backend files validated
ECHO.

REM --- STARTUP ---
ECHO [STEP 4/4] Starting application...
ECHO.

ECHO [*] Launching Backend Server (Port 5000)...
start "Backend - Digital Healthcare API" cmd /k "cd /d %cd%\backend && npm start"

TIMEOUT /T 3 /NOBREAK

ECHO [*] Launching Frontend Client (Port 3000)...
start "Frontend - Digital Healthcare App" cmd /k "cd /d %cd%\frontend && npm start"

ECHO.
ECHO ====================================================
ECHO   [SUCCESS] Application started successfully!
ECHO ====================================================
ECHO.
ECHO Application URLs:
ECHO   Frontend: http://localhost:3000
ECHO   Backend:  http://localhost:5000
ECHO.
ECHO Login Credentials:
ECHO   Doctor:
ECHO     Email: doctor@gmail.com
ECHO     Password: health123
ECHO.
ECHO [Note] New windows will open for both services.
ECHO Please wait 10-15 seconds for the app to fully load.
ECHO.
PAUSE
