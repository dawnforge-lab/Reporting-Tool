import { NextRequest, NextResponse } from 'next/server';
import { generateReportWithDeepSeek } from '@/lib/deepseek';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, type, dataSources, channels, metrics, period } = body;
    
    // Validate required fields
    if (!title || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Mock data for demonstration purposes
    // In a real implementation, this would be fetched from the selected data sources
    const mockData = generateMockData(type, channels, metrics, period);
    
    // Generate report using DeepSeek V3
    const { htmlContent, reasoning } = await generateReportWithDeepSeek(
      title,
      description || '',
      mockData,
      type,
      channels || [],
      metrics || []
    );
    
    return NextResponse.json({
      message: 'Report generated successfully',
      report: {
        title,
        type,
        htmlContent,
        reasoning
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error generating report template:', error);
    return NextResponse.json(
      { error: 'Failed to generate report template' },
      { status: 500 }
    );
  }
}

// Helper function to generate mock data based on report type
function generateMockData(type: string, channels?: string[], metrics?: string[], period?: string) {
  // Create base data structure
  const data = {
    period: period || 'last_30_days',
    channels: {},
    metrics: {},
    totals: {}
  };
  
  // Default channels if none provided
  const reportChannels = channels?.length ? channels : ['Paid Search', 'Social Media', 'Email', 'Display'];
  
  // Default metrics if none provided
  const reportMetrics = metrics?.length ? metrics : ['Impressions', 'Clicks', 'Conversions', 'Cost', 'Revenue'];
  
  // Generate data for each channel
  reportChannels.forEach(channel => {
    data.channels[channel] = {};
    
    reportMetrics.forEach(metric => {
      // Generate appropriate mock values based on metric and channel
      switch (metric) {
        case 'Impressions':
          data.channels[channel][metric] = Math.floor(Math.random() * 1000000) + 100000;
          break;
        case 'Clicks':
          data.channels[channel][metric] = Math.floor(Math.random() * 50000) + 5000;
          break;
        case 'Conversions':
          data.channels[channel][metric] = Math.floor(Math.random() * 1000) + 100;
          break;
        case 'Cost':
          data.channels[channel][metric] = Math.floor(Math.random() * 50000) + 5000;
          break;
        case 'Revenue':
          data.channels[channel][metric] = Math.floor(Math.random() * 200000) + 20000;
          break;
        default:
          data.channels[channel][metric] = Math.floor(Math.random() * 1000) + 100;
      }
    });
    
    // Add derived metrics
    if (data.channels[channel]['Clicks'] && data.channels[channel]['Impressions']) {
      data.channels[channel]['CTR'] = (data.channels[channel]['Clicks'] / data.channels[channel]['Impressions'] * 100).toFixed(2) + '%';
    }
    
    if (data.channels[channel]['Conversions'] && data.channels[channel]['Clicks']) {
      data.channels[channel]['Conversion Rate'] = (data.channels[channel]['Conversions'] / data.channels[channel]['Clicks'] * 100).toFixed(2) + '%';
    }
    
    if (data.channels[channel]['Revenue'] && data.channels[channel]['Cost']) {
      data.channels[channel]['ROAS'] = (data.channels[channel]['Revenue'] / data.channels[channel]['Cost']).toFixed(2) + 'x';
    }
  });
  
  // Calculate totals for each metric
  reportMetrics.forEach(metric => {
    data.totals[metric] = Object.values(data.channels).reduce((sum, channel: any) => sum + (channel[metric] || 0), 0);
  });
  
  // Add time series data for charts
  data['timeSeriesData'] = generateTimeSeriesData(reportChannels, reportMetrics, period);
  
  return data;
}

// Helper function to generate time series data for charts
function generateTimeSeriesData(channels: string[], metrics: string[], period?: string) {
  const timeSeriesData = [];
  
  // Determine number of data points based on period
  let dataPoints = 30; // default to 30 days
  if (period === 'last_7_days') dataPoints = 7;
  if (period === 'last_90_days') dataPoints = 90;
  if (period === 'last_12_months') dataPoints = 12;
  
  // Generate data for each time point
  for (let i = 0; i < dataPoints; i++) {
    const dataPoint: any = {
      date: new Date(Date.now() - (dataPoints - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    
    // Add data for each channel and metric
    channels.forEach(channel => {
      metrics.forEach(metric => {
        const baseValue = Math.random() * 1000 + 100;
        // Add some trend and seasonality
        const trend = i / dataPoints * 200; // upward trend
        const seasonality = Math.sin(i / 7 * Math.PI) * 100; // weekly seasonality
        
        dataPoint[`${channel}_${metric}`] = Math.max(0, Math.floor(baseValue + trend + seasonality));
      });
    });
    
    timeSeriesData.push(dataPoint);
  }
  
  return timeSeriesData;
}
