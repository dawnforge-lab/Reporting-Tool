import os
import json
import asyncio
from typing import Dict, List, Optional, Any, Union
import uuid
from datetime import datetime
from dotenv import load_dotenv
import openai
from jinja2 import Environment, FileSystemLoader, select_autoescape
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots

# Load environment variables
load_dotenv()

# Set up OpenAI API
openai.api_key = os.getenv("OPENAI_API_KEY")

class ReportGenerator:
    """
    AI-powered report generator.
    Handles creation of marketing reports with insights and visualizations.
    """
    
    def __init__(self):
        """Initialize the report generator."""
        self.reports_dir = os.path.join("data", "reports")
        self.templates_dir = os.path.join("src", "reports", "templates")
        
        # Create directories if they don't exist
        os.makedirs(self.reports_dir, exist_ok=True)
        
        # Set up Jinja2 environment for templates
        self.jinja_env = Environment(
            loader=FileSystemLoader(self.templates_dir),
            autoescape=select_autoescape(['html', 'xml'])
        )
    
    async def generate(
        self, 
        config: Dict[str, Any],
        bigquery=None,
        spreadsheet=None,
        database=None
    ) -> Dict[str, Any]:
        """
        Generate a marketing report based on configuration.
        
        Args:
            config: Report configuration with parameters.
            bigquery: BigQuery connector instance.
            spreadsheet: Spreadsheet connector instance.
            database: Database connector instance.
            
        Returns:
            Dictionary with report information.
        """
        # Generate report ID
        report_id = str(uuid.uuid4())
        
        # Get report type and parameters
        report_type = config.get("type", "performance")
        title = config.get("title", f"Marketing Report - {datetime.now().strftime('%Y-%m-%d')}")
        description = config.get("description", "")
        period = config.get("period", "last_30_days")
        channels = config.get("channels", [])
        metrics = config.get("metrics", [])
        
        # Get data sources
        data_sources = config.get("data_sources", [])
        data = await self._fetch_data(data_sources, bigquery, spreadsheet, database)
        
        # Generate insights using AI
        insights = await self._generate_insights(data, report_type, channels, metrics)
        
        # Create visualizations
        visualizations = await self._create_visualizations(data, report_type, channels, metrics)
        
        # Render report template
        report_html = await self._render_template(
            report_type,
            {
                "report_id": report_id,
                "title": title,
                "description": description,
                "period": period,
                "channels": channels,
                "metrics": metrics,
                "insights": insights,
                "visualizations": visualizations,
                "generated_date": datetime.now().isoformat(),
                "data": data
            }
        )
        
        # Save report
        report_path = os.path.join(self.reports_dir, f"{report_id}.html")
        with open(report_path, "w", encoding="utf-8") as f:
            f.write(report_html)
        
        # Save metadata
        metadata = {
            "id": report_id,
            "title": title,
            "description": description,
            "type": report_type,
            "created_at": datetime.now().isoformat(),
            "config": config
        }
        metadata_path = os.path.join(self.reports_dir, f"{report_id}.json")
        with open(metadata_path, "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2)
        
        # Return report information
        return {
            "id": report_id,
            "title": title,
            "path": report_path,
            "type": report_type,
            "created_at": datetime.now().isoformat()
        }
    
    async def _fetch_data(
        self,
        data_sources: List[Dict[str, Any]],
        bigquery=None,
        spreadsheet=None,
        database=None
    ) -> Dict[str, Any]:
        """
        Fetch data from specified data sources.
        
        Args:
            data_sources: List of data source configurations.
            
        Returns:
            Dictionary with fetched data.
        """
        result = {}
        
        for source in data_sources:
            source_type = source.get("type")
            source_id = source.get("id", source_type)
            
            if source_type == "bigquery" and bigquery:
                query = source.get("query")
                if query:
                    try:
                        data = await bigquery.execute_query(query)
                        result[source_id] = data
                    except Exception as e:
                        result[source_id] = {"error": str(e)}
            
            elif source_type == "spreadsheet" and spreadsheet:
                spreadsheet_id = source.get("spreadsheet_id")
                sheet_name = source.get("sheet_name")
                if spreadsheet_id and sheet_name:
                    try:
                        data = await spreadsheet.get_sheet_data(spreadsheet_id, sheet_name)
                        result[source_id] = data
                    except Exception as e:
                        result[source_id] = {"error": str(e)}
            
            elif source_type == "database" and database:
                query = source.get("query")
                if query:
                    try:
                        data = await database.execute_query(query)
                        result[source_id] = data
                    except Exception as e:
                        result[source_id] = {"error": str(e)}
        
        return result
    
    async def _generate_insights(
        self,
        data: Dict[str, Any],
        report_type: str,
        channels: List[str],
        metrics: List[str]
    ) -> List[Dict[str, Any]]:
        """
        Generate insights from data using OpenAI.
        
        Args:
            data: The data to analyze.
            report_type: Type of report.
            channels: Marketing channels to analyze.
            metrics: Metrics to analyze.
            
        Returns:
            List of insights with explanations.
        """
        insights = []
        
        # Format data for OpenAI prompt
        data_summary = json.dumps(data, indent=2)[:4000]  # Truncate to avoid token limits
        
        # Create prompt for OpenAI
        prompt = f"""
        You are an expert marketing analyst. Analyze the following marketing data and provide 3-5 key insights.
        
        Report Type: {report_type}
        Channels: {', '.join(channels)}
        Metrics: {', '.join(metrics)}
        
        Data Summary:
        {data_summary}
        
        For each insight, provide:
        1. A concise title (10 words or less)
        2. A detailed explanation (2-3 sentences)
        3. A recommendation based on the insight (1-2 sentences)
        
        Format your response as JSON with an array of insights, each with 'title', 'explanation', and 'recommendation' fields.
        """
        
        try:
            # Call OpenAI API
            completion = openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a marketing analytics expert that provides factual insights based on data."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"}
            )
            
            # Parse response
            response_text = completion.choices[0].message.content
            response_json = json.loads(response_text)
            
            insights = response_json.get("insights", [])
        except Exception as e:
            insights.append({
                "title": "Error Generating Insights",
                "explanation": f"An error occurred while generating insights: {str(e)}",
                "recommendation": "Please check your data sources and try again."
            })
        
        return insights
    
    async def _create_visualizations(
        self,
        data: Dict[str, Any],
        report_type: str,
        channels: List[str],
        metrics: List[str]
    ) -> List[Dict[str, Any]]:
        """
        Create data visualizations for the report.
        
        Args:
            data: The data to visualize.
            report_type: Type of report.
            channels: Marketing channels to visualize.
            metrics: Metrics to visualize.
            
        Returns:
            List of visualization HTML strings.
        """
        visualizations = []
        
        try:
            # Check if we have data to visualize
            if not data:
                return visualizations
            
            # Create appropriate visualizations based on report type
            if report_type == "performance":
                # Create channel performance comparison
                for source_id, source_data in data.items():
                    if "rows" in source_data and source_data["rows"]:
                        # Convert to DataFrame for easier manipulation
                        df = pd.DataFrame(source_data["rows"])
                        
                        # Check if we have channel and metrics columns
                        channel_col = next((col for col in df.columns if "channel" in col.lower()), None)
                        date_col = next((col for col in df.columns if "date" in col.lower()), None)
                        
                        # Create visualizations based on available data
                        if channel_col:
                            # Channel comparison chart
                            for metric in metrics:
                                metric_col = next((col for col in df.columns if metric.lower() in col.lower()), None)
                                if metric_col:
                                    # Create bar chart
                                    fig = px.bar(
                                        df, 
                                        x=channel_col, 
                                        y=metric_col,
                                        title=f"{metric} by Channel",
                                        color=channel_col
                                    )
                                    html = fig.to_html(full_html=False, include_plotlyjs='cdn')
                                    visualizations.append({
                                        "title": f"{metric} by Channel",
                                        "html": html
                                    })
                        
                        if date_col:
                            # Time series chart
                            for metric in metrics:
                                metric_col = next((col for col in df.columns if metric.lower() in col.lower()), None)
                                if metric_col:
                                    # Create line chart
                                    fig = px.line(
                                        df, 
                                        x=date_col, 
                                        y=metric_col,
                                        title=f"{metric} Over Time",
                                        color=channel_col if channel_col else None
                                    )
                                    html = fig.to_html(full_html=False, include_plotlyjs='cdn')
                                    visualizations.append({
                                        "title": f"{metric} Over Time",
                                        "html": html
                                    })
            
            elif report_type == "attribution":
                # Create attribution model visualization
                for source_id, source_data in data.items():
                    if "rows" in source_data and source_data["rows"]:
                        # Convert to DataFrame for easier manipulation
                        df = pd.DataFrame(source_data["rows"])
                        
                        # Check if we have channel and contribution columns
                        channel_col = next((col for col in df.columns if "channel" in col.lower()), None)
                        contribution_col = next((col for col in df.columns if "contribution" in col.lower() or "attribution" in col.lower()), None)
                        
                        if channel_col and contribution_col:
                            # Create pie chart
                            fig = px.pie(
                                df, 
                                names=channel_col, 
                                values=contribution_col,
                                title="Channel Attribution"
                            )
                            html = fig.to_html(full_html=False, include_plotlyjs='cdn')
                            visualizations.append({
                                "title": "Channel Attribution",
                                "html": html
                            })
        
        except Exception as e:
            visualizations.append({
                "title": "Error Creating Visualizations",
                "html": f"<div class='alert alert-danger'>An error occurred creating visualizations: {str(e)}</div>"
            })
        
        return visualizations
    
    async def _render_template(self, template_name: str, context: Dict[str, Any]) -> str:
        """
        Render a report template with the provided context.
        
        Args:
            template_name: Name of the template.
            context: Template context variables.
            
        Returns:
            Rendered HTML string.
        """
        # Find appropriate template
        template_file = f"{template_name}.html"
        
        # Use default if the specified template doesn't exist
        if not os.path.exists(os.path.join(self.templates_dir, template_file)):
            template_file = "default.html"
        
        # Render template
        template = self.jinja_env.get_template(template_file)
        return template.render(**context)
    
    def get_report(self, report_id: str) -> Dict[str, Any]:
        """
        Get a generated report by ID.
        
        Args:
            report_id: The ID of the report to retrieve.
            
        Returns:
            Report data and HTML.
        """
        metadata_path = os.path.join(self.reports_dir, f"{report_id}.json")
        html_path = os.path.join(self.reports_dir, f"{report_id}.html")
        
        if not os.path.exists(metadata_path) or not os.path.exists(html_path):
            raise ValueError(f"Report {report_id} not found")
        
        # Load metadata
        with open(metadata_path, "r", encoding="utf-8") as f:
            metadata = json.load(f)
        
        # Load HTML
        with open(html_path, "r", encoding="utf-8") as f:
            html = f.read()
        
        return {
            **metadata,
            "html": html
        }
    
    async def list_templates(self) -> List[Dict[str, Any]]:
        """
        List all available report templates.
        
        Returns:
            List of template information.
        """
        templates = []
        
        # Check if templates directory exists
        if os.path.exists(self.templates_dir):
            for filename in os.listdir(self.templates_dir):
                if filename.endswith(".html"):
                    name = os.path.splitext(filename)[0]
                    templates.append({
                        "id": name,
                        "name": name.replace("_", " ").title(),
                        "filename": filename
                    })
        
        return templates
    
    async def list_reports(self) -> List[Dict[str, Any]]:
        """
        List all saved reports.
        
        Returns:
            List of report information.
        """
        reports = []
        
        # Check if reports directory exists
        if os.path.exists(self.reports_dir):
            for filename in os.listdir(self.reports_dir):
                if filename.endswith(".json"):
                    try:
                        filepath = os.path.join(self.reports_dir, filename)
                        with open(filepath, "r", encoding="utf-8") as f:
                            metadata = json.load(f)
                            reports.append(metadata)
                    except:
                        # Skip files that can't be parsed
                        pass
        
        # Sort by created date (newest first)
        reports.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        
        return reports
    
    async def delete_report(self, report_id: str) -> Dict[str, Any]:
        """
        Delete a report by ID.
        
        Args:
            report_id: The ID of the report to delete.
            
        Returns:
            Status information.
        """
        metadata_path = os.path.join(self.reports_dir, f"{report_id}.json")
        html_path = os.path.join(self.reports_dir, f"{report_id}.html")
        
        deleted_files = []
        
        # Delete files if they exist
        if os.path.exists(metadata_path):
            os.remove(metadata_path)
            deleted_files.append(metadata_path)
        
        if os.path.exists(html_path):
            os.remove(html_path)
            deleted_files.append(html_path)
        
        if not deleted_files:
            raise ValueError(f"Report {report_id} not found")
        
        return {
            "status": "success",
            "message": f"Report {report_id} deleted",
            "deleted_files": deleted_files
        } 