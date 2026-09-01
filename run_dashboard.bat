@echo off
echo ========================================================
echo   Starting ETS Employee Dashboard Full-Stack System
echo ========================================================
echo.
echo 1. Starting Backend Server on http://127.0.0.1:8000 ...
start "ETS Backend (FastAPI)" cmd /k "python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 2 /nobreak >nul

echo 2. Starting Frontend on http://localhost:3036 ...
start "ETS Frontend (React Vite)" cmd /k "cd /d "%~dp0frontend" ^&^& npm run dev"

echo.
echo ========================================================
echo   Both servers launched successfully!
echo   - Frontend: http://localhost:3036
echo   - Backend:  http://127.0.0.1:8000
echo ========================================================
