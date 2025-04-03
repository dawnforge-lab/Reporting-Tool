import os
import json
import asyncio
from typing import Dict, List, Optional, Any, Union
import sqlalchemy
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text, MetaData, Table, Column, Integer, String, Float, DateTime
from dotenv import load_dotenv
import pandas as pd

# Load environment variables
load_dotenv()

class DatabaseConnector:
    """
    Connector for local database integration.
    Handles connection, querying, and data manipulation.
    Supports SQLite by default, but can be configured for other databases.
    """
    
    def __init__(self):
        """Initialize the database connector."""
        self.db_url = self._get_db_url()
        self.engine = create_async_engine(self.db_url, echo=False)
        self.async_session = sessionmaker(
            self.engine, class_=AsyncSession, expire_on_commit=False
        )
    
    def _get_db_url(self) -> str:
        """
        Get the database URL from environment variables.
        Defaults to SQLite if not specified.
        """
        db_type = os.environ.get("DB_TYPE", "sqlite")
        
        if db_type.lower() == "sqlite":
            db_path = os.environ.get("DB_PATH", "data/marketing_reports.db")
            # Make sure the directory exists
            os.makedirs(os.path.dirname(db_path), exist_ok=True)
            return f"sqlite+aiosqlite:///{db_path}"
        else:
            # For other database types, construct URL from environment variables
            host = os.environ.get("DB_HOST", "localhost")
            port = os.environ.get("DB_PORT", "5432")
            user = os.environ.get("DB_USER", "")
            password = os.environ.get("DB_PASSWORD", "")
            database = os.environ.get("DB_NAME", "marketing_reports")
            
            if db_type.lower() == "postgres":
                return f"postgresql+asyncpg://{user}:{password}@{host}:{port}/{database}"
            elif db_type.lower() == "mysql":
                return f"mysql+aiomysql://{user}:{password}@{host}:{port}/{database}"
            else:
                raise ValueError(f"Unsupported database type: {db_type}")
    
    async def test_connection(self) -> Dict[str, Any]:
        """
        Test the database connection.
        
        Returns:
            Dict with connection status.
        """
        try:
            async with self.async_session() as session:
                # Try a simple query
                result = await session.execute(text("SELECT 1"))
                
                # Get database type
                if self.db_url.startswith("sqlite"):
                    db_type = "SQLite"
                elif "postgresql" in self.db_url:
                    db_type = "PostgreSQL"
                elif "mysql" in self.db_url:
                    db_type = "MySQL"
                else:
                    db_type = "Unknown"
                
                return {
                    "status": "connected",
                    "database_type": db_type,
                    "database_url": self.db_url.split("://")[0]  # Don't include credentials
                }
        except Exception as e:
            return {
                "status": "error",
                "message": str(e)
            }
    
    async def list_tables(self) -> List[Dict[str, Any]]:
        """
        Get a list of all tables in the database.
        
        Returns:
            List of table information dictionaries.
        """
        try:
            metadata = MetaData()
            async with self.engine.connect() as conn:
                await conn.run_sync(metadata.reflect)
                
                result = []
                for table_name, table in metadata.tables.items():
                    # Get column info
                    columns = []
                    for column in table.columns:
                        columns.append({
                            "name": column.name,
                            "type": str(column.type)
                        })
                    
                    result.append({
                        "name": table_name,
                        "columns": columns,
                        "column_count": len(columns)
                    })
                
                return result
        except Exception as e:
            raise ValueError(f"Error listing tables: {str(e)}")
    
    async def execute_query(self, query: str) -> Dict[str, Any]:
        """
        Execute a SQL query against the database.
        
        Args:
            query: The SQL query to execute.
        
        Returns:
            Dictionary with query results and metadata.
        """
        try:
            async with self.async_session() as session:
                # Execute the query
                result = await session.execute(text(query))
                
                # Check if it's a SELECT query
                if query.strip().upper().startswith("SELECT"):
                    # Get column names
                    columns = result.keys()
                    
                    # Get rows
                    rows = []
                    for row in result:
                        row_dict = {}
                        for i, column in enumerate(columns):
                            value = row[i]
                            # Convert to JSON-serializable format
                            if hasattr(value, 'isoformat'):  # For datetime objects
                                row_dict[column] = value.isoformat()
                            else:
                                row_dict[column] = value
                        rows.append(row_dict)
                    
                    return {
                        "columns": columns,
                        "rows": rows,
                        "row_count": len(rows)
                    }
                else:
                    # For non-SELECT queries, commit the changes
                    await session.commit()
                    
                    # Try to get rowcount for affected rows
                    rowcount = getattr(result, 'rowcount', None)
                    
                    return {
                        "status": "success",
                        "affected_rows": rowcount if rowcount is not None else "unknown"
                    }
        except Exception as e:
            raise ValueError(f"Error executing query: {str(e)}")
    
    async def create_table(self, table_name: str, columns: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Create a new table in the database.
        
        Args:
            table_name: The name of the table to create.
            columns: List of column definitions (name, type, etc.).
        
        Returns:
            Dictionary with creation status.
        """
        try:
            metadata = MetaData()
            
            # Map column types to SQLAlchemy types
            column_objects = []
            for col in columns:
                col_name = col.get("name")
                col_type = col.get("type", "string").lower()
                
                if col_type == "integer":
                    column_objects.append(Column(col_name, Integer))
                elif col_type == "float":
                    column_objects.append(Column(col_name, Float))
                elif col_type == "datetime":
                    column_objects.append(Column(col_name, DateTime))
                else:
                    # Default to string
                    column_objects.append(Column(col_name, String))
            
            # Create table
            table = Table(table_name, metadata, *column_objects)
            
            async with self.engine.begin() as conn:
                await conn.run_sync(metadata.create_all)
            
            return {
                "status": "success",
                "table_name": table_name,
                "column_count": len(column_objects)
            }
        except Exception as e:
            raise ValueError(f"Error creating table: {str(e)}")
    
    async def save_dataframe(self, table_name: str, data: List[Dict[str, Any]], if_exists: str = "replace") -> Dict[str, Any]:
        """
        Save data to the database as a table.
        
        Args:
            table_name: The name of the table to save data to.
            data: List of dictionaries with data to save.
            if_exists: What to do if the table already exists ('replace', 'append', 'fail').
        
        Returns:
            Dictionary with save status.
        """
        try:
            # Convert data to DataFrame
            df = pd.DataFrame(data)
            
            # Convert DataFrame to SQLAlchemy model
            async with self.engine.begin() as conn:
                # First, convert to pandas DataFrame
                # Then, use to_sql with the connection
                await conn.run_sync(
                    lambda sync_conn: df.to_sql(
                        name=table_name,
                        con=sync_conn,
                        if_exists=if_exists,
                        index=False
                    )
                )
            
            return {
                "status": "success",
                "table_name": table_name,
                "row_count": len(df),
                "column_count": len(df.columns),
                "if_exists": if_exists
            }
        except Exception as e:
            raise ValueError(f"Error saving data: {str(e)}") 