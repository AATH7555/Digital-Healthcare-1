@echo off
echo Starting ngrok tunnel for frontend (port 3000)...
REM Make sure ngrok is installed and authtoken set: https://ngrok.com
start cmd /k "ngrok http 3000"
echo ngrok started - check the terminal for the public URL.
pause
