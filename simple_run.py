#!/usr/bin/env python
"""
Simplified application launcher that bypasses authentication issues.
This version doesn't require the jose package for JWT authentication.
"""

import os
import sys
import webbrowser
import time
from pathlib import Path
from dotenv import load_dotenv

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

# Import FastAPI modules
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import uvicorn

# Create FastAPI app
app = FastAPI(
    title="Digital Marketing Reporting Tool (Simple Mode)",
    description="A multichannel reporting tool with AI-powered insights",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files and templates
app.mount("/static", StaticFiles(directory="src/client/static"), name="static")
templates = Jinja2Templates(directory="src/client/templates")

@app.get("/")
async def home(request: Request):
    """Serve the main application UI."""
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/health")
async def health_check():
    """API health check endpoint."""
    return {"status": "ok", "version": app.version}

print("Starting Digital Marketing Reporting Tool (Simple Mode)...")
print("Opening browser...")

# Open browser after a short delay
def open_browser():
    time.sleep(2)  # Wait for server to start
    webbrowser.open("http://localhost:8000")

# Start browser in a new thread
import threading
threading.Thread(target=open_browser).start()

# Run the application
if __name__ == "__main__":
    uvicorn.run(
        "simple_run:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    ) 