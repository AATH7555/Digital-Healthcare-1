@echo off
TITLE Digital Healthcare - Database Setup
COLOR 0B
CLS

ECHO ========================================================
ECHO      DIGITAL HEALTHCARE SYSTEM - DATABASE SETUP
ECHO ========================================================
ECHO.
ECHO [*] Initializing database with sample data...
cd backend
node scripts/initializeDatabase.js
cd ..
ECHO.
ECHO [*] Database setup complete!
PAUSE