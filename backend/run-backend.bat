@echo off
title Mitreno Go Backend Engine
echo ===================================================
echo   Starting Mitreno High-Performance Go Backend...
echo   Port: http://localhost:8080
echo ===================================================
cd /d "%~dp0"
if exist main.exe (
    echo Running compiled binary: main.exe
    .\main.exe
) else (
    echo Building and running Go backend...
    go run ./cmd/api/main.go
)
pause
