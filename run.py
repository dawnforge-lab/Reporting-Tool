#!/usr/bin/env python
import os
import sys
import time
import webbrowser
from subprocess import Popen, PIPE, run
import pkg_resources

# List of required packages
REQUIRED_PACKAGES = [
    "fastapi", "uvicorn", "pydantic", "pandas", "plotly", 
    "numpy", "openai", "python-dotenv", "requests", "jinja2",
    "python-jose", "passlib", "langchain", "httpx", "sqlalchemy",
    "aiosqlite", "python-multipart"
]

def install_package(package):
    """Install a single package using pip."""
    try:
        print(f"Installing {package}...")
        run([sys.executable, "-m", "pip", "install", package], check=True)
        return True
    except Exception as e:
        print(f"Error installing {package}: {str(e)}")
        return False

def check_dependencies():
    """Check if all required dependencies are installed."""
    missing = []
    for package in REQUIRED_PACKAGES:
        try:
            pkg_resources.get_distribution(package)
        except pkg_resources.DistributionNotFound:
            missing.append(package)
    
    if missing:
        print("Missing required dependencies: " + ", ".join(missing))
        try:
            print("Attempting to install missing dependencies...")
            for package in missing:
                install_package(package)
            print("Dependencies installed successfully!")
            
            # Reload pkg_resources to reflect newly installed packages
            import importlib
            importlib.reload(pkg_resources)
        except Exception as e:
            print(f"Error installing dependencies: {str(e)}")
            print("\nPlease run the application using install_and_run.bat instead.")
            time.sleep(5)
            sys.exit(1)

def setup_app():
    """Set up the application before starting."""
    # Check dependencies first
    check_dependencies()
    
    try:
        # Now we can safely import these
        from dotenv import load_dotenv
        import uvicorn
        
        # Load environment variables
        load_dotenv()
        
        # Create necessary directories
        dirs = [
            "data",
            "data/reports",
            "data/models",
            "src/reports/templates",
            "src/client/templates",
            "src/client/static/css",
            "src/client/static/js"
        ]
        
        for directory in dirs:
            os.makedirs(directory, exist_ok=True)
        
        # Create .env file if it doesn't exist
        if not os.path.exists(".env") and os.path.exists(".env.example"):
            print("Creating default .env file from example...")
            with open(".env.example", "r") as example, open(".env", "w") as env:
                env.write(example.read())
            print("Created .env file. Please edit it with your API keys!")
            print("The application will continue, but some features may not work correctly.")
            time.sleep(3)
        
        print("Application setup complete.")
        
    except Exception as e:
        print(f"Error during setup: {str(e)}")
        print("\nPlease run the application using install_and_run.bat instead.")
        time.sleep(5)
        sys.exit(1)

def run_app():
    """Run the FastAPI application."""
    try:
        import uvicorn
        
        print("Starting Digital Marketing Reporting Tool...")
        print("Opening browser...")
        
        # Open browser after a short delay
        def open_browser():
            time.sleep(2)  # Wait for server to start
            webbrowser.open("http://localhost:8000")
        
        # Start browser in a new thread
        import threading
        threading.Thread(target=open_browser).start()
        
        # Run the application with uvicorn
        try:
            uvicorn.run(
                "src.server.main:app",
                host="0.0.0.0",
                port=8000,
                reload=True
            )
        except ModuleNotFoundError as e:
            # If a module is not found, try to install it
            missing_module = str(e).split("'")[1] if "'" in str(e) else str(e).split("No module named ")[1]
            print(f"\nMissing module: {missing_module}")
            
            if missing_module == "jose":
                package = "python-jose"
            elif missing_module == "passlib":
                package = "passlib"
            else:
                package = missing_module
                
            print(f"Trying to install {package}...")
            if install_package(package):
                print(f"Successfully installed {package}. Restarting application...")
                time.sleep(2)
                # Restart the application
                os.execv(sys.executable, [sys.executable] + sys.argv)
            else:
                print(f"Failed to install {package}. Please install it manually.")
                sys.exit(1)
        
    except Exception as e:
        print(f"Error starting application: {str(e)}")
        print("\nPlease run the application using install_and_run.bat instead.")
        time.sleep(5)
        sys.exit(1)

if __name__ == "__main__":
    # Set up the application
    setup_app()
    
    # Run the application
    run_app() 