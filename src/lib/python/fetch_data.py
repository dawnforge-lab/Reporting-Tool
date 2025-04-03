
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
  