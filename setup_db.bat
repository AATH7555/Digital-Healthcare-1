<<<<<<< HEAD
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
=======
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
>>>>>>> 49e5cea132576c11fc2b308f67228cefe176a461
PAUSE