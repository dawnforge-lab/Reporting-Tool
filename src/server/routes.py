from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from typing import Dict, List, Optional, Any

from src.server.auth import (
    authenticate_user, 
    create_access_token, 
    get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from src.integrations.bigquery_connector import BigQueryConnector
from src.integrations.spreadsheet_connector import SpreadsheetConnector
from src.integrations.database_connector import DatabaseConnector
from src.ai.attribution_model import AttributionModel
from src.ai.report_generator import ReportGenerator

# Create router
router = APIRouter()

# Authentication endpoints
@router.post("/auth/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """Generate an access token for authentication."""
    user = authenticate_user(form_data.username, form_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"], "role": user["role"]},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/auth/me")
async def read_users_me(current_user: dict = Depends(get_current_user)):
    """Get information about the current user."""
    return current_user

# BigQuery endpoints
@router.get("/data-sources/bigquery/datasets")
async def list_bigquery_datasets(
    current_user: dict = Depends(get_current_user)
):
    """List all available BigQuery datasets."""
    connector = BigQueryConnector()
    return await connector.list_datasets()

@router.get("/data-sources/bigquery/tables/{dataset_id}")
async def list_bigquery_tables(
    dataset_id: str,
    current_user: dict = Depends(get_current_user)
):
    """List all tables in a BigQuery dataset."""
    connector = BigQueryConnector()
    return await connector.list_tables(dataset_id)

@router.post("/data-sources/bigquery/query")
async def execute_bigquery_query(
    query_params: Dict[str, Any] = Body(...),
    current_user: dict = Depends(get_current_user)
):
    """Execute a SQL query against BigQuery."""
    connector = BigQueryConnector()
    return await connector.execute_query(
        query_params.get("query", ""),
        max_bytes=query_params.get("max_bytes")
    )

# Google Spreadsheets endpoints
@router.get("/data-sources/spreadsheets/list")
async def list_spreadsheets(
    current_user: dict = Depends(get_current_user)
):
    """List all available Google Spreadsheets."""
    connector = SpreadsheetConnector()
    return await connector.list_spreadsheets()

@router.get("/data-sources/spreadsheets/{spreadsheet_id}/sheets")
async def list_sheets(
    spreadsheet_id: str,
    current_user: dict = Depends(get_current_user)
):
    """List all sheets in a Google Spreadsheet."""
    connector = SpreadsheetConnector()
    return await connector.list_sheets(spreadsheet_id)

@router.get("/data-sources/spreadsheets/{spreadsheet_id}/{sheet_name}")
async def get_sheet_data(
    spreadsheet_id: str,
    sheet_name: str,
    current_user: dict = Depends(get_current_user)
):
    """Get data from a specific sheet in a Google Spreadsheet."""
    connector = SpreadsheetConnector()
    return await connector.get_sheet_data(spreadsheet_id, sheet_name)

# Local database endpoints
@router.get("/data-sources/database/tables")
async def list_database_tables(
    current_user: dict = Depends(get_current_user)
):
    """List all tables in the local database."""
    connector = DatabaseConnector()
    return await connector.list_tables()

@router.post("/data-sources/database/query")
async def execute_database_query(
    query_params: Dict[str, Any] = Body(...),
    current_user: dict = Depends(get_current_user)
):
    """Execute a SQL query against the local database."""
    connector = DatabaseConnector()
    return await connector.execute_query(query_params.get("query", ""))

# AI and reporting endpoints
@router.post("/ai/attribution")
async def create_attribution_model(
    model_params: Dict[str, Any] = Body(...),
    current_user: dict = Depends(get_current_user)
):
    """Create a custom attribution model using AI."""
    attribution = AttributionModel()
    return await attribution.create_model(model_params)

@router.get("/reports/templates")
async def list_report_templates(
    current_user: dict = Depends(get_current_user)
):
    """List all available report templates."""
    generator = ReportGenerator()
    return await generator.list_templates()

@router.get("/reports/saved")
async def list_saved_reports(
    current_user: dict = Depends(get_current_user)
):
    """List all saved reports."""
    generator = ReportGenerator()
    return await generator.list_reports()

@router.delete("/reports/{report_id}")
async def delete_report(
    report_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a specific report."""
    generator = ReportGenerator()
    return await generator.delete_report(report_id) 