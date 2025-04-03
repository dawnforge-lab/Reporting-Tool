import os
import uvicorn
from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from dotenv import load_dotenv
from typing import Dict, List, Optional, Any
import json
import asyncio

# Load environment variables
load_dotenv()

# Import local modules
from src.server.routes import router as api_router
from src.server.auth import get_current_user
from src.integrations.bigquery_connector import BigQueryConnector
from src.integrations.spreadsheet_connector import SpreadsheetConnector
from src.integrations.database_connector import DatabaseConnector
from src.ai.report_generator import ReportGenerator
from src.utils.config import AppConfig

# Create FastAPI app
app = FastAPI(
    title="Digital Marketing Reporting Tool",
    description="A multichannel reporting tool with AI-powered insights",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files and templates
app.mount("/static", StaticFiles(directory="src/client/static"), name="static")
templates = Jinja2Templates(directory="src/client/templates")

# Include API routers
app.include_router(api_router, prefix="/api", tags=["api"])

# Initialize config
config = AppConfig()

# Initialize connectors
bigquery = BigQueryConnector()
spreadsheet = SpreadsheetConnector()
database = DatabaseConnector()
report_generator = ReportGenerator()

@app.get("/")
async def home(request: Request):
    """Serve the main application UI."""
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/health")
async def health_check():
    """API health check endpoint."""
    return {"status": "ok", "version": app.version}

@app.get("/config")
async def get_config(current_user: dict = Depends(get_current_user)):
    """Get application configuration."""
    return config.get_config()

@app.post("/config")
async def update_config(
    config_data: Dict[str, Any],
    current_user: dict = Depends(get_current_user)
):
    """Update application configuration."""
    return config.update_config(config_data)

@app.get("/connectors/status")
async def check_connectors(current_user: dict = Depends(get_current_user)):
    """Check the status of all data connectors."""
    results = {}
    
    # Check BigQuery connection
    try:
        bigquery_status = await bigquery.test_connection()
        results["bigquery"] = bigquery_status
    except Exception as e:
        results["bigquery"] = {"status": "error", "message": str(e)}
    
    # Check Spreadsheet connection
    try:
        spreadsheet_status = await spreadsheet.test_connection()
        results["spreadsheet"] = spreadsheet_status
    except Exception as e:
        results["spreadsheet"] = {"status": "error", "message": str(e)}
    
    # Check Database connection
    try:
        database_status = await database.test_connection()
        results["database"] = database_status
    except Exception as e:
        results["database"] = {"status": "error", "message": str(e)}
    
    return results

@app.post("/reports/generate")
async def generate_report(
    report_config: Dict[str, Any],
    current_user: dict = Depends(get_current_user)
):
    """Generate a marketing report based on the provided configuration."""
    try:
        # Generate the report
        report = await report_generator.generate(
            report_config,
            bigquery=bigquery,
            spreadsheet=spreadsheet,
            database=database
        )
        
        return {
            "status": "success",
            "report_id": report.id,
            "report_url": f"/reports/{report.id}",
            "message": "Report generated successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/reports/{report_id}")
async def view_report(report_id: str, request: Request):
    """View a generated report."""
    try:
        # Load report data
        report_data = report_generator.get_report(report_id)
        
        # Return the report HTML
        return templates.TemplateResponse(
            "report.html", 
            {"request": request, "report": report_data}
        )
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Report not found: {str(e)}")

if __name__ == "__main__":
    # Run the API with uvicorn
    uvicorn.run(
        "src.server.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    ) 