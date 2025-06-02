# PowerShell启动脚本
Clear-Host
Write-Host "Starting Metro Electromechanical Equipment System..." -ForegroundColor Green
Write-Host ""

# 检查目录
if (-not (Test-Path "server")) {
    Write-Host "Error: server directory not found!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
if (-not (Test-Path "client")) {
    Write-Host "Error: client directory not found!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Starting backend server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location server; node app.js"

Write-Host "Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

Write-Host "Starting frontend application..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location client; npm start"

Write-Host ""
Write-Host "Application started successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Blue
Write-Host "Backend:  http://localhost:5001" -ForegroundColor Blue
Write-Host ""
Read-Host "Press Enter to exit" 