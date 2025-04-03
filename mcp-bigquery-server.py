import asyncio
import json
import os
from typing import Dict, List, Optional, Any, Union

from google.cloud import bigquery
from google.oauth2 import service_account

import mcp.types as types
from mcp.server import Server
from mcp.server.models import InitializationOptions

# Initialize the MCP server
server = Server("bigquery")

# Initialize BigQuery client
def get_bigquery_client():
    """
    Get a BigQuery client instance.
    Uses service account JSON file path from environment variable if provided.
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

# Get BigQuery datasets
async def get_datasets(client):
    """
    Get list of datasets in the project.
    """
    datasets = list(client.list_datasets())
    return datasets

# Get tables in a dataset
async def get_tables(client, dataset_id):
    """
    Get list of tables in a dataset.
    """
    dataset_ref = client.dataset(dataset_id)
    tables = list(client.list_tables(dataset_ref))
    return tables

# Get table schema
async def get_table_schema(client, dataset_id, table_id):
    """
    Get schema of a specific table.
    """
    table_ref = client.dataset(dataset_id).table(table_id)
    table = client.get_table(table_ref)
    return table.schema

# Execute a query
async def execute_query(client, query, max_bytes=None):
    """
    Execute a SQL query on BigQuery.
    
    Args:
        client: BigQuery client
        query: SQL query to execute
        max_bytes: Maximum number of bytes to process
        
    Returns:
        Query result as a list of dictionaries
    """
    job_config = bigquery.QueryJobConfig()
    
    if max_bytes:
        job_config.maximum_bytes_billed = max_bytes
    
    query_job = client.query(query, job_config=job_config)
    results = query_job.result()
    
    # Convert to list of dictionaries
    result_list = []
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
        result_list.append(row_dict)
    
    return result_list

# Format results as markdown table
def format_results_as_markdown(results):
    """
    Format query results as a markdown table.
    """
    if not results:
        return "No results found."
    
    # Get headers from the first result
    headers = list(results[0].keys())
    
    # Create the markdown table header
    markdown = "| " + " | ".join(headers) + " |\n"
    markdown += "| " + " | ".join(["---" for _ in headers]) + " |\n"
    
    # Add each row
    for row in results:
        values = []
        for header in headers:
            value = row.get(header, "")
            # Convert value to string and escape pipes
            value_str = str(value).replace("|", "\\|")
            values.append(value_str)
        markdown += "| " + " | ".join(values) + " |\n"
    
    return markdown

@server.initialize()
async def handle_initialize(options: InitializationOptions) -> None:
    """Initialize the server."""
    pass

@server.list_tools()
async def handle_list_tools() -> List[types.Tool]:
    """
    List available BigQuery tools.
    """
    return [
        types.Tool(
            name="list_datasets",
            description="List all datasets in the BigQuery project",
            inputSchema={
                "type": "object",
                "properties": {},
                "required": []
            }
        ),
        types.Tool(
            name="list_tables",
            description="List all tables in a specific BigQuery dataset",
            inputSchema={
                "type": "object",
                "properties": {
                    "dataset_id": {"type": "string", "description": "The ID of the dataset to list tables from"}
                },
                "required": ["dataset_id"]
            }
        ),
        types.Tool(
            name="describe_table",
            description="Get the schema of a specific BigQuery table",
            inputSchema={
                "type": "object",
                "properties": {
                    "dataset_id": {"type": "string", "description": "The ID of the dataset"},
                    "table_id": {"type": "string", "description": "The ID of the table to describe"}
                },
                "required": ["dataset_id", "table_id"]
            }
        ),
        types.Tool(
            name="execute_query",
            description="Execute a SQL query against BigQuery",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "The SQL query to execute"},
                    "max_gb": {"type": "number", "description": "Maximum GB to process (default: 1)"}
                },
                "required": ["query"]
            }
        )
    ]

@server.call_tool()
async def handle_call_tool(
    name: str, arguments: Optional[Dict[str, Any]]
) -> List[Union[types.TextContent, types.ImageContent, types.EmbeddedResource]]:
    """
    Handle tool execution requests.
    """
    client = get_bigquery_client()
    
    if name == "list_datasets":
        datasets = await get_datasets(client)
        dataset_list = [dataset.dataset_id for dataset in datasets]
        
        response = "## Available Datasets\n\n"
        for dataset_id in dataset_list:
            response += f"- {dataset_id}\n"
            
        return [types.TextContent(text=response)]
    
    elif name == "list_tables":
        dataset_id = arguments.get("dataset_id")
        tables = await get_tables(client, dataset_id)
        table_list = [table.table_id for table in tables]
        
        response = f"## Tables in dataset '{dataset_id}'\n\n"
        for table_id in table_list:
            response += f"- {table_id}\n"
            
        return [types.TextContent(text=response)]
    
    elif name == "describe_table":
        dataset_id = arguments.get("dataset_id")
        table_id = arguments.get("table_id")
        
        schema = await get_table_schema(client, dataset_id, table_id)
        
        response = f"## Schema for {dataset_id}.{table_id}\n\n"
        response += "| Field Name | Type | Mode |\n"
        response += "| --- | --- | --- |\n"
        
        for field in schema:
            response += f"| {field.name} | {field.field_type} | {field.mode} |\n"
            
        return [types.TextContent(text=response)]
    
    elif name == "execute_query":
        query = arguments.get("query")
        max_gb = arguments.get("max_gb", 1)
        max_bytes = int(max_gb * 1073741824)  # Convert GB to bytes
        
        try:
            results = await execute_query(client, query, max_bytes)
            
            # Format results as markdown table
            markdown_results = format_results_as_markdown(results)
            response = f"## Query Results\n\n{markdown_results}\n\n"
            response += f"Total rows: {len(results)}"
            
            # If results are too large, truncate and notify
            if len(results) > 50:
                truncated_results = results[:50]
                markdown_results = format_results_as_markdown(truncated_results)
                response = f"## Query Results (showing first 50 of {len(results)} rows)\n\n"
                response += f"{markdown_results}\n\n"
                response += f"Total rows: {len(results)}"
            
            return [types.TextContent(text=response)]
        except Exception as e:
            error_message = f"Error executing query: {str(e)}"
            return [types.TextContent(text=error_message)]
    
    else:
        return [types.TextContent(text=f"Unknown tool: {name}")]

if __name__ == "__main__":
    asyncio.run(mcp.server.stdio.run(server))
