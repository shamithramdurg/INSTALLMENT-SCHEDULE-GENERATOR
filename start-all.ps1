# Start All Services Script for Installment Schedule Generator
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Starting Installment Schedule Generator" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

# 1. MySQL
$mysqlListening = Get-NetTCPConnection -LocalPort 3306 -ErrorAction SilentlyContinue
if (-not $mysqlListening) {
    Write-Host "[1/3] Starting MySQL on port 3306..." -ForegroundColor Yellow
    Start-Process -FilePath "C:\wamp64\bin\mysql\mysql8.4.7\bin\mysqld.exe" `
        -ArgumentList "--no-defaults", "--port=3306", "--basedir=C:\wamp64\bin\mysql\mysql8.4.7", "--datadir=C:\wamp64\bin\mysql\mysql8.4.7\data" `
        -WindowStyle Hidden
    Start-Sleep -Seconds 2
} else {
    Write-Host "[1/3] MySQL is already running on port 3306." -ForegroundColor Green
}

# 2. Java Backend
$backendListening = Get-NetTCPConnection -LocalPort 9090 -ErrorAction SilentlyContinue
if (-not $backendListening) {
    Write-Host "[2/3] Starting Java Spring Boot Backend on port 9090..." -ForegroundColor Yellow
    Start-Process -FilePath "java" `
        -ArgumentList "-jar", "target\installment-schedule-generator-1.0.0.jar" `
        -WorkingDirectory "E:\INSTALLMENT-SCHEDULE-GENERATOR\INSTALLMENT-SCHEDULE-GENERATOR\backend"
    Start-Sleep -Seconds 4
} else {
    Write-Host "[2/3] Java backend is already running on port 9090." -ForegroundColor Green
}

# 3. Node.js Frontend
$frontendListening = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if (-not $frontendListening) {
    Write-Host "[3/3] Starting Node.js frontend server on port 3000..." -ForegroundColor Yellow
    Start-Process -FilePath "cmd.exe" `
        -ArgumentList "/c", "npm start" `
        -WorkingDirectory "E:\INSTALLMENT-SCHEDULE-GENERATOR\INSTALLMENT-SCHEDULE-GENERATOR"
    Start-Sleep -Seconds 2
} else {
    Write-Host "[3/3] Frontend is already running on port 3000." -ForegroundColor Green
}

Write-Host "========================================================" -ForegroundColor Green
Write-Host "All systems operational!" -ForegroundColor Green
Write-Host "Frontend:    http://localhost:3000" -ForegroundColor White
Write-Host "Backend API: http://localhost:9090" -ForegroundColor White
Write-Host "Admin login: admin@example.com / Admin@123" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Green

