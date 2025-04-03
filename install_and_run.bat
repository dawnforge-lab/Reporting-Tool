@echo off
setlocal enabledelayedexpansion

echo ===================================
echo  Digital Marketing Reporting Tool
echo ===================================
echo.
echo Setting up the application...

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
echo Installing core packages...
python -m pip install --upgrade pip
python -m pip install -r "!CURRENT_DIR!\requirements.txt"

:: Install critical packages specifically and ensure they are installed correctly
echo Installing authentication packages directly...
python -m pip install python-jose==3.3.0 passlib==1.7.4

:: Verify jose is installed
python -c "import jose; print('✓ Jose installed successfully')" || (
    echo ERROR: Failed to install python-jose package
    echo Attempting alternative installation method...
    python -m pip install --force-reinstall python-jose==3.3.0
    python -c "import jose; print('✓ Jose now installed successfully')" || (
        echo CRITICAL ERROR: Could not install python-jose.
        echo Please run the following commands manually:
        echo python -m pip install python-jose==3.3.0 passlib==1.7.4
        echo.
        echo Press any key to exit...
        pause > nul
        exit /b 1
    )
)

:: Check if .env file exists, create it if not
if not exist "!CURRENT_DIR!\.env" (
    echo Creating .env file...
    copy "!CURRENT_DIR!\.env.example" "!CURRENT_DIR!\.env"
    echo.
    echo Please edit the .env file with your API keys before using the application!
    echo.
)

:: Run the application
echo Starting the application...
python "!CURRENT_DIR!\run.py"

:: Keep the window open if there's an error
if %errorlevel% neq 0 (
    echo.
    echo An error occurred. Press any key to exit...
    pause > nul
)

endlocal 