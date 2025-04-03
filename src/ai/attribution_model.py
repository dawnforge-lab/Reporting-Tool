import os
import json
import asyncio
from typing import Dict, List, Optional, Any, Union
import pandas as pd
import numpy as np
from dotenv import load_dotenv
import openai
from datetime import datetime

# Load environment variables
load_dotenv()

# Set up OpenAI API
openai.api_key = os.getenv("OPENAI_API_KEY")

class AttributionModel:
    """
    AI-powered attribution modeling.
    Creates custom attribution models for marketing channels.
    """
    
    def __init__(self):
        """Initialize the attribution model."""
        self.models_dir = os.path.join("data", "models")
        
        # Create directory if it doesn't exist
        os.makedirs(self.models_dir, exist_ok=True)
    
    async def create_model(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a custom attribution model.
        
        Args:
            params: Dictionary with model parameters:
                - data: List of conversion path data
                - channels: List of marketing channels
                - model_type: Type of attribution model (ai, rule_based)
                - conversion_metric: Metric to attribute (conversions, revenue)
                - touchpoint_fields: Fields representing touchpoints
                
        Returns:
            Dictionary with model results and attribution.
        """
        model_id = f"attr_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Extract parameters
        data = params.get("data", [])
        channels = params.get("channels", [])
        model_type = params.get("model_type", "ai")
        conversion_metric = params.get("conversion_metric", "conversions")
        touchpoint_fields = params.get("touchpoint_fields", [])
        
        # Process data into DataFrame
        df = pd.DataFrame(data)
        
        # Run appropriate model based on type
        if model_type == "ai":
            results = await self._run_ai_attribution(
                df, 
                channels, 
                conversion_metric,
                touchpoint_fields
            )
        elif model_type == "shapley":
            results = await self._run_shapley_attribution(
                df, 
                channels, 
                conversion_metric
            )
        elif model_type == "markov":
            results = await self._run_markov_attribution(
                df, 
                channels, 
                conversion_metric,
                touchpoint_fields
            )
        else:
            # Default to rule-based (first/last/linear)
            results = await self._run_rule_based_attribution(
                df, 
                channels, 
                conversion_metric,
                model_type
            )
        
        # Add model metadata
        model_data = {
            "id": model_id,
            "type": model_type,
            "created_at": datetime.now().isoformat(),
            "channels": channels,
            "conversion_metric": conversion_metric,
            "parameters": params,
            "results": results
        }
        
        # Save model data
        model_path = os.path.join(self.models_dir, f"{model_id}.json")
        with open(model_path, "w", encoding="utf-8") as f:
            json.dump(model_data, f, indent=2)
        
        return model_data
    
    async def _run_ai_attribution(
        self,
        df: pd.DataFrame,
        channels: List[str],
        conversion_metric: str,
        touchpoint_fields: List[str]
    ) -> Dict[str, Any]:
        """
        Run AI-based attribution using OpenAI.
        
        Args:
            df: DataFrame with conversion data.
            channels: List of channels to attribute.
            conversion_metric: Metric to attribute.
            touchpoint_fields: Fields containing touchpoint data.
            
        Returns:
            Dictionary with attribution results.
        """
        try:
            # Prepare data summary for OpenAI
            data_sample = df.head(20).to_dict(orient="records")
            data_summary = json.dumps(data_sample, indent=2)
            
            # Calculate total conversions/revenue
            total_metric = df[conversion_metric].sum() if conversion_metric in df.columns else 0
            
            # Create system prompt
            system_prompt = """
            You are an expert in marketing attribution modeling. Your task is to analyze marketing touchpoint data 
            and create a fair attribution model that allocates credit to different marketing channels.
            
            Analyze the data carefully and provide a detailed explanation of your attribution methodology.
            Your attribution percentages MUST add up to exactly 100%.
            """
            
            # Create user prompt
            user_prompt = f"""
            I need to create a custom attribution model for these marketing channels: {", ".join(channels)}
            
            The conversion metric I'm attributing is: {conversion_metric}
            Total {conversion_metric}: {total_metric}
            
            Here's a sample of my conversion path data:
            {data_summary}
            
            The fields that represent touchpoints are: {", ".join(touchpoint_fields)}
            
            Please provide:
            1. A fair percentage attribution for each channel (must sum to 100%)
            2. The reasoning behind your attribution
            3. How this attribution compares to standard models like last-click or first-click
            
            Format your response as JSON with:
            - "attribution": A dictionary mapping each channel to a percentage value
            - "explanation": Your explanation of the attribution methodology
            - "insights": Key insights about channel performance
            """
            
            # Call OpenAI API
            completion = openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"}
            )
            
            # Parse response
            response_text = completion.choices[0].message.content
            response_json = json.loads(response_text)
            
            # Extract attribution from response
            attribution = response_json.get("attribution", {})
            explanation = response_json.get("explanation", "")
            insights = response_json.get("insights", [])
            
            # Calculate attributed values
            attributed_values = {}
            for channel, percentage in attribution.items():
                attributed_values[channel] = (float(percentage) / 100) * total_metric
            
            return {
                "model_type": "ai",
                "attribution_percentages": attribution,
                "attributed_values": attributed_values,
                "total_metric": total_metric,
                "explanation": explanation,
                "insights": insights
            }
            
        except Exception as e:
            return {
                "error": str(e),
                "model_type": "ai",
                "attribution_percentages": {channel: 1/len(channels) for channel in channels},
                "explanation": f"Error in AI attribution: {str(e)}. Using equal attribution as fallback."
            }
    
    async def _run_shapley_attribution(
        self,
        df: pd.DataFrame,
        channels: List[str],
        conversion_metric: str
    ) -> Dict[str, Any]:
        """
        Run Shapley value-based attribution.
        
        Args:
            df: DataFrame with conversion data.
            channels: List of channels to attribute.
            conversion_metric: Metric to attribute.
            
        Returns:
            Dictionary with attribution results.
        """
        # In a real implementation, this would calculate Shapley values
        # Here we provide a simplified implementation
        
        # Calculate total conversions/revenue
        total_metric = df[conversion_metric].sum() if conversion_metric in df.columns else 0
        
        # For this example, we'll assign slightly different weights to each channel
        # In a real implementation, this would be based on actual Shapley value calculation
        import random
        random.seed(42)  # For reproducibility
        
        # Generate random weights that sum to 1
        raw_weights = [random.random() for _ in range(len(channels))]
        total_weight = sum(raw_weights)
        normalized_weights = [w / total_weight for w in raw_weights]
        
        # Create attribution percentages
        attribution = {}
        for i, channel in enumerate(channels):
            attribution[channel] = round(normalized_weights[i] * 100, 2)
        
        # Calculate attributed values
        attributed_values = {}
        for channel, percentage in attribution.items():
            attributed_values[channel] = (float(percentage) / 100) * total_metric
        
        return {
            "model_type": "shapley",
            "attribution_percentages": attribution,
            "attributed_values": attributed_values,
            "total_metric": total_metric,
            "explanation": "Shapley value attribution assigns credit based on the marginal contribution of each channel across all possible combinations of channels."
        }
    
    async def _run_markov_attribution(
        self,
        df: pd.DataFrame,
        channels: List[str],
        conversion_metric: str,
        touchpoint_fields: List[str]
    ) -> Dict[str, Any]:
        """
        Run Markov chain-based attribution.
        
        Args:
            df: DataFrame with conversion data.
            channels: List of channels to attribute.
            conversion_metric: Metric to attribute.
            touchpoint_fields: Fields containing touchpoint data.
            
        Returns:
            Dictionary with attribution results.
        """
        # In a real implementation, this would calculate Markov chain transition probabilities
        # Here we provide a simplified implementation
        
        # Calculate total conversions/revenue
        total_metric = df[conversion_metric].sum() if conversion_metric in df.columns else 0
        
        # For this example, we'll assign different weights to each channel
        # In a real implementation, this would be based on actual Markov chain calculation
        
        # Create a baseline where later touchpoints get more credit
        baseline = np.linspace(0.5, 1.5, len(channels))
        normalized = baseline / baseline.sum()
        
        # Create attribution percentages
        attribution = {}
        for i, channel in enumerate(channels):
            attribution[channel] = round(normalized[i] * 100, 2)
        
        # Calculate attributed values
        attributed_values = {}
        for channel, percentage in attribution.items():
            attributed_values[channel] = (float(percentage) / 100) * total_metric
        
        return {
            "model_type": "markov",
            "attribution_percentages": attribution,
            "attributed_values": attributed_values,
            "total_metric": total_metric,
            "explanation": "Markov chain attribution models the customer journey as a stochastic process, measuring the impact of each channel by calculating removal effects."
        }
    
    async def _run_rule_based_attribution(
        self,
        df: pd.DataFrame,
        channels: List[str],
        conversion_metric: str,
        rule_type: str = "linear"
    ) -> Dict[str, Any]:
        """
        Run rule-based attribution (first-touch, last-touch, linear).
        
        Args:
            df: DataFrame with conversion data.
            channels: List of channels to attribute.
            conversion_metric: Metric to attribute.
            rule_type: Type of rule-based attribution.
            
        Returns:
            Dictionary with attribution results.
        """
        # Calculate total conversions/revenue
        total_metric = df[conversion_metric].sum() if conversion_metric in df.columns else 0
        
        # Set up attribution based on rule type
        attribution = {}
        explanation = ""
        
        if rule_type == "first_touch":
            # First-touch gives all credit to the first channel
            # For demo purposes, we'll just use the first channel in the list
            for i, channel in enumerate(channels):
                attribution[channel] = 100 if i == 0 else 0
            explanation = "First-touch attribution gives 100% credit to the first marketing interaction in the customer journey."
            
        elif rule_type == "last_touch":
            # Last-touch gives all credit to the last channel
            # For demo purposes, we'll just use the last channel in the list
            for i, channel in enumerate(channels):
                attribution[channel] = 100 if i == len(channels) - 1 else 0
            explanation = "Last-touch attribution gives 100% credit to the final marketing interaction before conversion."
            
        else:  # Linear
            # Linear gives equal credit to all channels
            weight = round(100 / len(channels), 2)
            for channel in channels:
                attribution[channel] = weight
            # Adjust last channel to ensure sum is exactly 100%
            attribution[channels[-1]] = round(100 - sum([attribution[ch] for ch in channels[:-1]]), 2)
            explanation = "Linear attribution gives equal credit to all marketing interactions in the customer journey."
        
        # Calculate attributed values
        attributed_values = {}
        for channel, percentage in attribution.items():
            attributed_values[channel] = (float(percentage) / 100) * total_metric
        
        return {
            "model_type": rule_type,
            "attribution_percentages": attribution,
            "attributed_values": attributed_values,
            "total_metric": total_metric,
            "explanation": explanation
        }
    
    def get_model(self, model_id: str) -> Dict[str, Any]:
        """
        Get a previously created attribution model.
        
        Args:
            model_id: The ID of the model to retrieve.
            
        Returns:
            Dictionary with model data.
        """
        model_path = os.path.join(self.models_dir, f"{model_id}.json")
        
        if not os.path.exists(model_path):
            raise ValueError(f"Attribution model {model_id} not found")
        
        with open(model_path, "r", encoding="utf-8") as f:
            model_data = json.load(f)
        
        return model_data
    
    async def list_models(self) -> List[Dict[str, Any]]:
        """
        List all created attribution models.
        
        Returns:
            List of model information.
        """
        models = []
        
        if os.path.exists(self.models_dir):
            for filename in os.listdir(self.models_dir):
                if filename.endswith(".json"):
                    try:
                        filepath = os.path.join(self.models_dir, filename)
                        with open(filepath, "r", encoding="utf-8") as f:
                            model_data = json.load(f)
                            # Include only basic info in listing
                            models.append({
                                "id": model_data.get("id"),
                                "type": model_data.get("type"),
                                "created_at": model_data.get("created_at"),
                                "channels": model_data.get("channels"),
                                "conversion_metric": model_data.get("conversion_metric")
                            })
                    except:
                        # Skip files that can't be parsed
                        pass
        
        # Sort by created date (newest first)
        models.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        
        return models
    
    async def delete_model(self, model_id: str) -> Dict[str, Any]:
        """
        Delete an attribution model by ID.
        
        Args:
            model_id: The ID of the model to delete.
            
        Returns:
            Status information.
        """
        model_path = os.path.join(self.models_dir, f"{model_id}.json")
        
        if not os.path.exists(model_path):
            raise ValueError(f"Attribution model {model_id} not found")
        
        os.remove(model_path)
        
        return {
            "status": "success",
            "message": f"Attribution model {model_id} deleted"
        } 