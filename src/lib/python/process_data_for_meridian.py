
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
  