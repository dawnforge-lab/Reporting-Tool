"use client";

import React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from 'sonner';

export default function MeridianModelingPage() {
  const [dataSources, setDataSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDataSource, setSelectedDataSource] = useState(null);
  const [modelConfig, setModelConfig] = useState({
    dateColumn: 'date',
    targetColumn: 'revenue',
    channelColumns: [],
    adstockMaxLag: 4,
    hillExponentBound: 3.0,
    optimizeBudget: true,
    totalBudget: 100000
  });
  const [availableColumns, setAvailableColumns] = useState([]);
  const [isModelBuilding, setIsModelBuilding] = useState(false);
  const [modelResults, setModelResults] = useState(null);
  
  useEffect(() => {
    // Fetch data sources
    fetchDataSources();
  }, []);
  
  const fetchDataSources = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/data-connections');
      if (!response.ok) {
        throw new Error('Failed to fetch data sources');
      }
      
      const data = await response.json();
      setDataSources(data.connections || []);
    } catch (error) {
      console.error('Error fetching data sources:', error);
      toast.error('Failed to load data sources');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDataSourceChange = async (sourceId) => {
    try {
      setSelectedDataSource(sourceId);
      
      // In a real implementation, this would fetch the columns from the selected data source
      // For now, we'll use mock data
      setAvailableColumns([
        'date',
        'revenue',
        'Paid Search_spend',
        'Social Media_spend',
        'Email_spend',
        'Display_spend',
        'Paid Search_impressions',
        'Social Media_impressions',
        'Email_impressions',
        'Display_impressions',
        'Paid Search_clicks',
        'Social Media_clicks',
        'Email_clicks',
        'Display_clicks',
        'Paid Search_conversions',
        'Social Media_conversions',
        'Email_conversions',
        'Display_conversions'
      ]);
      
      // Set default channel columns
      setModelConfig({
        ...modelConfig,
        channelColumns: [
          'Paid Search_spend',
          'Social Media_spend',
          'Email_spend',
          'Display_spend'
        ]
      });
    } catch (error) {
      console.error('Error fetching data source columns:', error);
      toast.error('Failed to load data source columns');
    }
  };
  
  const handleBuildModel = async () => {
    try {
      setIsModelBuilding(true);
      
      // Validate configuration
      if (!selectedDataSource) {
        toast.error('Please select a data source');
        return;
      }
      
      if (!modelConfig.targetColumn) {
        toast.error('Please select a target column');
        return;
      }
      
      if (modelConfig.channelColumns.length === 0) {
        toast.error('Please select at least one channel column');
        return;
      }
      
      // Build the model
      const response = await fetch('/api/meridian/model', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dataSourceId: selectedDataSource,
          dataConfig: {
            type: dataSources.find(ds => ds.id === selectedDataSource)?.type || 'bigquery'
          },
          modelConfig: modelConfig
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to build model');
      }
      
      const data = await response.json();
      setModelResults(data.model);
      toast.success('Marketing mix model built successfully');
    } catch (error) {
      console.error('Error building model:', error);
      toast.error(error.message || 'Failed to build marketing mix model');
    } finally {
      setIsModelBuilding(false);
    }
  };
  
  const handleChannelColumnToggle = (column) => {
    const currentChannels = [...modelConfig.channelColumns];
    const index = currentChannels.indexOf(column);
    
    if (index === -1) {
      // Add the column
      setModelConfig({
        ...modelConfig,
        channelColumns: [...currentChannels, column]
      });
    } else {
      // Remove the column
      currentChannels.splice(index, 1);
      setModelConfig({
        ...modelConfig,
        channelColumns: currentChannels
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Marketing Mix Modeling</h1>
      
      <Tabs defaultValue="build" className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="build">Build Model</TabsTrigger>
          <TabsTrigger value="results" disabled={!modelResults}>Results</TabsTrigger>
          <TabsTrigger value="optimization" disabled={!modelResults}>Budget Optimization</TabsTrigger>
        </TabsList>
        
        <TabsContent value="build" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Model Configuration</CardTitle>
              <CardDescription>
                Configure your marketing mix model using Meridian
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="data-source">Data Source</Label>
                <Select onValueChange={handleDataSourceChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a data source" />
                  </SelectTrigger>
                  <SelectContent>
                    {dataSources.map((source) => (
                      <SelectItem key={source.id} value={source.id}>
                        {source.name} ({source.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedDataSource && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="date-column">Date Column</Label>
                    <Select 
                      defaultValue={modelConfig.dateColumn}
                      onValueChange={(value) => setModelConfig({...modelConfig, dateColumn: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select date column" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableColumns
                          .filter(col => col.toLowerCase().includes('date'))
                          .map((column) => (
                            <SelectItem key={column} value={column}>
                              {column}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="target-column">Target KPI Column</Label>
                    <Select 
                      defaultValue={modelConfig.targetColumn}
                      onValueChange={(value) => setModelConfig({...modelConfig, targetColumn: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select target column" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableColumns
                          .filter(col => !col.toLowerCase().includes('date'))
                          .map((column) => (
                            <SelectItem key={column} value={column}>
                              {column}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Marketing Channel Columns</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {availableColumns
                        .filter(col => col.includes('_spend') || col.includes('_cost'))
                        .map((column) => (
                          <div key={column} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`channel-${column}`}
                              checked={modelConfig.channelColumns.includes(column)}
                              onCheckedChange={() => handleChannelColumnToggle(column)}
                            />
                            <label htmlFor={`channel-${column}`}>{column}</label>
                          </div>
                        ))}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="adstock-max-lag">Adstock Max Lag</Label>
                        <span className="text-sm text-muted-foreground">{modelConfig.adstockMaxLag}</span>
                      </div>
                      <Slider
                        id="adstock-max-lag"
                        min={1}
                        max={8}
                        step={1}
                        defaultValue={[modelConfig.adstockMaxLag]}
                        onValueChange={(value) => setModelConfig({...modelConfig, adstockMaxLag: value[0]})}
                      />
                      <p className="text-xs text-muted-foreground">Controls how long marketing effects last (in time periods)</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="hill-exponent-bound">Hill Exponent Bound</Label>
                        <span className="text-sm text-muted-foreground">{modelConfig.hillExponentBound.toFixed(1)}</span>
                      </div>
                      <Slider
                        id="hill-exponent-bound"
                        min={1.0}
                        max={5.0}
                        step={0.1}
                        defaultValue={[modelConfig.hillExponentBound]}
                        onValueChange={(value) => setModelConfig({...modelConfig, hillExponentBound: value[0]})}
                      />
                      <p className="text-xs text-muted-foreground">Controls the diminishing returns effect of marketing spend</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="optimize-budget"
                        checked={modelConfig.optimizeBudget}
                        onCheckedChange={(checked) => setModelConfig({...modelConfig, optimizeBudget: checked})}
                      />
                      <label htmlFor="optimize-budget">Generate Budget Optimization</label>
                    </div>
                  </div>
                  
                  {modelConfig.optimizeBudget && (
                    <div className="space-y-2">
                      <Label htmlFor="total-budget">Total Budget</Label>
                      <Input
                        id="total-budget"
                        type="number"
                        value={modelConfig.totalBudget}
                        onChange={(e) => setModelConfig({...modelConfig, totalBudget: parseFloat(e.target.value)})}
                      />
                    </div>
                  )}
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleBuildModel} 
                disabled={!selectedDataSource || isModelBuilding}
                className="w-full"
              >
                {isModelBuilding ? 'Building Model...' : 'Build Marketing Mix Model'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="results" className="space-y-6">
          {modelResults && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Model Performance</CardTitle>
                  <CardDescription>
                    Overall performance metrics for the marketing mix model
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-muted p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold">{(modelResults.reportData.model_summary.r_squared * 100).toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">R-Squared</div>
                    </div>
                    <div className="bg-muted p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold">{(modelResults.reportData.model_summary.mape * 100).toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">MAPE</div>
                    </div>
                    <div className="bg-muted p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold">{modelResults.reportData.model_summary.period.start}</div>
                      <div className="text-sm text-muted-foreground">Start Date</div>
                    </div>
                    <div className="bg-muted p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold">{modelResults.reportData.model_summary.period.end}</div>
                      <div className="text-sm text-muted-foreground">End Date</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Channel Performance</CardTitle>
                  <CardDescription>
                    ROI and contribution metrics for each marketing channel
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Channel</th>
                          <th className="text-right py-3 px-4">ROI</th>
                          <th className="text-right py-3 px-4">ROI Range</th>
                          <th className="text-right py-3 px-4">Contribution</th>
                          <th className="text-right py-3 px-4">Contribution %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(modelResults.reportData.channel_performance).map(([channel, data]) => (
                          <tr key={channel} className="border-b">
                            <td className="py-3 px-4">{channel}</td>
                            <td className="text-right py-3 px-4">{data.roi.toFixed(2)}x</td>
                            <td className="text-right py-3 px-4">{data.roi_lower.toFixed(2)} - {data.roi_upper.toFixed(2)}</td>
                            <td className="text-right py-3 px-4">${data.total_contribution.toLocaleString()}</td>
                            <td className="text-right py-3 px-4">{(data.contribution_percentage * 100).toFixed(1)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Time Series Analysis</CardTitle>
                  <CardDescription>
                    Visualization of actual vs. predicted values and channel contributions over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Time series chart visualization would appear here</p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="optimization" className="space-y-6">
          {modelResults && modelResults.budgetAllocation && (
            <Card>
              <CardHeader>
                <CardTitle>Optimal Budget Allocation</CardTitle>
                <CardDescription>
                  Recommended budget allocation across marketing channels to maximize ROI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Current vs. Optimal Allocation</h3>
                      <div className="h-60 bg-muted rounded-lg flex items-center justify-center">
                        <p className="text-muted-foreground">Budget allocation chart would appear here</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-4">Expected Performance Improvement</h3>
                      <div className="h-60 bg-muted rounded-lg flex items-center justify-center">
                        <p className="text-muted-foreground">Performance improvement chart would appear here</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Recommended Budget Allocation</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4">Channel</th>
                            <th className="text-right py-3 px-4">Current Budget</th>
                            <th className="text-right py-3 px-4">Optimal Budget</th>
                            <th className="text-right py-3 px-4">Change</th>
                            <th className="text-right py-3 px-4">Change %</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(modelResults.budgetAllocation).map(([channel, amount]) => {
                            const currentAmount = modelConfig.channelColumns.includes(channel) ? 
                              modelConfig.totalBudget / modelConfig.channelColumns.length : 0;
                            const change = amount - currentAmount;
                            const changePercent = currentAmount > 0 ? (change / currentAmount) * 100 : 100;
                            
                            return (
                              <tr key={channel} className="border-b">
                                <td className="py-3 px-4">{channel}</td>
                                <td className="text-right py-3 px-4">${currentAmount.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                                <td className="text-right py-3 px-4">${amount.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                                <td className="text-right py-3 px-4 font-medium" style={{color: change >= 0 ? 'green' : 'red'}}>
                                  {change >= 0 ? '+' : ''}{change.toLocaleString(undefined, {maximumFractionDigits: 0})}
                                </td>
                                <td className="text-right py-3 px-4 font-medium" style={{color: changePercent >= 0 ? 'green' : 'red'}}>
                                  {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(1)}%
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Export Optimization Report</Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
