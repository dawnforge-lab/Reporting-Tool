@echo off
setlocal enabledelayedexpansion

echo ===================================
echo  Digital Marketing Reporting Tool
echo       (Simple Mode)
echo ===================================
echo.
echo This version bypasses authentication for easier testing.
echo.

:: Get current directory with proper handling of spaces
set "CURRENT_DIR=%~dp0"
set "CURRENT_DIR=!CURRENT_DIR:~0,-1!"

:: Check if Python is installed
python --version > nul 2>&1
if %errorlevel% neq 0 (
    echo Python is not installed! Please install Python 3.9 or newer.
    echo You can download it from https://www.python.org/downloads/
    echo.
    echo Press any key to exit...
    pause > nul
    exit /b 1
)

:: Create a virtual environment if it doesn't exist
if not exist "!CURRENT_DIR!\venv" (
    echo Creating virtual environment...
    python -m venv "!CURRENT_DIR!\venv"
)

:: Activate the virtual environment and install dependencies
echo Installing dependencies...
call "!CURRENT_DIR!\venv\Scripts\activate.bat"

:: Install core dependencies
echo Installing core packages (skipping authentication packages)...
python -m pip install --upgrade pip
python -m pip install fastapi uvicorn jinja2 python-dotenv aiofiles

:: Check if .env file exists, create it if not
if not exist "!CURRENT_DIR!\.env" (
    echo Creating .env file...
    copy "!CURRENT_DIR!\.env.example" "!CURRENT_DIR!\.env"
    echo.
    echo Please edit the .env file with your API keys before using the application!
    echo.
)

:: Run the simplified application
echo Starting the simplified application...
python "!CURRENT_DIR!\simple_run.py"

:: Keep the window open if there's an error
if %errorlevel% neq 0 (
    echo.
    echo An error occurred. Press any key to exit...
    pause > nul
)

endlocal 