@echo off
echo Stopping Digital Healthcare App...
echo.

REM Kill any node processes
taskkill /F /IM node.exe

echo App stopped successfully!
pause
