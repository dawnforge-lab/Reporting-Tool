#!/bin/bash

echo "==================================="
echo " Digital Marketing Reporting Tool"
echo "       (Simple Mode)"
echo "==================================="
echo ""
echo "This version bypasses authentication for easier testing."
echo ""

# Get the absolute path of the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Python is not installed! Please install Python 3.9 or newer."
    echo "You can download it from https://www.python.org/downloads/"
    echo ""
    echo "For Mac users with Homebrew, you can run: brew install python"
    echo ""
    read -p "Press any key to exit..."
    exit 1
fi

# Create a virtual environment if it doesn't exist
if [ ! -d "${SCRIPT_DIR}/venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv "${SCRIPT_DIR}/venv"
fi

# Activate the virtual environment and install dependencies
echo "Installing dependencies..."
source "${SCRIPT_DIR}/venv/bin/activate"

# Install core dependencies (skip authentication packages)
echo "Installing core packages (skipping authentication packages)..."
python -m pip install --upgrade pip
python -m pip install fastapi uvicorn jinja2 python-dotenv aiofiles

# Check if .env file exists, create it if not
if [ ! -f "${SCRIPT_DIR}/.env" ]; then
    echo "Creating .env file..."
    cp "${SCRIPT_DIR}/.env.example" "${SCRIPT_DIR}/.env"
    echo ""
    echo "Please edit the .env file with your API keys before using the application!"
    echo "You can use any text editor like: nano ${SCRIPT_DIR}/.env"
    echo ""
fi

# Make script executable if needed
if [ ! -x "${SCRIPT_DIR}/simple_run.py" ]; then
    chmod +x "${SCRIPT_DIR}/simple_run.py"
fi

# Run the simplified application
echo "Starting the simplified application..."
python "${SCRIPT_DIR}/simple_run.py"

# If there's an error, keep the terminal open
if [ $? -ne 0 ]; then
    echo ""
    echo "An error occurred. Press any key to exit..."
    read -n 1
fi 