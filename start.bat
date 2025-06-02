@echo off
chcp 65001 > nul
cls
echo Starting Metro Electromechanical Equipment System...
echo.

echo Checking directories...
if not exist "server" (
    echo Error: server directory not found!
    pause
    exit /b 1
)
if not exist "client" (
    echo Error: client directory not found!
    pause
    exit /b 1
)

echo Starting backend server...
start "Backend Server" cmd /k "cd server && node app.js"

echo Waiting for backend to start...
timeout /t 8 /nobreak > nul

echo Starting frontend application...
start "Frontend App" cmd /k "cd client && npm start"

echo.
echo Application started successfully!
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5001
echo.
echo Press any key to exit...
pause > nul 