"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function ReportTemplatesPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  
  // Function to handle report generation
  const handleGenerateReport = async (template) => {
    setIsGenerating(true);
    setSelectedTemplate(template);
    
    try {
      const response = await fetch('/api/reports/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: template.title,
          description: template.description,
          type: template.type,
          channels: ['Paid Search', 'Social Media', 'Email', 'Display'],
          metrics: template.metrics,
          period: 'last_30_days'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate report');
      }
      
      const data = await response.json();
      
      // Store the report data in localStorage for the report viewer
      localStorage.setItem('currentReport', JSON.stringify(data.report));
      
      // Navigate to the report viewer
      router.push('/reports/view');
      toast.success('Report generated successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Function to handle custom report generation
  const handleGenerateCustomReport = async (event) => {
    event.preventDefault();
    setIsGenerating(true);
    
    const formData = new FormData(event.target);
    const title = formData.get('report-title');
    const description = formData.get('report-description');
    const type = formData.get('report-type');
    
    // Get selected channels
    const channels = [];
    if (formData.get('channel-search')) channels.push('Paid Search');
    if (formData.get('channel-social')) channels.push('Social Media');
    if (formData.get('channel-email')) channels.push('Email');
    if (formData.get('channel-display')) channels.push('Display');
    if (formData.get('channel-video')) channels.push('Video');
    if (formData.get('channel-organic')) channels.push('Organic Search');
    
    // Get selected metrics
    const metrics = [];
    if (formData.get('metric-impressions')) metrics.push('Impressions');
    if (formData.get('metric-clicks')) metrics.push('Clicks');
    if (formData.get('metric-conversions')) metrics.push('Conversions');
    if (formData.get('metric-cost')) metrics.push('Cost');
    if (formData.get('metric-revenue')) metrics.push('Revenue');
    if (formData.get('metric-roas')) metrics.push('ROAS');
    
    try {
      const response = await fetch('/api/reports/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          type,
          channels,
          metrics,
          period: 'last_30_days'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate custom report');
      }
      
      const data = await response.json();
      
      // Store the report data in localStorage for the report viewer
      localStorage.setItem('currentReport', JSON.stringify(data.report));
      
      // Navigate to the report viewer
      router.push('/reports/view');
      toast.success('Custom report generated successfully!');
    } catch (error) {
      console.error('Error generating custom report:', error);
      toast.error('Failed to generate custom report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Report Templates</h1>
      
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="performance">Performance Reports</TabsTrigger>
          <TabsTrigger value="attribution">Attribution Reports</TabsTrigger>
          <TabsTrigger value="forecast">Forecasting Reports</TabsTrigger>
          <TabsTrigger value="custom">Custom Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TemplateCard 
              title="Channel Performance"
              description="Compare performance metrics across all marketing channels"
              type="performance"
              metrics={["Impressions", "Clicks", "Conversions", "Cost", "Revenue", "ROAS"]}
              onGenerate={handleGenerateReport}
              isGenerating={isGenerating && selectedTemplate?.title === "Channel Performance"}
            />
            
            <TemplateCard 
              title="Campaign ROI Analysis"
              description="Analyze return on investment for all active campaigns"
              type="performance"
              metrics={["Cost", "Revenue", "ROAS", "CPA", "Conversion Rate"]}
              onGenerate={handleGenerateReport}
              isGenerating={isGenerating && selectedTemplate?.title === "Campaign ROI Analysis"}
            />
            
            <TemplateCard 
              title="Weekly Performance Snapshot"
              description="Week-over-week performance changes with key insights"
              type="performance"
              metrics={["Impressions", "Clicks", "Conversions", "Cost", "Revenue"]}
              onGenerate={handleGenerateReport}
              isGenerating={isGenerating && selectedTemplate?.title === "Weekly Performance Snapshot"}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="attribution" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TemplateCard 
              title="Multi-touch Attribution"
              description="Analyze customer journey across multiple touchpoints"
              type="attribution"
              metrics={["Touchpoints", "Conversion Path", "Channel Impact", "Assisted Conversions"]}
              onGenerate={handleGenerateReport}
              isGenerating={isGenerating && selectedTemplate?.title === "Multi-touch Attribution"}
            />
            
            <TemplateCard 
              title="First-click vs. Last-click"
              description="Compare attribution models to understand channel value"
              type="attribution"
              metrics={["First Click Value", "Last Click Value", "Linear Model", "Time Decay"]}
              onGenerate={handleGenerateReport}
              isGenerating={isGenerating && selectedTemplate?.title === "First-click vs. Last-click"}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="forecast" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TemplateCard 
              title="Q2 Performance Forecast"
              description="Projected performance for the upcoming quarter"
              type="forecast"
              metrics={["Projected Revenue", "Projected Cost", "Projected ROAS", "Growth Rate"]}
              onGenerate={handleGenerateReport}
              isGenerating={isGenerating && selectedTemplate?.title === "Q2 Performance Forecast"}
            />
            
            <TemplateCard 
              title="Annual Budget Planning"
              description="Optimize budget allocation for maximum ROI"
              type="forecast"
              metrics={["Budget Allocation", "Projected Revenue", "Projected ROAS", "Channel Mix"]}
              onGenerate={handleGenerateReport}
              isGenerating={isGenerating && selectedTemplate?.title === "Annual Budget Planning"}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="custom" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Custom Report</CardTitle>
              <CardDescription>
                Design a custom report with the metrics and channels you need
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form id="custom-report-form" onSubmit={handleGenerateCustomReport} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="report-title">Report Title</Label>
                  <Input id="report-title" name="report-title" placeholder="Enter report title" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="report-description">Description</Label>
                  <Textarea id="report-description" name="report-description" placeholder="Enter report description" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="report-type">Report Type</Label>
                  <Select defaultValue="performance" name="report-type">
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="attribution">Attribution</SelectItem>
                      <SelectItem value="forecast">Forecast</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Marketing Channels</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="channel-search" name="channel-search" defaultChecked />
                      <label htmlFor="channel-search">Paid Search</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="channel-social" name="channel-social" defaultChecked />
                      <label htmlFor="channel-social">Social Media</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="channel-email" name="channel-email" defaultChecked />
                      <label htmlFor="channel-email">Email</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="channel-display" name="channel-display" defaultChecked />
                      <label htmlFor="channel-display">Display</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="channel-video" name="channel-video" />
                      <label htmlFor="channel-video">Video</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="channel-organic" name="channel-organic" />
                      <label htmlFor="channel-organic">Organic Search</label>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Metrics</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="metric-impressions" name="metric-impressions" defaultChecked />
                      <label htmlFor="metric-impressions">Impressions</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="metric-clicks" name="metric-clicks" defaultChecked />
                      <label htmlFor="metric-clicks">Clicks</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="metric-conversions" name="metric-conversions" defaultChecked />
                      <label htmlFor="metric-conversions">Conversions</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="metric-cost" name="metric-cost" defaultChecked />
                      <label htmlFor="metric-cost">Cost</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="metric-revenue" name="metric-revenue" defaultChecked />
                      <label htmlFor="metric-revenue">Revenue</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="metric-roas" name="metric-roas" defaultChecked />
                      <label htmlFor="metric-roas">ROAS</label>
                    </div>
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button type="submit" form="custom-report-form" className="w-full" disabled={isGenerating}>
                {isGenerating ? 'Generating...' : 'Generate Custom Report'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TemplateCard({ title, description, type, metrics, onGenerate, isGenerating }) {
  const handleClick = () => {
    onGenerate({ title, description, type, metrics });
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/50">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Included Metrics:</h4>
          <ul className="text-sm text-muted-foreground list-disc pl-5">
            {metrics.map((metric, index) => (
              <li key={index}>{metric}</li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Preview</Button>
        <Button onClick={handleClick} disabled={isGenerating}>
          {isGenerating ? 'Generating...' : 'Generate Report'}
        </Button>
      </CardFooter>
    </Card>
  );
}
