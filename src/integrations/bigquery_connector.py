import os
import asyncio
import json
from typing import Dict, List, Optional, Any, Union
from google.cloud import bigquery
from google.oauth2 import service_account
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class BigQueryConnector:
    """
    Connector for Google BigQuery integration.
    Handles authentication, querying, and data retrieval.
    """
    
    def __init__(self):
        """Initialize the BigQuery connector."""
        self.client = self._get_client()
    
    def _get_client(self):
        """
        Get a BigQuery client instance.
        Uses service account JSON file path from environment variable.
        """
        key_file = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
        project_id = os.environ.get("GCP_PROJECT_ID")
        
        if key_file and os.path.exists(key_file):
            credentials = service_account.Credentials.from_service_account_file(
                key_file, scopes=["https://www.googleapis.com/auth/cloud-platform"]
            )
            return bigquery.Client(credentials=credentials, project=project_id)
        else:
            # Use application default credentials
            return bigquery.Client(project=project_id)
    
    async def test_connection(self) -> Dict[str, Any]:
        """
        Test the BigQuery connection.
        
        Returns:
            Dict with connection status and project information.
        """
        try:
            # Get project info
            project_id = self.client.project
            datasets = list(self.client.list_datasets())
            dataset_count = len(datasets)
            
            return {
                "status": "connected",
                "project_id": project_id,
                "dataset_count": dataset_count
            }
        except Exception as e:
            return {
                "status": "error",
                "message": str(e)
            }
    
    async def list_datasets(self) -> List[Dict[str, Any]]:
        """
        Get a list of all datasets in the project.
        
        Returns:
            List of dataset information dictionaries.
        """
        datasets = list(self.client.list_datasets())
        result = []
        
        for dataset in datasets:
            result.append({
                "id": dataset.dataset_id,
                "full_id": f"{self.client.project}.{dataset.dataset_id}",
                "friendly_name": dataset.friendly_name,
                "location": dataset.location
            })
        
        return result
    
    async def list_tables(self, dataset_id: str) -> List[Dict[str, Any]]:
        """
        Get a list of all tables in a dataset.
        
        Args:
            dataset_id: The ID of the dataset to list tables from.
        
        Returns:
            List of table information dictionaries.
        """
        dataset_ref = self.client.dataset(dataset_id)
        tables = list(self.client.list_tables(dataset_ref))
        result = []
        
        for table in tables:
            result.append({
                "id": table.table_id,
                "full_id": f"{self.client.project}.{dataset_id}.{table.table_id}",
                "type": table.table_type
            })
        
        return result
    
    async def get_table_schema(self, dataset_id: str, table_id: str) -> List[Dict[str, Any]]:
        """
        Get the schema of a specific table.
        
        Args:
            dataset_id: The ID of the dataset.
            table_id: The ID of the table.
        
        Returns:
            List of field information dictionaries.
        """
        table_ref = self.client.dataset(dataset_id).table(table_id)
        table = self.client.get_table(table_ref)
        result = []
        
        for field in table.schema:
            result.append({
                "name": field.name,
                "type": field.field_type,
                "mode": field.mode,
                "description": field.description
            })
        
        return result
    
    async def execute_query(self, query: str, max_bytes: Optional[int] = None) -> Dict[str, Any]:
        """
        Execute a SQL query against BigQuery.
        
        Args:
            query: The SQL query to execute.
            max_bytes: Maximum number of bytes to process.
        
        Returns:
            Dictionary with query results and metadata.
        """
        job_config = bigquery.QueryJobConfig()
        
        if max_bytes:
            job_config.maximum_bytes_billed = max_bytes
        
        query_job = self.client.query(query, job_config=job_config)
        results = query_job.result()
        
        # Get column names
        schema = results.schema
        column_names = [field.name for field in schema]
        
        # Convert to list of dictionaries
        rows = []
        for row in results:
            row_dict = {}
            for key, value in row.items():
                # Handle nested fields and special types
                if isinstance(value, (bigquery.Row, dict)):
                    row_dict[key] = dict(value)
                elif hasattr(value, 'isoformat'):  # For datetime objects
                    row_dict[key] = value.isoformat()
                else:
                    row_dict[key] = value
            rows.append(row_dict)
        
        # Get query metadata
        job_info = query_job._properties
        bytes_processed = job_info.get('statistics', {}).get('totalBytesProcessed')
        
        return {
            "columns": column_names,
            "rows": rows,
            "row_count": len(rows),
            "bytes_processed": bytes_processed
        } 