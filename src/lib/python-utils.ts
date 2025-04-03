import { PythonShell } from 'python-shell';
import path from 'path';
import fs from 'fs';

// Helper function to run Python scripts for data processing
export async function runPythonScript(scriptName: string, args: string[] = []): Promise<any> {
  try {
    const scriptPath = path.join(process.cwd(), 'src', 'lib', 'python', scriptName);
    
    // Check if the script exists
    if (!fs.existsSync(scriptPath)) {
      throw new Error(`Python script not found: ${scriptName}`);
    }
    
    const options = {
      mode: 'text',
      pythonOptions: ['-u'], // unbuffered output
      args
    };
    
    const results = await PythonShell.run(scriptPath, options);
    
    // Parse the results if they are JSON
    try {
      return JSON.parse(results[0]);
    } catch (e) {
      // If not JSON, return the raw results
      return results;
    }
  } catch (error) {
    console.error(`Error running Python script ${scriptName}:`, error);
    throw error;
  }
}

// Function to create a Python script if it doesn't exist
export function createPythonScript(scriptName: string, content: string): void {
  const scriptDir = path.join(process.cwd(), 'src', 'lib', 'python');
  const scriptPath = path.join(scriptDir, scriptName);
  
  // Create the directory if it doesn't exist
  if (!fs.existsSync(scriptDir)) {
    fs.mkdirSync(scriptDir, { recursive: true });
  }
  
  // Create the script if it doesn't exist
  if (!fs.existsSync(scriptPath)) {
    fs.writeFileSync(scriptPath, content);
    console.log(`Created Python script: ${scriptName}`);
  }
}

// Function to create a data processing script for Meridian integration
export function createMeridianDataProcessingScript(): void {
  const scriptName = 'process_data_for_meridian.py';
  const scriptContent = `
import json
import sys
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def process_data_for_meridian(data_json, config_json=None):
    """
    Process marketing data for use with Meridian MMM.
    
    Args:
        data_json: JSON string containing the marketing data
        config_json: Optional JSON string with processing configuration
    
    Returns:
        JSON string with processed data ready for Meridian
    """
    try:
        # Parse input data
        data = json.loads(data_json)
        config = json.loads(config_json) if config_json else {}
        
        # Convert to DataFrame if it's a list of records
        if isinstance(data, list):
            df = pd.DataFrame(data)
        else:
            # Handle nested data structure
            if 'records' in data:
                df = pd.DataFrame(data['records'])
            else:
                # Try to flatten the structure
                flattened_data = []
                for key, value in data.items():
                    if isinstance(value, dict):
                        row = {'date': key}
                        row.update(value)
                        flattened_data.append(row)
                df = pd.DataFrame(flattened_data)
        
        # Ensure date column is datetime
        date_column = config.get('date_column', 'date')
        if date_column in df.columns:
            df[date_column] = pd.to_datetime(df[date_column])
            df = df.sort_values(by=date_column)
        
        # Identify target (KPI) column
        target_column = config.get('target_column')
        if not target_column:
            # Try to guess based on common names
            potential_targets = ['revenue', 'sales', 'conversions', 'kpi', 'target']
            for col in potential_targets:
                if col in df.columns:
                    target_column = col
                    break
        
        if not target_column or target_column not in df.columns:
            return json.dumps({
                'success': False,
                'message': 'Target KPI column not found or specified'
            })
        
        # Identify marketing channel columns
        channel_columns = config.get('channel_columns', [])
        if not channel_columns:
            # Try to guess based on common patterns
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            # Exclude date and target columns
            potential_channels = [col for col in numeric_cols 
                                if col != target_column and 'date' not in col.lower()]
            channel_columns = potential_channels
        
        # Validate channel columns exist
        channel_columns = [col for col in channel_columns if col in df.columns]
        
        if not channel_columns:
            return json.dumps({
                'success': False,
                'message': 'No marketing channel columns found or specified'
            })
        
        # Identify control variables (if any)
        control_columns = config.get('control_columns', [])
        control_columns = [col for col in control_columns if col in df.columns]
        
        # Format data for Meridian
        meridian_data = {
            'date': df[date_column].dt.strftime('%Y-%m-%d').tolist(),
            'target': df[target_column].tolist(),
            'channels': {}
        }
        
        for channel in channel_columns:
            meridian_data['channels'][channel] = df[channel].tolist()
        
        if control_columns:
            meridian_data['controls'] = {}
            for control in control_columns:
                meridian_data['controls'][control] = df[control].tolist()
        
        # Add metadata
        meridian_data['metadata'] = {
            'date_range': {
                'start': df[date_column].min().strftime('%Y-%m-%d'),
                'end': df[date_column].max().strftime('%Y-%m-%d')
            },
            'target_column': target_column,
            'channel_columns': channel_columns,
            'control_columns': control_columns,
            'row_count': len(df),
            'processed_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        
        return json.dumps({
            'success': True,
            'data': meridian_data
        })
        
    except Exception as e:
        return json.dumps({
            'success': False,
            'message': str(e)
        })

if __name__ == "__main__":
    # Get input data from command line arguments
    if len(sys.argv) > 1:
        data_json = sys.argv[1]
        config_json = sys.argv[2] if len(sys.argv) > 2 else None
        
        result = process_data_for_meridian(data_json, config_json)
        print(result)
    else:
        print(json.dumps({
            'success': False,
            'message': 'No input data provided'
        }))
  `;
  
  createPythonScript(scriptName, scriptContent);
}

// Function to create a data fetching script for different data sources
export function createDataFetchingScript(): void {
  const scriptName = 'fetch_data.py';
  const scriptContent = `
import json
import sys
import pandas as pd
import numpy as np
from datetime import datetime
import os

def fetch_data_from_source(config_json):
    """
    Fetch data from various data sources based on configuration.
    
    Args:
        config_json: JSON string with data source configuration
    
    Returns:
        JSON string with fetched data
    """
    try:
        # Parse configuration
        config = json.loads(config_json)
        source_type = config.get('type')
        
        if not source_type:
            return json.dumps({
                'success': False,
                'message': 'Source type not specified'
            })
        
        # Fetch data based on source type
        if source_type == 'csv':
            return fetch_from_csv(config)
        elif source_type == 'excel':
            return fetch_from_excel(config)
        elif source_type == 'bigquery':
            return fetch_from_bigquery(config)
        elif source_type == 'spreadsheet':
            return fetch_from_spreadsheet(config)
        elif source_type == 'database':
            return fetch_from_database(config)
        else:
            return json.dumps({
                'success': False,
                'message': f'Unsupported source type: {source_type}'
            })
            
    except Exception as e:
        return json.dumps({
            'success': False,
            'message': str(e)
        })

def fetch_from_csv(config):
    """Fetch data from CSV file"""
    try:
        file_path = config.get('filePath')
        if not file_path:
            return json.dumps({
                'success': False,
                'message': 'File path not specified'
            })
            
        # Check if file exists
        if not os.path.exists(file_path):
            return json.dumps({
                'success': False,
                'message': f'File not found: {file_path}'
            })
            
        # Read CSV file
        df = pd.read_csv(file_path)
        
        # Basic data info
        data_info = {
            'row_count': len(df),
            'column_count': len(df.columns),
            'columns': df.columns.tolist(),
            'fetched_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        
        # Convert to records
        records = df.to_dict(orient='records')
        
        return json.dumps({
            'success': True,
            'info': data_info,
            'data': records
        })
        
    except Exception as e:
        return json.dumps({
            'success': False,
            'message': str(e)
        })

def fetch_from_excel(config):
    """Fetch data from Excel file"""
    try:
        file_path = config.get('filePath')
        sheet_name = config.get('sheetName')
        
        if not file_path:
            return json.dumps({
                'success': False,
                'message': 'File path not specified'
            })
            
        # Check if file exists
        if not os.path.exists(file_path):
            return json.dumps({
                'success': False,
                'message': f'File not found: {file_path}'
            })
            
        # Read Excel file
        if sheet_name:
            df = pd.read_excel(file_path, sheet_name=sheet_name)
        else:
            df = pd.read_excel(file_path)
        
        # Basic data info
        data_info = {
            'row_count': len(df),
            'column_count': len(df.columns),
            'columns': df.columns.tolist(),
            'fetched_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        
        # Convert to records
        records = df.to_dict(orient='records')
        
        return json.dumps({
            'success': True,
            'info': data_info,
            'data': records
        })
        
    except Exception as e:
        return json.dumps({
            'success': False,
            'message': str(e)
        })

def fetch_from_bigquery(config):
    """Fetch data from BigQuery"""
    try:
        # In a real implementation, this would use the google-cloud-bigquery package
        # For this demo, we'll return mock data
        
        # Mock data generation
        date_range = pd.date_range(start='2025-01-01', periods=90)
        channels = ['Paid Search', 'Social Media', 'Email', 'Display']
        
        data = []
        for date in date_range:
            row = {'date': date.strftime('%Y-%m-%d')}
            
            # Add channel data
            for channel in channels:
                # Generate some random spend data
                row[f'{channel}_spend'] = round(np.random.gamma(2, 100), 2)
                
                # Generate some random performance metrics
                row[f'{channel}_impressions'] = int(np.random.gamma(2, 1000))
                row[f'{channel}_clicks'] = int(np.random.gamma(2, 50))
                row[f'{channel}_conversions'] = int(np.random.gamma(2, 5))
            
            # Add revenue data with some relationship to marketing
            base_revenue = 5000
            marketing_effect = sum([row[f'{channel}_spend'] * np.random.uniform(0.5, 2.0) for channel in channels])
            row['revenue'] = round(base_revenue + marketing_effect + np.random.normal(0, 1000), 2)
            
            data.append(row)
        
        # Basic data info
        data_info = {
            'row_count': len(data),
            'column_count': len(data[0]) if data else 0,
            'columns': list(data[0].keys()) if data else [],
            'fetched_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'source': 'BigQuery (mock data)'
        }
        
        return json.dumps({
            'success': True,
            'info': data_info,
            'data': data
        })
        
    except Exception as e:
        return json.dumps({
            'success': False,
            'message': str(e)
        })

def fetch_from_spreadsheet(config):
    """Fetch data from Google Spreadsheet"""
    try:
        # In a real implementation, this would use the gspread package
        # For this demo, we'll return mock data
        
        # Mock data generation
        date_range = pd.date_range(start='2025-01-01', periods=90)
        channels = ['Paid Search', 'Social Media', 'Email', 'Display']
        
        data = []
        for date in date_range:
            row = {'date': date.strftime('%Y-%m-%d')}
            
            # Add channel data
            for channel in channels:
                # Generate some random spend data
                row[f'{channel}_spend'] = round(np.random.gamma(2, 100), 2)
                
                # Generate some random performance metrics
                row[f'{channel}_impressions'] = int(np.random.gamma(2, 1000))
                row[f'{channel}_clicks'] = int(np.random.gamma(2, 50))
                row[f'{channel}_conversions'] = int(np.random.gamma(2, 5))
            
            # Add revenue data with some relationship to marketing
            base_revenue = 5000
            marketing_effect = sum([row[f'{channel}_spend'] * np.random.uniform(0.5, 2.0) for channel in channels])
            row['revenue'] = round(base_revenue + marketing_effect + np.random.normal(0, 1000), 2)
            
            data.append(row)
        
        # Basic data info
        data_info = {
            'row_count': len(data),
            'column_count': len(data[0]) if data else 0,
            'columns': list(data[0].keys()) if data else [],
            'fetched_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'source': 'Google Spreadsheet (mock data)'
        }
        
        return json.dumps({
            'success': True,
            'info': data_info,
            'data': data
        })
        
    except Exception as e:
        return json.dumps({
            'success': False,
            'message': str(e)
        })

def fetch_from_database(config):
    """Fetch data from database"""
    try:
        # In a real implementation, this would use SQLAlchemy
        # For this demo, we'll return mock data
        
        # Mock data generation
        date_range = pd.date_range(start='2025-01-01', periods=90)
        channels = ['Paid Search', 'Social Media', 'Email', 'Display']
        
        data = []
        for date in date_range:
            row = {'date': date.strftime('%Y-%m-%d')}
            
            # Add channel data
            for channel in channels:
                # Generate some random spend data
                row[f'{channel}_spend'] = round(np.random.gamma(2, 100), 2)
                
                # Generate some random performance metrics
                row[f'{channel}_impressions'] = int(np.random.gamma(2, 1000))
                row[f'{channel}_clicks'] = int(np.random.gamma(2, 50))
                row[f'{channel}_conversions'] = int(np.random.gamma(2, 5))
            
            # Add revenue data with some relationship to marketing
            base_revenue = 5000
            marketing_effect = sum([row[f'{channel}_spend'] * np.random.uniform(0.5, 2.0) for channel in channels])
            row['revenue'] = round(base_revenue + marketing_effect + np.random.normal(0, 1000), 2)
            
            data.append(row)
        
        # Basic data info
        data_info = {
            'row_count': len(data),
            'column_count': len(data[0]) if data else 0,
            'columns': list(data[0].keys()) if data else [],
            'fetched_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'source': 'Database (mock data)'
        }
        
        return json.dumps({
            'success': True,
            'info': data_info,
            'data': data
        })
        
    except Exception as e:
        return json.dumps({
            'success': False,
            'message': str(e)
        })

if __name__ == "__main__":
    # Get input data from command line arguments
    if len(sys.argv) > 1:
        config_json = sys.argv[1]
        result = fetch_data_from_source(config_json)
        print(result)
    else:
        print(json.dumps({
            'success': False,
            'message': 'No configuration provided'
        }))
  `;
  
  createPythonScript(scriptName, scriptContent);
}

// Create the necessary Python scripts
createMeridianDataProcessingScript();
createDataFetchingScript();

// Export a function to fetch data from a data source
export async function fetchDataFromSource(config: any): Promise<any> {
  try {
    const configJson = JSON.stringify(config);
    return await runPythonScript('fetch_data.py', [configJson]);
  } catch (error) {
    console.error('Error fetching data from source:', error);
    throw error;
  }
}

// Export a function to process data for Meridian
export async function processDataForMeridian(data: any, config: any = {}): Promise<any> {
  try {
    const dataJson = JSON.stringify(data);
    const configJson = JSON.stringify(config);
    return await runPythonScript('process_data_for_meridian.py', [dataJson, configJson]);
  } catch (error) {
    console.error('Error processing data for Meridian:', error);
    throw error;
  }
}
