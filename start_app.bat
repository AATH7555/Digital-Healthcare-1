<<<<<<< HEAD
@echo off
echo Starting Digital Healthcare App...
echo.

REM Start backend
echo Starting backend server on port 5000...
start cmd /k "cd backend && npm run dev"

REM Wait a few seconds
timeout /t 3

REM Start frontend
echo Starting frontend on port 3000...
start cmd /k "cd frontend && npm start"

REM Wait for servers to start
timeout /t 5

echo.
echo ============================================
echo App is starting!
echo.
echo Frontend: http://localhost:3000
echo Backend: http://localhost:5000
echo.
echo ============================================
pause
echo.
echo To access from another device on your network:
echo 1) Find this machine's IP address: run `ipconfig` and look for "IPv4 Address".
echo 2) Open: http://<YOUR_IP>:3000  (replace <YOUR_IP> with the IPv4 address)
echo.
echo To expose the frontend publicly you can use ngrok (optional):
echo - Install ngrok from https://ngrok.com and run `start_ngrok.bat` in the project root.
=======
@echo off
echo Starting Digital Healthcare App...
echo.

REM Start backend
echo Starting backend server on port 5000...
start cmd /k "cd backend && npm run dev"

REM Wait a few seconds
timeout /t 3

REM Start frontend
echo Starting frontend on port 3000...
start cmd /k "cd frontend && npm start"

REM Wait for servers to start
timeout /t 5

echo.
echo ============================================
echo App is starting!
echo.
echo Frontend: http://localhost:3000
echo Backend: http://localhost:5000
echo.
echo ============================================
pause
echo.
echo To access from another device on your network:
echo 1) Find this machine's IP address: run `ipconfig` and look for "IPv4 Address".
echo 2) Open: http://<YOUR_IP>:3000  (replace <YOUR_IP> with the IPv4 address)
echo.
echo To expose the frontend publicly you can use ngrok (optional):
echo - Install ngrok from https://ngrok.com and run `start_ngrok.bat` in the project root.
>>>>>>> 49e5cea132576c11fc2b308f67228cefe176a461
