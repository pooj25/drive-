@echo off
echo ========================================================
echo Starting PixelVault Full-Stack Application
echo Backend: Laravel on http://127.0.0.1:8000
echo Frontend: React Vite on http://localhost:5173
echo ========================================================

start "PixelVault Backend (Laravel)" cmd /k "cd backend && php artisan serve --port=8000"
start "PixelVault Frontend (Vite)" cmd /k "cd frontend && npm run dev"

echo Services launched! Open http://localhost:5173 in your browser.
pause
