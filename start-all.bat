@echo off
echo ========================================================
echo Starting Installment Schedule Generator
echo ========================================================

echo [1/3] Starting MySQL Server (if not already running)...
start /B "" "C:\wamp64\bin\mysql\mysql8.4.7\bin\mysqld.exe" --no-defaults --port=3306 --basedir="C:\wamp64\bin\mysql\mysql8.4.7" --datadir="C:\wamp64\bin\mysql\mysql8.4.7\data"

timeout /t 2 /nobreak > nul

echo [2/3] Starting Java Spring Boot Backend (Port 9090)...
start "Java Backend (Port 9090)" /D "E:\INSTALLMENT-SCHEDULE-GENERATOR\INSTALLMENT-SCHEDULE-GENERATOR\backend" java -jar target\installment-schedule-generator-1.0.0.jar

timeout /t 3 /nobreak > nul

echo [3/3] Starting Frontend Server (Port 3000)...
start "Frontend Web Server (Port 3000)" /D "E:\INSTALLMENT-SCHEDULE-GENERATOR\INSTALLMENT-SCHEDULE-GENERATOR" npm start

echo.
echo ========================================================
echo All services launched!
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:9090
echo MySQL Port: 3306
echo Admin login: admin@example.com / Admin@123
echo ========================================================

