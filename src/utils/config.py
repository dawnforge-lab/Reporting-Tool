import os
import json
from typing import Dict, Any
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class AppConfig:
    """
    Configuration manager for the application.
    Handles reading and updating configuration settings.
    """
    
    def __init__(self):
        """Initialize the configuration manager."""
        self.config_dir = "data"
        self.config_file = os.path.join(self.config_dir, "config.json")
        
        # Create directory if it doesn't exist
        os.makedirs(self.config_dir, exist_ok=True)
        
        # Load or create configuration
        self.config = self._load_config()
    
    def _load_config(self) -> Dict[str, Any]:
        """
        Load configuration from file, or create default if not exists.
        
        Returns:
            Dictionary with configuration.
        """
        if os.path.exists(self.config_file):
            try:
                with open(self.config_file, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                # If loading fails, return default config
                return self._get_default_config()
        else:
            # Create default config and save it
            config = self._get_default_config()
            self._save_config(config)
            return config
    
    def _save_config(self, config: Dict[str, Any]) -> None:
        """
        Save configuration to file.
        
        Args:
            config: Configuration dictionary to save.
        """
        with open(self.config_file, "w", encoding="utf-8") as f:
            json.dump(config, f, indent=2)
    
    def _get_default_config(self) -> Dict[str, Any]:
        """
        Get default configuration.
        
        Returns:
            Dictionary with default configuration.
        """
        return {
            "app": {
                "name": "Digital Marketing Reporting Tool",
                "version": "0.1.0"
            },
            "data_sources": {
                "bigquery": {
                    "enabled": True,
                    "project_id": os.getenv("GCP_PROJECT_ID", ""),
                    "default_dataset": ""
                },
                "spreadsheets": {
                    "enabled": True
                },
                "database": {
                    "enabled": True,
                    "type": os.getenv("DB_TYPE", "sqlite"),
                    "path": os.getenv("DB_PATH", "data/marketing_reports.db")
                }
            },
            "ai": {
                "enabled": True,
                "models": {
                    "default": "gpt-4"
                }
            },
            "meridian": {
                "enabled": False,
                "path": ""
            },
            "report_settings": {
                "default_template": "default",
                "logo_url": "",
                "company_name": "",
                "default_channels": [
                    "Paid Search",
                    "Organic Search",
                    "Email",
                    "Social",
                    "Display",
                    "Direct"
                ],
                "default_metrics": [
                    "Impressions",
                    "Clicks",
                    "Conversions",
                    "Revenue"
                ]
            }
        }
    
    def get_config(self) -> Dict[str, Any]:
        """
        Get the current configuration.
        
        Returns:
            Dictionary with current configuration.
        """
        return self.config
    
    def update_config(self, new_config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update the configuration with new values.
        
        Args:
            new_config: Dictionary with new configuration values.
            
        Returns:
            Dictionary with updated configuration.
        """
        # Recursive function to update nested dictionary
        def update_dict(d, u):
            for k, v in u.items():
                if isinstance(v, dict) and k in d and isinstance(d[k], dict):
                    d[k] = update_dict(d[k], v)
                else:
                    d[k] = v
            return d
        
        # Update configuration
        self.config = update_dict(self.config, new_config)
        
        # Save updated configuration
        self._save_config(self.config)
        
        return self.config
    
    def get_section(self, section: str) -> Dict[str, Any]:
        """
        Get a specific section of the configuration.
        
        Args:
            section: Name of the configuration section.
            
        Returns:
            Dictionary with section configuration.
        """
        return self.config.get(section, {}) 