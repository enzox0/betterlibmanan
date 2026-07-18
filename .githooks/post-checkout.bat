@echo off
setlocal enabledelayedexpansion

where bash >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Git Bash not found.
    exit /b 1
)

bash "%~dp0post-checkout" %*
exit /b %errorlevel%
