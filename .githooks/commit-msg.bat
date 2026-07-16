@echo off
setlocal enabledelayedexpansion

where bash >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Git Bash not found. Please install Git for Windows with Bash.
    exit /b 1
)

bash "%~dp0commit-msg" %*
exit /b %errorlevel%
