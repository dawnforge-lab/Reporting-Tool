import os
import json
import asyncio
from typing import Dict, List, Optional, Any, Union
import gspread
from google.oauth2.service_account import Credentials
from dotenv import load_dotenv
import pandas as pd

# Load environment variables
load_dotenv()

class SpreadsheetConnector:
    """
    Connector for Google Spreadsheets integration.
    Handles authentication, spreadsheet access, and data retrieval.
    """
    
    def __init__(self):
        """Initialize the Google Spreadsheets connector."""
        self.client = self._get_client()
    
    def _get_client(self):
        """
        Get a Google Spreadsheets client instance.
        Uses service account JSON file path from environment variable.
        """
        key_file = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
        
        if key_file and os.path.exists(key_file):
            scope = [
                'https://spreadsheets.google.com/feeds',
                'https://www.googleapis.com/auth/drive'
            ]
            credentials = Credentials.from_service_account_file(key_file, scopes=scope)
            return gspread.authorize(credentials)
        else:
            raise ValueError("Google credentials not found. Check GOOGLE_APPLICATION_CREDENTIALS environment variable.")
    
    async def test_connection(self) -> Dict[str, Any]:
        """
        Test the Google Spreadsheets connection.
        
        Returns:
            Dict with connection status.
        """
        try:
            # Try to access spreadsheets
            spreadsheets = self.client.list_spreadsheet_files()
            
            return {
                "status": "connected",
                "spreadsheet_count": len(spreadsheets)
            }
        except Exception as e:
            return {
                "status": "error",
                "message": str(e)
            }
    
    async def list_spreadsheets(self) -> List[Dict[str, Any]]:
        """
        Get a list of all accessible spreadsheets.
        
        Returns:
            List of spreadsheet information dictionaries.
        """
        spreadsheets = self.client.list_spreadsheet_files()
        result = []
        
        for sheet in spreadsheets:
            result.append({
                "id": sheet['id'],
                "name": sheet['name'],
                "updated": sheet.get('modifiedTime', ''),
                "url": f"https://docs.google.com/spreadsheets/d/{sheet['id']}"
            })
        
        return result
    
    async def list_sheets(self, spreadsheet_id: str) -> List[Dict[str, Any]]:
        """
        Get a list of all sheets in a spreadsheet.
        
        Args:
            spreadsheet_id: The ID of the spreadsheet.
        
        Returns:
            List of sheet information dictionaries.
        """
        try:
            spreadsheet = self.client.open_by_key(spreadsheet_id)
            worksheets = spreadsheet.worksheets()
            result = []
            
            for sheet in worksheets:
                result.append({
                    "id": sheet.id,
                    "title": sheet.title,
                    "index": sheet.index,
                    "row_count": sheet.row_count,
                    "col_count": sheet.col_count
                })
            
            return result
        except Exception as e:
            raise ValueError(f"Error accessing spreadsheet: {str(e)}")
    
    async def get_sheet_data(self, spreadsheet_id: str, sheet_name: str) -> Dict[str, Any]:
        """
        Get data from a specific sheet in a spreadsheet.
        
        Args:
            spreadsheet_id: The ID of the spreadsheet.
            sheet_name: The name of the sheet.
        
        Returns:
            Dictionary with sheet data and metadata.
        """
        try:
            spreadsheet = self.client.open_by_key(spreadsheet_id)
            worksheet = spreadsheet.worksheet(sheet_name)
            
            # Get all data including headers
            data = worksheet.get_all_values()
            
            if not data:
                return {
                    "columns": [],
                    "rows": [],
                    "row_count": 0,
                    "col_count": 0
                }
            
            # Extract headers (first row)
            headers = data[0]
            
            # Extract rows (skip the header row)
            rows = []
            for row_data in data[1:]:
                row_dict = {}
                for i, value in enumerate(row_data):
                    if i < len(headers):
                        row_dict[headers[i]] = value
                rows.append(row_dict)
            
            return {
                "columns": headers,
                "rows": rows,
                "row_count": len(rows),
                "col_count": len(headers)
            }
        except Exception as e:
            raise ValueError(f"Error retrieving sheet data: {str(e)}")
    
    async def upload_data(self, spreadsheet_id: str, sheet_name: str, data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Upload data to a specific sheet in a spreadsheet.
        
        Args:
            spreadsheet_id: The ID of the spreadsheet.
            sheet_name: The name of the sheet.
            data: List of dictionaries with data to upload.
        
        Returns:
            Dictionary with upload status.
        """
        try:
            spreadsheet = self.client.open_by_key(spreadsheet_id)
            
            # Check if worksheet exists, create if not
            try:
                worksheet = spreadsheet.worksheet(sheet_name)
            except:
                worksheet = spreadsheet.add_worksheet(title=sheet_name, rows="1000", cols="26")
            
            # Convert to DataFrame for easier handling
            df = pd.DataFrame(data)
            
            # Clear the worksheet
            worksheet.clear()
            
            # Get headers and values
            headers = df.columns.tolist()
            values = df.values.tolist()
            
            # Insert headers and data
            all_data = [headers] + values
            worksheet.update('A1', all_data)
            
            return {
                "status": "success",
                "sheet_name": sheet_name,
                "row_count": len(values),
                "col_count": len(headers)
            }
        except Exception as e:
            raise ValueError(f"Error uploading data: {str(e)}") 