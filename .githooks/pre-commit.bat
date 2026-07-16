@echo off
setlocal enabledelayedexpansion

REM Check if Git Bash is available
where bash >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Git Bash not found. Please install Git for Windows with Bash.
    exit /b 1
)

REM Run the bash script and show all output
bash "%~dp0pre-commit" %*
exit /b %errorlevel%
