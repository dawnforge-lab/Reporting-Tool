import OpenAI from 'openai';

// Initialize the OpenAI client with API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-api-key-here', // Replace with your API key or use environment variable
});

/**
 * Generate a report using DeepSeek V3 models
 * 
 * @param title Report title
 * @param description Report description
 * @param data Report data
 * @param type Report type
 * @param channels Marketing channels
 * @param metrics Performance metrics
 * @returns Generated report content and reasoning
 */
export async function generateReportWithDeepSeek(
  title: string,
  description: string,
  data: any,
  type: string,
  channels: string[],
  metrics: string[]
): Promise<{ htmlContent: string; reasoning: string; insights?: any[] }> {
  try {
    // Create a system prompt for the DeepSeek model
    const systemPrompt = `You are an expert marketing analyst and data scientist specializing in digital marketing analytics. 
Your task is to generate a comprehensive marketing report based on the provided data.
The report should include data visualizations, insights, and recommendations.
Use HTML format with inline CSS for styling. Include charts and tables where appropriate.
Focus on extracting actionable insights from the data and providing clear recommendations.`;

    // Create a user prompt with the report details and data
    const userPrompt = `Generate a ${type} report titled "${title}"${description ? ` with the following description: "${description}"` : ''}.

The report should analyze the following channels: ${channels.join(', ')}.
The key metrics to focus on are: ${metrics.join(', ')}.

Here is the data to analyze (in JSON format):
${JSON.stringify(data, null, 2)}

Please structure the report with the following sections:
1. Executive Summary
2. Performance Overview
3. Channel Analysis
4. Key Insights
5. Recommendations

For the HTML output, use a clean, professional design with:
- A responsive layout
- Data visualizations (represented as HTML tables for now)
- Clear section headings
- Professional color scheme

Show your reasoning process for how you analyzed the data and generated insights.`;

    // For demonstration purposes, we'll create a mock response
    // In a production environment, this would call the actual DeepSeek API
    const mockHtmlContent = generateMockReportHtml(title, description, type, channels, metrics, data);
    const mockReasoning = generateMockReasoning(data, type);
    const mockInsights = generateMockInsights(data, channels);

    // In a real implementation, you would call the DeepSeek API like this:
    /*
    const response = await openai.chat.completions.create({
      model: "deepseek-v3-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const content = response.choices[0].message.content;
    
    // Parse the response to extract HTML content and reasoning
    // This would depend on how the DeepSeek API structures its response
    const htmlContent = extractHtmlContent(content);
    const reasoning = extractReasoning(content);
    */

    return {
      htmlContent: mockHtmlContent,
      reasoning: mockReasoning,
      insights: mockInsights
    };
  } catch (error) {
    console.error('Error generating report with DeepSeek:', error);
    throw new Error(`Failed to generate report: ${error.message}`);
  }
}

/**
 * Generate insights using DeepSeek V3 models
 * 
 * @param data Data to analyze
 * @param context Additional context
 * @returns Generated insights
 */
export async function generateInsightsWithDeepSeek(
  data: any,
  context: any = {}
): Promise<any[]> {
  try {
    // Create a system prompt for the DeepSeek model
    const systemPrompt = `You are an expert marketing analyst with deep expertise in data analysis and marketing strategy.
Your task is to analyze the provided marketing data and generate actionable insights.
Focus on identifying patterns, anomalies, opportunities, and risks.
Each insight should include a clear explanation and a specific recommendation.`;

    // Create a user prompt with the data and context
    const userPrompt = `Analyze the following marketing data and generate 3-5 key insights:

${JSON.stringify(data, null, 2)}

${context.additionalInstructions || ''}

For each insight, provide:
1. A clear title
2. A detailed explanation of what you found
3. Why it matters
4. A specific, actionable recommendation

Use your reasoning capabilities to think step by step and explain your analysis process.`;

    // For demonstration purposes, we'll create a mock response
    // In a production environment, this would call the actual DeepSeek API
    const mockInsights = generateMockInsights(data, context.channels || []);

    // In a real implementation, you would call the DeepSeek API like this:
    /*
    const response = await openai.chat.completions.create({
      model: "deepseek-v3-reasoner",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content;
    
    // Parse the response to extract insights
    // This would depend on how the DeepSeek API structures its response
    const insights = parseInsightsFromResponse(content);
    */

    return mockInsights;
  } catch (error) {
    console.error('Error generating insights with DeepSeek:', error);
    throw new Error(`Failed to generate insights: ${error.message}`);
  }
}

/**
 * Generate a mock HTML report for demonstration purposes
 */
function generateMockReportHtml(
  title: string,
  description: string,
  type: string,
  channels: string[],
  metrics: string[],
  data: any
): string {
  // Get some data for the report
  const period = data.period || 'last_30_days';
  const channelData = data.channels || {};
  const totals = data.totals || {};
  
  // Create a mock HTML report
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      color: #2c3e50;
      border-bottom: 2px solid #3498db;
      padding-bottom: 10px;
    }
    h2 {
      color: #2c3e50;
      margin-top: 30px;
    }
    h3 {
      color: #3498db;
    }
    .executive-summary {
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 5px;
      margin-bottom: 30px;
    }
    .metric-card {
      background-color: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 5px;
      padding: 15px;
      margin-bottom: 20px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    .metric-value {
      font-size: 24px;
      font-weight: bold;
      color: #3498db;
    }
    .metric-label {
      font-size: 14px;
      color: #7f8c8d;
    }
    .metrics-container {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      margin-bottom: 30px;
    }
    .metric-card {
      flex: 1;
      min-width: 200px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    th, td {
      padding: 12px 15px;
      text-align: left;
      border-bottom: 1px solid #e0e0e0;
    }
    th {
      background-color: #f8f9fa;
      font-weight: bold;
    }
    tr:hover {
      background-color: #f8f9fa;
    }
    .chart-container {
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 5px;
      margin-bottom: 30px;
      height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .chart-placeholder {
      color: #7f8c8d;
      font-style: italic;
    }
    .insights-container {
      margin-bottom: 30px;
    }
    .insight-card {
      background-color: #f8f9fa;
      border-left: 4px solid #3498db;
      padding: 15px;
      margin-bottom: 20px;
    }
    .recommendations-container {
      margin-bottom: 30px;
    }
    .recommendation-card {
      background-color: #f8f9fa;
      border-left: 4px solid #2ecc71;
      padding: 15px;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${description ? `<p>${description}</p>` : ''}
  
  <section class="executive-summary">
    <h2>1. Executive Summary</h2>
    <p>This ${type} report analyzes marketing performance across ${channels.length} channels over the ${formatPeriod(period)}. The analysis focuses on ${metrics.join(', ')} to provide actionable insights and recommendations.</p>
    
    <div class="metrics-container">
      ${metrics.slice(0, 4).map(metric => {
        const value = totals[metric] || getRandomMetricValue(metric);
        return `
        <div class="metric-card">
          <div class="metric-value">${formatMetricValue(metric, value)}</div>
          <div class="metric-label">Total ${metric}</div>
        </div>
        `;
      }).join('')}
    </div>
    
    <p>Overall, the marketing performance shows ${getRandomTrend()} compared to the previous period. Key areas of focus should be optimizing ${getRandomChannel(channels)} and improving ${getRandomMetric(metrics)}.</p>
  </section>
  
  <section>
    <h2>2. Performance Overview</h2>
    
    <div class="chart-container">
      <div class="chart-placeholder">[Performance Overview Chart - Visualization of key metrics over time]</div>
    </div>
    
    <table>
      <thead>
        <tr>
          <th>Metric</th>
          ${channels.map(channel => `<th>${channel}</th>`).join('')}
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${metrics.map(metric => `
        <tr>
          <td>${metric}</td>
          ${channels.map(channel => {
            const value = channelData[channel]?.[metric] || getRandomMetricValue(metric);
            return `<td>${formatMetricValue(metric, value)}</td>`;
          }).join('')}
          <td>${formatMetricValue(metric, totals[metric] || getRandomMetricValue(metric))}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
  </section>
  
  <section>
    <h2>3. Channel Analysis</h2>
    
    ${channels.map(channel => `
    <h3>${channel}</h3>
    <div class="chart-container">
      <div class="chart-placeholder">[${channel} Performance Chart - Visualization of metrics over time]</div>
    </div>
    <p>${getRandomChannelAnalysis(channel, metrics)}</p>
    `).join('')}
  </section>
  
  <section class="insights-container">
    <h2>4. Key Insights</h2>
    
    <div class="insight-card">
      <h3>Channel Efficiency Varies Significantly</h3>
      <p>Analysis shows that ${getRandomChannel(channels)} delivers the highest ROI at ${(Math.random() * 5 + 2).toFixed(2)}x, while ${getRandomChannel(channels)} has the lowest at ${(Math.random() * 2 + 0.5).toFixed(2)}x. This suggests an opportunity to reallocate budget from low to high-performing channels.</p>
    </div>
    
    <div class="insight-card">
      <h3>Day-of-Week Performance Patterns</h3>
      <p>Consistent patterns show that ${getRandomMetric(metrics)} peaks on ${getRandomDay()} and drops significantly on ${getRandomDay()}. This pattern is particularly strong for ${getRandomChannel(channels)} campaigns.</p>
    </div>
    
    <div class="insight-card">
      <h3>Conversion Rate Optimization Opportunity</h3>
      <p>The data reveals that while ${getRandomChannel(channels)} drives high traffic volume, its conversion rate is ${(Math.random() * 2 + 0.5).toFixed(2)}% below average. Improving landing page experience could significantly increase overall performance.</p>
    </div>
  </section>
  
  <section class="recommendations-container">
    <h2>5. Recommendations</h2>
    
    <div class="recommendation-card">
      <h3>Optimize Budget Allocation</h3>
      <p>Shift ${(Math.random() * 20 + 10).toFixed(0)}% of the budget from ${getRandomChannel(channels)} to ${getRandomChannel(channels)} to improve overall ROI by an estimated ${(Math.random() * 15 + 5).toFixed(0)}%.</p>
    </div>
    
    <div class="recommendation-card">
      <h3>Implement Day-of-Week Scheduling</h3>
      <p>Increase bid adjustments by ${(Math.random() * 30 + 20).toFixed(0)}% on ${getRandomDay()} and reduce spend on ${getRandomDay()} to capitalize on performance patterns.</p>
    </div>
    
    <div class="recommendation-card">
      <h3>A/B Test Landing Pages</h3>
      <p>Develop and test new landing page variants for ${getRandomChannel(channels)} campaigns to address the conversion rate gap, with a target improvement of ${(Math.random() * 30 + 20).toFixed(0)}%.</p>
    </div>
  </section>
</body>
</html>
  `;
}

/**
 * Generate mock reasoning for demonstration purposes
 */
function generateMockReasoning(data: any, type: string): string {
  return `
# Reasoning Process for ${type.charAt(0).toUpperCase() + type.slice(1)} Report Analysis

## Step 1: Data Exploration and Validation
First, I examined the provided dataset to understand its structure, time period, and available metrics. The dataset contains:
- Time period: ${data.period || 'last_30_days'}
- Marketing channels: ${Object.keys(data.channels || {}).join(', ') || 'Multiple channels'}
- Key metrics: Impressions, Clicks, Conversions, Cost, Revenue, and derived metrics

I validated the data for completeness and consistency, checking for any anomalies or missing values that might affect the analysis.

## Step 2: Performance Overview Analysis
I calculated aggregate metrics across all channels to establish baseline performance:
- Total Impressions: ${formatLargeNumber(sumMetricAcrossChannels(data, 'Impressions'))}
- Total Clicks: ${formatLargeNumber(sumMetricAcrossChannels(data, 'Clicks'))}
- Total Conversions: ${formatLargeNumber(sumMetricAcrossChannels(data, 'Conversions'))}
- Total Cost: $${formatLargeNumber(sumMetricAcrossChannels(data, 'Cost'))}
- Total Revenue: $${formatLargeNumber(sumMetricAcrossChannels(data, 'Revenue'))}

I then calculated key performance indicators:
- Overall CTR: ${((sumMetricAcrossChannels(data, 'Clicks') / sumMetricAcrossChannels(data, 'Impressions')) * 100).toFixed(2)}%
- Overall Conversion Rate: ${((sumMetricAcrossChannels(data, 'Conversions') / sumMetricAcrossChannels(data, 'Clicks')) * 100).toFixed(2)}%
- Overall ROAS: ${(sumMetricAcrossChannels(data, 'Revenue') / sumMetricAcrossChannels(data, 'Cost')).toFixed(2)}x

## Step 3: Channel-by-Channel Analysis
For each marketing channel, I performed a detailed analysis to understand its performance relative to other channels:

${Object.keys(data.channels || {}).map(channel => `
### ${channel} Analysis:
- Contribution to total spend: ${((getChannelMetric(data, channel, 'Cost') / sumMetricAcrossChannels(data, 'Cost')) * 100).toFixed(2)}%
- Contribution to total revenue: ${((getChannelMetric(data, channel, 'Revenue') / sumMetricAcrossChannels(data, 'Revenue')) * 100).toFixed(2)}%
- Channel-specific ROAS: ${(getChannelMetric(data, channel, 'Revenue') / getChannelMetric(data, channel, 'Cost')).toFixed(2)}x
- Efficiency assessment: ${getEfficiencyAssessment(getChannelMetric(data, channel, 'Revenue') / getChannelMetric(data, channel, 'Cost'))}
`).join('')}

## Step 4: Trend Analysis
I analyzed the time series data to identify trends, seasonality, and anomalies:
- Overall trend direction: ${getRandomTrend()}
- Day-of-week patterns: Identified stronger performance on ${getRandomDay()} and ${getRandomDay()}
- Correlation between spend and revenue: ${(Math.random() * 0.5 + 0.5).toFixed(2)} (moderate to strong positive correlation)

## Step 5: Insight Generation
Based on the comprehensive analysis, I identified several key insights:
1. Channel efficiency varies significantly, with some channels delivering much higher ROI than others
2. Clear day-of-week performance patterns that can be leveraged for optimization
3. Opportunities to improve conversion rates on high-traffic channels

## Step 6: Recommendation Development
Finally, I developed actionable recommendations based on the insights:
1. Optimize budget allocation to favor high-performing channels
2. Implement day-of-week scheduling to capitalize on temporal patterns
3. A/B test landing pages to improve conversion rates

These recommendations are prioritized based on potential impact and implementation complexity.
`;
}

/**
 * Generate mock insights for demonstration purposes
 */
function generateMockInsights(data: any, channels: string[]): any[] {
  const channelList = channels.length > 0 ? channels : Object.keys(data.channels || {});
  if (channelList.length === 0) {
    channelList.push('Paid Search', 'Social Media', 'Email', 'Display');
  }
  
  return [
    {
      title: 'Budget Reallocation Opportunity',
      explanation: `Analysis shows that ${getRandomChannel(channelList)} is significantly outperforming ${getRandomChannel(channelList)} with a ROAS of ${(Math.random() * 5 + 3).toFixed(2)}x compared to ${(Math.random() * 2 + 0.5).toFixed(2)}x. This represents a clear opportunity to optimize marketing spend allocation.`,
      recommendation: `Reallocate ${(Math.random() * 20 + 10).toFixed(0)}% of the budget from low-performing channels to ${getRandomChannel(channelList)} to improve overall marketing ROI by an estimated ${(Math.random() * 15 + 5).toFixed(0)}%.`
    },
    {
      title: 'Conversion Rate Optimization Needed',
      explanation: `While ${getRandomChannel(channelList)} drives the highest traffic volume with ${formatLargeNumber(Math.floor(Math.random() * 100000 + 50000))} impressions, its conversion rate of ${(Math.random() * 1 + 0.5).toFixed(2)}% is below the average of ${(Math.random() * 2 + 1).toFixed(2)}%. This suggests issues with landing page experience or audience targeting.`,
      recommendation: `Develop and A/B test new landing page designs for ${getRandomChannel(channelList)} campaigns, focusing on improving call-to-action clarity and reducing form friction to increase conversion rates.`
    },
    {
      title: 'Untapped Audience Segments',
      explanation: `Demographic analysis reveals that the 25-34 age group has a ${(Math.random() * 30 + 20).toFixed(0)}% higher conversion rate than other segments, but only receives ${(Math.random() * 15 + 5).toFixed(0)}% of the current ad spend. This represents a significant growth opportunity.`,
      recommendation: `Create dedicated campaigns targeting the high-converting 25-34 age demographic with customized messaging and increase budget allocation to this segment by ${(Math.random() * 20 + 10).toFixed(0)}%.`
    },
    {
      title: 'Seasonal Performance Pattern',
      explanation: `Time series analysis shows a consistent ${(Math.random() * 30 + 20).toFixed(0)}% performance increase in the middle of each month, followed by a decline in the last week. This pattern is particularly pronounced for ${getRandomChannel(channelList)} and correlates with typical paycheck cycles.`,
      recommendation: `Implement a pulsed budget strategy that increases spend by ${(Math.random() * 25 + 15).toFixed(0)}% during the high-performance mid-month period and reduces spend during lower-performing end-of-month periods.`
    }
  ];
}

// Helper functions for the mock report generation

function formatPeriod(period: string): string {
  switch (period) {
    case 'last_7_days':
      return 'past 7 days';
    case 'last_30_days':
      return 'past 30 days';
    case 'last_90_days':
      return 'past 90 days';
    case 'last_12_months':
      return 'past 12 months';
    default:
      return period.replace(/_/g, ' ');
  }
}

function getRandomMetricValue(metric: string): number {
  switch (metric.toLowerCase()) {
    case 'impressions':
      return Math.floor(Math.random() * 1000000) + 100000;
    case 'clicks':
      return Math.floor(Math.random() * 50000) + 5000;
    case 'conversions':
      return Math.floor(Math.random() * 1000) + 100;
    case 'cost':
      return Math.floor(Math.random() * 50000) + 5000;
    case 'revenue':
      return Math.floor(Math.random() * 200000) + 20000;
    case 'roas':
      return (Math.random() * 5) + 1;
    case 'ctr':
      return (Math.random() * 5) + 0.5;
    case 'conversion rate':
      return (Math.random() * 10) + 1;
    default:
      return Math.floor(Math.random() * 1000) + 100;
  }
}

function formatMetricValue(metric: string, value: number): string {
  const metricLower = metric.toLowerCase();
  if (metricLower === 'cost' || metricLower === 'revenue' || metricLower === 'cpa') {
    return `$${formatLargeNumber(value)}`;
  } else if (metricLower === 'ctr' || metricLower === 'conversion rate') {
    return `${value.toFixed(2)}%`;
  } else if (metricLower === 'roas') {
    return `${value.toFixed(2)}x`;
  } else {
    return formatLargeNumber(value);
  }
}

function formatLargeNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  } else {
    return num.toFixed(0);
  }
}

function getRandomTrend(): string {
  const trends = [
    'a positive trend',
    'a strong upward trend',
    'a slight improvement',
    'mixed results',
    'a slight decline',
    'consistent performance'
  ];
  return trends[Math.floor(Math.random() * trends.length)];
}

function getRandomChannel(channels: string[]): string {
  return channels[Math.floor(Math.random() * channels.length)];
}

function getRandomMetric(metrics: string[]): string {
  return metrics[Math.floor(Math.random() * metrics.length)];
}

function getRandomDay(): string {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return days[Math.floor(Math.random() * days.length)];
}

function getRandomChannelAnalysis(channel: string, metrics: string[]): string {
  const performances = ['strong', 'moderate', 'mixed', 'underperforming', 'improving'];
  const performance = performances[Math.floor(Math.random() * performances.length)];
  
  const randomMetric = getRandomMetric(metrics);
  const randomValue = getRandomMetricValue(randomMetric);
  
  return `${channel} shows ${performance} performance with ${formatMetricValue(randomMetric, randomValue)} ${randomMetric.toLowerCase()}. The channel has a ${(Math.random() * 20 - 10).toFixed(1)}% change compared to the previous period. Key areas for optimization include improving ${getRandomMetric(metrics).toLowerCase()} and testing new ${Math.random() > 0.5 ? 'creative assets' : 'audience targeting'}.`;
}

function sumMetricAcrossChannels(data: any, metric: string): number {
  let sum = 0;
  const channels = data.channels || {};
  
  for (const channel in channels) {
    sum += getChannelMetric(data, channel, metric);
  }
  
  return sum || getRandomMetricValue(metric);
}

function getChannelMetric(data: any, channel: string, metric: string): number {
  return data.channels?.[channel]?.[metric] || getRandomMetricValue(metric);
}

function getEfficiencyAssessment(roas: number): string {
  if (roas >= 4) return 'Highly efficient';
  if (roas >= 2.5) return 'Efficient';
  if (roas >= 1.5) return 'Moderately efficient';
  if (roas >= 1) return 'Break-even';
  return 'Inefficient';
}
