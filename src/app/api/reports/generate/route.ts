import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/db';

// This is a simplified report generator for demo purposes
// In a production app, you would use more sophisticated data processing and visualization
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
    
    // In a real app, we would fetch data from the specified data sources
    // For demo purposes, we'll generate a mock report
    
    const reportId = uuidv4();
    const userId = 'demo-user-id';
    const config = {
      type,
      dataSources: dataSources || [],
      channels: channels || [],
      metrics: metrics || [],
      period: period || 'last_30_days'
    };
    
    // Generate mock HTML content for the report
    const htmlContent = generateMockReportHtml(title, description, type, channels, metrics);
    
    // Save the report to the database
    const db = await getDb();
    await db.prepare(
      `INSERT INTO reports (id, title, description, type, config, user_id, html_content, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
    ).bind(
      reportId,
      title,
      description || '',
      type,
      JSON.stringify(config),
      userId,
      htmlContent
    ).run();
    
    // Generate insights for the report
    const insights = generateMockInsights(type, channels, metrics);
    
    // Save insights to the database
    for (const insight of insights) {
      const insightId = uuidv4();
      await db.prepare(
        `INSERT INTO insights (id, title, explanation, recommendation, report_id, user_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
      ).bind(
        insightId,
        insight.title,
        insight.explanation,
        insight.recommendation,
        reportId,
        userId
      ).run();
    }
    
    return NextResponse.json({
      message: 'Report generated successfully',
      report: {
        id: reportId,
        title,
        type,
        insights
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

// Helper function to generate mock report HTML
function generateMockReportHtml(title: string, description?: string, type?: string, channels?: string[], metrics?: string[]) {
  return `
    <div class="report">
      <h1>${title}</h1>
      ${description ? `<p>${description}</p>` : ''}
      
      <div class="report-section">
        <h2>Executive Summary</h2>
        <p>This report provides an analysis of marketing performance across ${channels?.join(', ') || 'all channels'} 
        focusing on ${metrics?.join(', ') || 'key metrics'}.</p>
        
        <div class="metrics-summary">
          <div class="metric-card">
            <h3>Total Impressions</h3>
            <p class="metric-value">1.2M</p>
            <p class="metric-change positive">+15% vs previous period</p>
          </div>
          
          <div class="metric-card">
            <h3>Conversion Rate</h3>
            <p class="metric-value">3.2%</p>
            <p class="metric-change negative">-2% vs previous period</p>
          </div>
          
          <div class="metric-card">
            <h3>Cost per Acquisition</h3>
            <p class="metric-value">$24.50</p>
            <p class="metric-change positive">-5% vs previous period</p>
          </div>
        </div>
      </div>
      
      <div class="report-section">
        <h2>Channel Performance</h2>
        <p>Performance breakdown by marketing channel:</p>
        
        <table class="performance-table">
          <thead>
            <tr>
              <th>Channel</th>
              <th>Impressions</th>
              <th>Clicks</th>
              <th>Conversions</th>
              <th>Cost</th>
              <th>ROAS</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Paid Search</td>
              <td>450,000</td>
              <td>22,500</td>
              <td>1,125</td>
              <td>$15,750</td>
              <td>3.2x</td>
            </tr>
            <tr>
              <td>Social Media</td>
              <td>350,000</td>
              <td>10,500</td>
              <td>525</td>
              <td>$8,400</td>
              <td>2.8x</td>
            </tr>
            <tr>
              <td>Email</td>
              <td>120,000</td>
              <td>9,600</td>
              <td>960</td>
              <td>$2,400</td>
              <td>8.5x</td>
            </tr>
            <tr>
              <td>Display</td>
              <td>280,000</td>
              <td>5,600</td>
              <td>280</td>
              <td>$4,200</td>
              <td>1.9x</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="report-section">
        <h2>Key Insights</h2>
        <ul>
          <li>Email marketing shows the highest ROAS at 8.5x, suggesting opportunities for increased investment.</li>
          <li>Social media engagement has increased by 24% compared to the previous period.</li>
          <li>Display advertising performance is below target and may need optimization.</li>
        </ul>
      </div>
    </div>
  `;
}

// Helper function to generate mock insights
function generateMockInsights(reportType?: string, channels?: string[], metrics?: string[]) {
  const insights = [];
  
  if (reportType === 'performance') {
    insights.push({
      title: 'Email Marketing Efficiency',
      explanation: 'Email marketing shows the highest return on ad spend (ROAS) at 8.5x, significantly outperforming other channels. This indicates strong audience engagement and effective messaging.',
      recommendation: 'Consider increasing budget allocation to email marketing campaigns and test expanded audience segments.'
    });
    
    insights.push({
      title: 'Display Advertising Underperformance',
      explanation: 'Display advertising shows the lowest ROAS at 1.9x, below the target of 2.5x. Creative fatigue and poor placement may be contributing factors.',
      recommendation: 'Refresh display ad creatives and review placement strategy to improve performance.'
    });
  } else if (reportType === 'attribution') {
    insights.push({
      title: 'Multi-touch Attribution Findings',
      explanation: 'Multi-touch attribution analysis shows that paid search plays a significant role in the early stages of the customer journey, while email is most effective for conversion.',
      recommendation: 'Align messaging across channels to create a cohesive customer journey from awareness to conversion.'
    });
  } else {
    insights.push({
      title: 'Marketing Performance Overview',
      explanation: 'Overall marketing performance shows a positive trend with a 15% increase in impressions. However, conversion rate has decreased slightly by 2%.',
      recommendation: 'Focus on conversion rate optimization across all channels, particularly for high-traffic sources.'
    });
  }
  
  return insights;
}
