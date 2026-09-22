@echo off
title NTRO Oil Spill Detection & Vessel Attribution System (SIH26143)
echo ======================================================================
echo   NTRO SATELLITE OIL SPILL DETECTION & VESSEL ATTRIBUTION SYSTEM (SIH26143)
echo ======================================================================
echo [*] Starting Python FastAPI Backend (STAC, ML, Marine Weather) on port 8000...
start "NTRO Backend API" cmd /k "python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000"

echo [*] Starting React Vite Frontend (Leaflet GIS, OpenSeaMap) on port 3000...
start "NTRO React Frontend" cmd /k "node node_modules/vite/bin/vite.js --port 3000"

echo [i] Waiting for servers to initialize...
timeout /t 3 /nobreak >nul

echo [+] Opening NTRO Surveillance Dashboard in Browser...
start http://localhost:3000

echo ======================================================================
echo   SYSTEM IS ONLINE AND RUNNING!
echo   * Web Dashboard:  http://localhost:3000
echo   * REST API:       http://127.0.0.1:8000
echo   * API Docs:       http://127.0.0.1:8000/docs
echo ======================================================================
pause
