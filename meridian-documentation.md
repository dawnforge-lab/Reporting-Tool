# Google Meridian
## Comprehensive Documentation for AI Assistants

This documentation provides detailed guidance for AI assistants supporting developers in building applications with Google Meridian, an open-source Marketing Mix Modeling (MMM) framework.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Technical Requirements](#2-technical-requirements)
3. [Installation](#3-installation)
4. [Core Architecture](#4-core-architecture)
5. [Data Preparation](#5-data-preparation)
6. [Model Configuration](#6-model-configuration)
7. [Training Process](#7-training-process)
8. [Analysis & Visualization](#8-analysis--visualization)
9. [Optimization Workflows](#9-optimization-workflows)
10. [Integration Patterns](#10-integration-patterns)
11. [Troubleshooting](#11-troubleshooting)
12. [Advanced Use Cases](#12-advanced-use-cases)
13. [Resources](#13-resources)

---

## 1. Overview

### 1.1 What is Google Meridian?

Google Meridian is an open-source Marketing Mix Modeling (MMM) framework released by Google that enables advertisers and marketers to build and run their own in-house models. It uses statistical analysis to measure the impact of marketing campaigns across channels and account for non-marketing factors affecting key performance indicators (KPIs).

### 1.2 Key Capabilities

- Privacy-safe measurement (uses no cookies or user-level information)
- Supports both geo-level and national-level data modeling
- Bayesian causal inference methodology
- Handles large-scale datasets (50+ geographic regions, 2-3 years of weekly data)
- Support for media saturation and lagged effects modeling
- Incorporation of reach and frequency data
- Integration with Google Query Volume (GQV) as a control variable
- Budget optimization tools

### 1.3 Primary Use Cases

- Measuring marketing channel effectiveness on revenue/KPIs
- Calculating marketing return on investment (ROI)
- Optimizing budget allocation across marketing channels
- Incorporating experimental data as priors
- Planning future marketing investments

---

## 2. Technical Requirements

### 2.1 System Requirements

- **Python**: Versions 3.11 or 3.12 only
- **Hardware**: 
  - Minimum: Standard CPU configuration
  - Recommended: GPU hardware (V100, T4 or equivalent with 16GB+ RAM)
- **CUDA Toolchain**: Required for GPU acceleration

### 2.2 Dependencies

Meridian has several key dependencies:
- TensorFlow Probability (core modeling library)
- ArviZ (for model visualization)
- XLA compiler (for performance optimization)
- NumPy/Pandas (for data manipulation)
- Various visualization libraries (for output rendering)

---

## 3. Installation

### 3.1 Basic Installation

```python
# For GPU-enabled environments (Linux)
python3 -m pip install --upgrade 'google-meridian[and-cuda]'

# For CPU-only environments (macOS)
python3 -m pip install --upgrade google-meridian

# Verify installation
python3 -c "import meridian; print(meridian.__version__)"
```

### 3.2 Installation Variants

```python
# Installing a specific version
python3 -m pip install google-meridian[and-cuda]==1.0.3

# Installing directly from GitHub
python3 -m pip install --upgrade "google-meridian[and-cuda] @ git+https://github.com/google/meridian.git"

# For Google Colab installations
pip install --upgrade google-meridian[colab,and-cuda]
```

### 3.3 Environment Setup for Optimal Performance

When using Meridian in Google Colab:
1. Ensure you're using a GPU runtime (Runtime > Change runtime type)
2. T4 GPU runtime is sufficient for basic models (available in free tier)
3. Premium GPUs (V100, A100, L4) are available in paid Colab plans

---

## 4. Core Architecture

### 4.1 API Structure

Meridian's API is organized into three primary modules:

1. **meridian.analysis**:
   - Tools for analyzing trained models
   - ROI calculation
   - Incremental impact assessment
   - Budget optimization

2. **meridian.data**:
   - Data loading and transformation
   - Preprocessing utilities
   - Dataset management

3. **meridian.model**:
   - Model definition and parameterization
   - Training configuration
   - Bayesian inference

### 4.2 Key Classes and Functions

```python
# Core modeling class
meridian.model.model.Meridian
```

Important methods:
- `sample_prior()`: Generates prior distributions
- `sample_posterior()`: Runs MCMC to generate posterior samples
- `fit_diagnostics()`: Assesses model fit

```python
# Analysis class
meridian.analysis.analyzer.Analyzer
```

Important methods:
- `incremental_impact()`: Calculates contribution by channel
- `roi()`: Calculates return on investment
- `marginal_roi()`: Assesses impact of incremental spending
- `budget_allocator()`: Optimizes budget allocation

### 4.3 Data Structures

Meridian uses several specialized data structures:
- `meridian.data.dataset.Dataset`: Stores model inputs
- `az.InferenceData`: Stores posterior samples (from ArviZ)

---

## 5. Data Preparation

### 5.1 Required Data Types

Meridian works with several types of data:

1. **Target Variable**:
   - Sales, revenue, conversions or other KPIs
   - Typically at geo and time level

2. **Media Data**:
   - Impressions, spend, clicks by channel
   - Geo-level data when available
   - Time series aligned with target variable

3. **Control Variables** (optional but recommended):
   - Price changes
   - Promotions
   - Seasonality indicators
   - Competitor actions
   - Economic indicators

4. **Google Query Volume (GQV)** (optional):
   - Helps control for organic demand
   - Indexed query volume data

5. **Reach and Frequency Data** (optional):
   - Number of unique viewers per time period
   - Average impressions per viewer

### 5.2 Data Format

Data should be structured with consistent:
- Time periods (weekly recommended)
- Geographic identifiers (for geo-level modeling)
- Channel identifiers (consistent naming)

### 5.3 Data Preparation Example

```python
import pandas as pd
import meridian
from meridian.data import load

# Load your prepared data
media_data = pd.read_csv('media_data.csv')
kpi_data = pd.read_csv('kpi_data.csv')
control_vars = pd.read_csv('control_variables.csv')

# Create a Meridian dataset
dataset = load.Dataset(
    media=media_data,
    target=kpi_data,
    control=control_vars,
    # Optional data
    reach_and_frequency=reach_freq_data,
    query_volume=gqv_data
)
```

### 5.4 Data Quality Guidelines

- Minimum recommended timespan: 1-2 years of weekly data
- For geo-models: 10+ geographic regions recommended
- Consistent spend patterns preferable (avoid all-zero periods)
- Media data should include all significant channels (80%+ of spend)

---

## 6. Model Configuration

### 6.1 Model Types

Meridian supports two primary model types:

1. **Geo-level Hierarchical Model** (recommended):
   - Uses data from multiple geographic regions
   - Accounts for regional variations
   - Provides more reliable estimates with tighter credible intervals

2. **National-level Model**:
   - Used when geo-level data is unavailable
   - Simpler but less informative

### 6.2 Model Specification

```python
import meridian
from meridian.model import model

# Create a Meridian model
mmm = model.Meridian(
    dataset=dataset,
    # Model configuration
    model_config={
        'use_hierarchical_model': True,  # Use geo-level model if data available
        'use_reach_and_frequency': True,  # If reach/frequency data provided
        'use_query_volume': True,        # If GQV data provided
        'model_name': 'my_mmm_model'
    },
    # Media effect configuration
    media_config={
        'adstock_function': 'geometric',
        'saturation_function': 'hill'
    }
)
```

### 6.3 Prior Configuration

Meridian's Bayesian approach allows incorporating prior knowledge:

```python
# Setting informative priors for media channels
media_priors = {
    'channel_1': {
        'roi_prior_mean': 5.0,
        'roi_prior_sd': 1.0
    },
    'channel_2': {
        'roi_prior_mean': 3.0,
        'roi_prior_sd': 0.8
    }
}

mmm = model.Meridian(
    dataset=dataset,
    media_priors=media_priors,
    # Other configurations...
)
```

### 6.4 Media Transformation Configuration

Media effects are modeled using:

1. **Adstock Functions** (for lagged effects):
   - Geometric decay (default)
   - Other options available through customization

2. **Saturation Functions** (for diminishing returns):
   - Hill function (default)
   - Other options available through customization

---

## 7. Training Process

### 7.1 MCMC Sampling

Meridian uses Markov Chain Monte Carlo (MCMC) with No U-Turn Sampler (NUTS):

```python
# Generate prior samples
mmm.sample_prior(n_samples=500)

# Generate posterior samples
mmm.sample_posterior(
    n_chains=7,              # Number of parallel MCMC chains
    n_adapt=500,             # Adaptation steps
    n_burnin=500,            # Burn-in steps to discard
    n_keep=1000,             # Samples to keep
    seed=1                   # Random seed for reproducibility
)
```

### 7.2 Training Parameters

Key sampling parameters to configure:
- `n_chains`: More chains provide better convergence diagnostics (4-8 recommended)
- `n_adapt`: Adaptation phase length (500-1000 recommended)
- `n_burnin`: Burn-in samples to discard (500-1000 recommended)
- `n_keep`: Posterior samples to retain (1000+ recommended)

### 7.3 GPU Acceleration

GPU acceleration is crucial for reasonable training times:

```python
# Check if GPU is available
import tensorflow as tf
print("GPU Available:", tf.config.list_physical_devices('GPU'))

# For optimal performance, ensure TensorFlow is using GPU
tf.config.set_visible_devices(tf.config.list_physical_devices('GPU'), 'GPU')
```

### 7.4 Training Time Expectations

Approximate training times:
- Small models (national level): 15-30 minutes with GPU
- Medium models (10-20 geos): 1-2 hours with GPU
- Large models (50+ geos): 4-8+ hours with GPU
- All models: 5-10x longer without GPU

---

## 8. Analysis & Visualization

### 8.1 Model Diagnostics

After training, assess model quality:

```python
# Check MCMC convergence
diagnostics = mmm.fit_diagnostics()

# Key diagnostic metrics
r_hat = diagnostics.r_hat()
effective_sample_size = diagnostics.effective_sample_size()

# Model fit assessment
insample_fit = mmm.insample_fit()
outsample_fit = mmm.outsample_fit()  # If validation data provided
```

Key diagnostic thresholds:
- R-hat values should be close to 1.0 (< 1.1 generally acceptable)
- Effective sample size should be sufficiently large (> 100 per parameter)

### 8.2 Result Analysis

Use the Analyzer class to extract insights:

```python
from meridian.analysis import analyzer

# Create analyzer from trained model
analysis = analyzer.Analyzer(mmm)

# Calculate channel contributions
contributions = analysis.incremental_impact()

# Calculate ROI by channel
roi_results = analysis.roi()

# Calculate marginal ROI for optimization
marginal_roi = analysis.marginal_roi()
```

### 8.3 Visualization

Meridian provides visualization utilities:

```python
from meridian.visualization import plots

# Channel contribution
plots.plot_contributions(contributions)

# ROI comparison
plots.plot_roi(roi_results)

# Media response curves
plots.plot_response_curves(mmm)

# Model fit visualization
plots.plot_model_fit(insample_fit)
```

---

## 9. Optimization Workflows

### 9.1 Budget Allocation

Optimize your marketing budget:

```python
# Budget allocation optimizer
optimal_allocation = analysis.budget_allocator(
    total_budget=1000000,           # Total budget constraint
    channel_constraints={           # Optional channel constraints
        'channel_1': {
            'min': 100000,
            'max': 300000
        }
    },
    target_metric='roi'             # Optimize for ROI
)

# Visualize allocation
plots.plot_budget_allocation(
    current_allocation=current_budget,
    optimal_allocation=optimal_allocation
)
```

### 9.2 Scenario Planning

Test different budget scenarios:

```python
# Define multiple scenarios
scenarios = {
    'baseline': current_budget,
    'increased_budget': {k: v * 1.2 for k, v in current_budget.items()},
    'decreased_budget': {k: v * 0.8 for k, v in current_budget.items()},
    'optimal': optimal_allocation
}

# Evaluate scenarios
scenario_results = analysis.evaluate_scenarios(scenarios)

# Compare outcomes
plots.plot_scenario_comparison(scenario_results)
```

### 9.3 Frequency Optimization

If using reach and frequency data:

```python
# Optimize for target frequency
optimal_frequency = analysis.frequency_optimizer(
    channel='youtube',
    target_metric='roi'
)
```

---

## 10. Integration Patterns

### 10.1 Data Integration

Meridian can be integrated with various data sources:

1. **Google Marketing Platform**:
   - Campaign Manager 360
   - Display & Video 360
   - Google Ads
   - YouTube

2. **MMM Data Platform**:
   - Google Query Volume (GQV)
   - YouTube reach and frequency data

3. **Custom Data Sources**:
   - Data warehouses
   - Marketing dashboards
   - Business intelligence tools

### 10.2 Workflow Integration

Typical integration patterns:

```python
# Example automated workflow
def weekly_mmm_update(new_data_path):
    # Load previous model
    previous_model = meridian.model.load_model('previous_model.pkl')
    
    # Load new data
    new_data = pd.read_csv(new_data_path)
    
    # Update dataset
    updated_dataset = previous_model.dataset.update(new_data)
    
    # Retrain model with updated data
    updated_model = model.Meridian(
        dataset=updated_dataset,
        # Use previous model's configuration
        **previous_model.get_config()
    )
    
    # Sample from posterior
    updated_model.sample_posterior()
    
    # Save updated model
    updated_model.save('updated_model.pkl')
    
    # Generate and export reports
    analysis = analyzer.Analyzer(updated_model)
    reports = analysis.generate_reports()
    
    return reports
```

### 10.3 Output Integration

Approaches for sharing Meridian outputs:

1. **Dashboarding**:
   - Export results to CSV/JSON
   - Connect to BI tools via APIs
   - Schedule automated updates

2. **Reporting**:
   - Generate PDF reports with key findings
   - Export visualizations as images
   - Create interactive notebooks

3. **Decision Support**:
   - Connect optimization results to campaign planning tools
   - Implement forecasting APIs
   - Feed into broader marketing systems

---

## 11. Troubleshooting

### 11.1 Common Issues

#### MCMC Convergence Problems

```python
# If you see R-hat values > 1.1
# Try increasing adaptation and burn-in phases
mmm.sample_posterior(
    n_adapt=1000,  # Increase from default
    n_burnin=1000, # Increase from default
    n_chains=8     # Try more chains
)

# If issues persist, check for data problems
# - Highly correlated media channels
# - Extreme outliers
# - Insufficient data variation
```

#### Negative or Low Baselines

If model produces implausible baseline estimates:
- Check for highly correlated media and control variables
- Consider adding additional control variables
- Verify that media spend patterns have sufficient variation
- Try stronger priors on baseline parameters

#### GPU Memory Issues

```python
# If encountering GPU OOM errors
import tensorflow as tf

# Limit GPU memory growth
gpus = tf.config.experimental.list_physical_devices('GPU')
for gpu in gpus:
    tf.config.experimental.set_memory_growth(gpu, True)

# Alternatively, limit total memory usage
tf.config.set_logical_device_configuration(
    gpus[0],
    [tf.config.LogicalDeviceConfiguration(memory_limit=10240)]  # 10GB limit
)
```

### 11.2 Performance Optimization

For large models:

```python
# Reduce number of predictors if possible
# Focus on key channels and control variables

# Increase computational resources
# - Use more powerful GPUs
# - Distribute across multiple GPUs if available

# Optimize sampling parameters
mmm.sample_posterior(
    n_chains=4,              # Fewer chains if memory-constrained
    target_accept_prob=0.8,  # Increase for more stable sampling
    max_tree_depth=10        # Limit tree depth for memory savings
)
```

### 11.3 Data Quality Issues

Common data problems and solutions:
- **Missing values**: Impute or exclude affected periods
- **Outliers**: Cap extreme values or use robust modeling approaches
- **Highly correlated channels**: Consider combining or removing one
- **Insufficient variation**: Ensure adequate spend variation across time

---

## 12. Advanced Use Cases

### 12.1 Experimental Calibration

Incorporating experimental results as priors:

```python
# Example incorporating lift test results
experiment_results = {
    'channel_1': {
        'experiment_roi': 4.5,
        'experiment_confidence': 0.9  # Higher confidence = stronger prior
    }
}

# Use in model configuration
mmm = model.Meridian(
    dataset=dataset,
    experiment_priors=experiment_results,
    # Other configurations...
)
```

### 12.2 Time-varying Analysis

While Meridian doesn't directly support time-varying coefficients, you can:

```python
# Approach 1: Window-based analysis
def rolling_window_analysis(dataset, window_size=26):
    results = []
    
    for start_idx in range(0, len(dataset.time_periods) - window_size):
        end_idx = start_idx + window_size
        
        # Create windowed dataset
        window_dataset = dataset.slice_time(start_idx, end_idx)
        
        # Train model on window
        window_model = model.Meridian(dataset=window_dataset)
        window_model.sample_posterior()
        
        # Analyze window results
        window_analysis = analyzer.Analyzer(window_model)
        window_roi = window_analysis.roi()
        
        results.append({
            'time_period': dataset.time_periods[start_idx],
            'roi': window_roi
        })
    
    return pd.DataFrame(results)
```

### 12.3 Custom Model Extensions

Extending Meridian with custom components:

```python
# Example: Custom adstock function
import tensorflow as tf
import tensorflow_probability as tfp

def custom_adstock_function(x, theta, l_max=8):
    """
    Custom adstock with flexible decay pattern
    """
    # Implementation using TensorFlow operations
    # ...
    
    return transformed_x

# Register custom function with Meridian
meridian.model.register_adstock_function('custom_adstock', custom_adstock_function)

# Use in model
mmm = model.Meridian(
    dataset=dataset,
    media_config={
        'adstock_function': 'custom_adstock',
        # Other parameters...
    }
)
```

---

## 13. Resources

### 13.1 Official Documentation

- [Meridian Main Documentation](https://developers.google.com/meridian)
- [GitHub Repository](https://github.com/google/meridian)
- [API Reference](https://developers.google.com/meridian/reference/api/meridian)
- [Getting Started Tutorial](https://developers.google.com/meridian/docs/user-guide)

### 13.2 Methodological Papers

- Geo-level Bayesian Hierarchical Media Mix Modeling
- Media Mix Model Calibration with Bayesian Priors
- Bayesian Methods for Media Mix Modeling with Carryover and Shape Effects
- Bayesian Hierarchical Media Mix Model Incorporating Reach and Frequency Data

### 13.3 Community Support

- [GitHub Issues](https://github.com/google/meridian/issues)
- [GitHub Discussions](https://github.com/google/meridian/discussions)
- [Partner Program](https://blog.google/products/ads-commerce/meridian-marketing-mix-model-open-to-everyone/)

### 13.4 Related Tools

- GeoX: For experimental design and analysis
- LightweightMMM: Google's previous MMM library (now replaced by Meridian)
- PyMC Marketing: Alternative Bayesian MMM approach
- Robyn: Meta's open-source MMM platform
