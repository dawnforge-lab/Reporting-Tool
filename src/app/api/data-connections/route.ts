import { NextRequest, NextResponse } from 'next/server';
import { PythonShell } from 'python-shell';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

// Define supported data source types
const SUPPORTED_TYPES = ['bigquery', 'spreadsheet', 'csv', 'excel', 'database'];

export async function GET(request: NextRequest) {
  try {
    // Get all data connections from the database
    // For now, return mock data
    const connections = [
      {
        id: 'conn-1',
        name: 'Google Analytics Data',
        type: 'bigquery',
        status: 'active',
        lastConnected: new Date().toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        id: 'conn-2',
        name: 'Marketing Campaign Spreadsheet',
        type: 'spreadsheet',
        status: 'active',
        lastConnected: new Date().toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        id: 'conn-3',
        name: 'Monthly Sales Data',
        type: 'csv',
        status: 'inactive',
        lastConnected: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      }
    ];
    
    return NextResponse.json({ connections });
  } catch (error) {
    console.error('Error fetching data connections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data connections' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, config } = body;
    
    // Validate required fields
    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      );
    }
    
    // Validate connection type
    if (!SUPPORTED_TYPES.includes(type)) {
      return NextResponse.json(
        { error: `Unsupported connection type. Supported types: ${SUPPORTED_TYPES.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Validate config based on type
    if (!validateConfig(type, config)) {
      return NextResponse.json(
        { error: 'Invalid configuration for the selected connection type' },
        { status: 400 }
      );
    }
    
    // Test the connection
    const connectionStatus = await testConnection(type, config);
    
    if (!connectionStatus.success) {
      return NextResponse.json(
        { error: `Connection test failed: ${connectionStatus.message}` },
        { status: 400 }
      );
    }
    
    // Create a new connection
    const newConnection = {
      id: `conn-${uuidv4()}`,
      name,
      type,
      config,
      status: 'active',
      lastConnected: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    // In a real implementation, save to database
    
    return NextResponse.json({
      message: 'Data connection created successfully',
      connection: {
        id: newConnection.id,
        name: newConnection.name,
        type: newConnection.type,
        status: newConnection.status,
        lastConnected: newConnection.lastConnected,
        createdAt: newConnection.createdAt
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating data connection:', error);
    return NextResponse.json(
      { error: 'Failed to create data connection' },
      { status: 500 }
    );
  }
}

// Helper function to validate configuration based on connection type
function validateConfig(type: string, config: any): boolean {
  if (!config) return false;
  
  switch (type) {
    case 'bigquery':
      return !!config.projectId && !!config.datasetId;
    case 'spreadsheet':
      return !!config.spreadsheetId || !!config.spreadsheetUrl;
    case 'csv':
    case 'excel':
      return !!config.filePath || !!config.fileContent;
    case 'database':
      return !!config.connectionString || (!!config.host && !!config.database);
    default:
      return false;
  }
}

// Helper function to test connection
async function testConnection(type: string, config: any): Promise<{ success: boolean, message: string }> {
  try {
    // For demonstration purposes, we'll simulate connection testing
    // In a real implementation, this would actually test the connection
    
    // Create a temporary Python script to test the connection
    const scriptPath = path.join(process.cwd(), 'src', 'lib', 'python', `test_${type}_connection.py`);
    
    // Check if the script exists, if not create it
    if (!fs.existsSync(scriptPath)) {
      const scriptContent = generateConnectionTestScript(type);
      fs.writeFileSync(scriptPath, scriptContent);
    }
    
    // Run the Python script to test the connection
    const options = {
      mode: 'text',
      pythonOptions: ['-u'], // unbuffered output
      args: [JSON.stringify(config)]
    };
    
    // For demo purposes, we'll simulate success for most connections
    // In a real implementation, we would actually run the Python script
    /*
    const results = await PythonShell.run(scriptPath, options);
    const result = JSON.parse(results[0]);
    return result;
    */
    
    // Simulate connection testing with random success/failure
    const success = Math.random() > 0.2; // 80% success rate
    
    return {
      success,
      message: success ? 'Connection successful' : 'Failed to connect. Please check your credentials.'
    };
  } catch (error) {
    console.error('Error testing connection:', error);
    return {
      success: false,
      message: `Error testing connection: ${error.message}`
    };
  }
}

// Helper function to generate Python test scripts for different connection types
function generateConnectionTestScript(type: string): string {
  switch (type) {
    case 'bigquery':
      return `
import json
import sys
from google.cloud import bigquery
from google.oauth2 import service_account

def test_bigquery_connection(config):
    try:
        # Parse the config
        config_dict = json.loads(config)
        project_id = config_dict.get('projectId')
        dataset_id = config_dict.get('datasetId')
        credentials_json = config_dict.get('credentials')
        
        if not project_id or not dataset_id:
            return {"success": False, "message": "Missing required parameters: projectId or datasetId"}
        
        # Initialize credentials
        if credentials_json:
            credentials = service_account.Credentials.from_service_account_info(json.loads(credentials_json))
            client = bigquery.Client(project=project_id, credentials=credentials)
        else:
            # Use default credentials
            client = bigquery.Client(project=project_id)
        
        # Test connection by listing tables in the dataset
        dataset_ref = client.dataset(dataset_id)
        tables = list(client.list_tables(dataset_ref))
        
        return {"success": True, "message": f"Successfully connected to BigQuery. Found {len(tables)} tables."}
    except Exception as e:
        return {"success": False, "message": str(e)}

if __name__ == "__main__":
    if len(sys.argv) > 1:
        config = sys.argv[1]
        result = test_bigquery_connection(config)
        print(json.dumps(result))
    else:
        print(json.dumps({"success": False, "message": "No configuration provided"}))
      `;
    
    case 'spreadsheet':
      return `
import json
import sys
import gspread
from oauth2client.service_account import ServiceAccountCredentials

def test_spreadsheet_connection(config):
    try:
        # Parse the config
        config_dict = json.loads(config)
        spreadsheet_id = config_dict.get('spreadsheetId')
        spreadsheet_url = config_dict.get('spreadsheetUrl')
        credentials_json = config_dict.get('credentials')
        
        if not spreadsheet_id and not spreadsheet_url:
            return {"success": False, "message": "Missing required parameters: spreadsheetId or spreadsheetUrl"}
        
        # Extract spreadsheet ID from URL if provided
        if not spreadsheet_id and spreadsheet_url:
            # Extract ID from URL like https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
            parts = spreadsheet_url.split('/')
            for i, part in enumerate(parts):
                if part == 'd' and i < len(parts) - 1:
                    spreadsheet_id = parts[i + 1]
                    break
        
        if not spreadsheet_id:
            return {"success": False, "message": "Could not determine spreadsheet ID"}
        
        # Initialize credentials
        if credentials_json:
            creds_dict = json.loads(credentials_json)
            scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
            credentials = ServiceAccountCredentials.from_json_keyfile_dict(creds_dict, scope)
            client = gspread.authorize(credentials)
        else:
            # This will only work if the environment has default credentials
            scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
            credentials = ServiceAccountCredentials.from_json_keyfile_name('credentials.json', scope)
            client = gspread.authorize(credentials)
        
        # Open the spreadsheet and get basic info
        spreadsheet = client.open_by_key(spreadsheet_id)
        worksheets = spreadsheet.worksheets()
        
        return {"success": True, "message": f"Successfully connected to spreadsheet. Found {len(worksheets)} worksheets."}
    except Exception as e:
        return {"success": False, "message": str(e)}

if __name__ == "__main__":
    if len(sys.argv) > 1:
        config = sys.argv[1]
        result = test_spreadsheet_connection(config)
        print(json.dumps(result))
    else:
        print(json.dumps({"success": False, "message": "No configuration provided"}))
      `;
    
    case 'csv':
    case 'excel':
      return `
import json
import sys
import os
import pandas as pd

def test_file_connection(config):
    try:
        # Parse the config
        config_dict = json.loads(config)
        file_path = config_dict.get('filePath')
        file_content = config_dict.get('fileContent')
        file_type = config_dict.get('fileType', '${type}')
        
        if not file_path and not file_content:
            return {"success": False, "message": "Missing required parameters: filePath or fileContent"}
        
        # If file content is provided, write it to a temporary file
        if file_content and not file_path:
            import tempfile
            import base64
            
            # Decode base64 content if provided
            if config_dict.get('isBase64', False):
                file_content = base64.b64decode(file_content)
            
            # Create temporary file
            temp_dir = tempfile.gettempdir()
            file_path = os.path.join(temp_dir, f"temp_file.{file_type}")
            
            # Write content to file
            with open(file_path, 'wb' if config_dict.get('isBase64', False) else 'w') as f:
                f.write(file_content)
        
        # Read the file with pandas
        if file_type == 'csv':
            df = pd.read_csv(file_path)
        elif file_type in ['excel', 'xlsx', 'xls']:
            df = pd.read_excel(file_path)
        else:
            return {"success": False, "message": f"Unsupported file type: {file_type}"}
        
        # Get basic info about the file
        row_count = len(df)
        column_count = len(df.columns)
        
        return {
            "success": True, 
            "message": f"Successfully read {file_type} file. Found {row_count} rows and {column_count} columns.",
            "preview": df.head(5).to_dict(orient='records')
        }
    except Exception as e:
        return {"success": False, "message": str(e)}

if __name__ == "__main__":
    if len(sys.argv) > 1:
        config = sys.argv[1]
        result = test_file_connection(config)
        print(json.dumps(result))
    else:
        print(json.dumps({"success": False, "message": "No configuration provided"}))
      `;
    
    case 'database':
      return `
import json
import sys
import sqlalchemy

def test_database_connection(config):
    try:
        # Parse the config
        config_dict = json.loads(config)
        connection_string = config_dict.get('connectionString')
        
        # If no connection string is provided, build it from components
        if not connection_string:
            db_type = config_dict.get('type', 'postgresql')
            host = config_dict.get('host')
            port = config_dict.get('port')
            database = config_dict.get('database')
            username = config_dict.get('username')
            password = config_dict.get('password')
            
            if not host or not database:
                return {"success": False, "message": "Missing required parameters: host or database"}
            
            # Build connection string based on database type
            if db_type == 'postgresql':
                port = port or 5432
                connection_string = f"postgresql://{username}:{password}@{host}:{port}/{database}"
            elif db_type == 'mysql':
                port = port or 3306
                connection_string = f"mysql+pymysql://{username}:{password}@{host}:{port}/{database}"
            elif db_type == 'sqlite':
                connection_string = f"sqlite:///{database}"
            else:
                return {"success": False, "message": f"Unsupported database type: {db_type}"}
        
        # Create engine and test connection
        engine = sqlalchemy.create_engine(connection_string)
        connection = engine.connect()
        
        # Get list of tables
        inspector = sqlalchemy.inspect(engine)
        tables = inspector.get_table_names()
        
        connection.close()
        
        return {"success": True, "message": f"Successfully connected to database. Found {len(tables)} tables."}
    except Exception as e:
        return {"success": False, "message": str(e)}

if __name__ == "__main__":
    if len(sys.argv) > 1:
        config = sys.argv[1]
        result = test_database_connection(config)
        print(json.dumps(result))
    else:
        print(json.dumps({"success": False, "message": "No configuration provided"}))
      `;
    
    default:
      return `
import json
import sys

def test_generic_connection(config):
    # This is a placeholder for a generic connection test
    # In a real implementation, this would be replaced with actual connection logic
    return {"success": True, "message": "Connection test not implemented for this type"}

if __name__ == "__main__":
    if len(sys.argv) > 1:
        config = sys.argv[1]
        result = test_generic_connection(config)
        print(json.dumps(result))
    else:
        print(json.dumps({"success": False, "message": "No configuration provided"}))
      `;
  }
}
