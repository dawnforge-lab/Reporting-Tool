"use client";

import React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';

export default function DataSourcesPage() {
  const [activeTab, setActiveTab] = useState('connections');
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  
  useEffect(() => {
    // Fetch existing connections
    fetchConnections();
  }, []);
  
  const fetchConnections = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/data-connections');
      if (!response.ok) {
        throw new Error('Failed to fetch connections');
      }
      
      const data = await response.json();
      setConnections(data.connections || []);
    } catch (error) {
      console.error('Error fetching connections:', error);
      toast.error('Failed to load data connections');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateConnection = async (event) => {
    event.preventDefault();
    setIsCreating(true);
    
    try {
      const formData = new FormData(event.target);
      const connectionType = formData.get('connection-type');
      
      let connectionData = {
        name: formData.get('connection-name'),
        type: connectionType,
      };
      
      // Add type-specific fields
      switch (connectionType) {
        case 'bigquery':
          connectionData = {
            ...connectionData,
            projectId: formData.get('bigquery-project-id'),
            datasetId: formData.get('bigquery-dataset-id'),
            keyFile: formData.get('bigquery-key-file'),
          };
          break;
        case 'spreadsheet':
          connectionData = {
            ...connectionData,
            spreadsheetId: formData.get('spreadsheet-id'),
            sheetName: formData.get('sheet-name'),
          };
          break;
        case 'database':
          connectionData = {
            ...connectionData,
            host: formData.get('db-host'),
            port: formData.get('db-port'),
            database: formData.get('db-name'),
            username: formData.get('db-username'),
            password: formData.get('db-password'),
            dbType: formData.get('db-type'),
          };
          break;
        case 'file':
          connectionData = {
            ...connectionData,
            filePath: formData.get('file-path'),
            fileType: formData.get('file-type'),
          };
          break;
      }
      
      // Create the connection
      const response = await fetch('/api/data-connections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(connectionData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create connection');
      }
      
      // Reset the form
      event.target.reset();
      
      // Refresh the connections list
      fetchConnections();
      
      // Show success message
      toast.success('Data connection created successfully');
      
      // Switch to connections tab
      setActiveTab('connections');
    } catch (error) {
      console.error('Error creating connection:', error);
      toast.error(error.message || 'Failed to create data connection');
    } finally {
      setIsCreating(false);
    }
  };
  
  const handleTestConnection = async (connectionId) => {
    try {
      const response = await fetch(`/api/data-connections/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ connectionId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Connection test failed');
      }
      
      toast.success('Connection test successful');
    } catch (error) {
      console.error('Error testing connection:', error);
      toast.error(error.message || 'Connection test failed');
    }
  };
  
  const handleDeleteConnection = async (connectionId) => {
    if (!confirm('Are you sure you want to delete this connection?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/data-connections/${connectionId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete connection');
      }
      
      // Refresh the connections list
      fetchConnections();
      
      // Show success message
      toast.success('Data connection deleted successfully');
    } catch (error) {
      console.error('Error deleting connection:', error);
      toast.error(error.message || 'Failed to delete data connection');
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Data Sources</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-8">
          <TabsTrigger value="connections">My Connections</TabsTrigger>
          <TabsTrigger value="create">Create Connection</TabsTrigger>
        </TabsList>
        
        <TabsContent value="connections" className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <p>Loading connections...</p>
            </div>
          ) : connections.length === 0 ? (
            <div className="text-center py-12">
              <p className="mb-4">No data connections found.</p>
              <Button onClick={() => setActiveTab('create')}>Create Your First Connection</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {connections.map((connection) => (
                <Card key={connection.id}>
                  <CardHeader>
                    <CardTitle>{connection.name}</CardTitle>
                    <CardDescription>
                      {connection.type.charAt(0).toUpperCase() + connection.type.slice(1)} Connection
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Type:</span>
                        <span>{connection.type.charAt(0).toUpperCase() + connection.type.slice(1)}</span>
                      </div>
                      
                      {connection.type === 'bigquery' && (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Project:</span>
                            <span>{connection.projectId}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Dataset:</span>
                            <span>{connection.datasetId}</span>
                          </div>
                        </>
                      )}
                      
                      {connection.type === 'spreadsheet' && (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Spreadsheet ID:</span>
                            <span>{connection.spreadsheetId.substring(0, 10)}...</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Sheet:</span>
                            <span>{connection.sheetName}</span>
                          </div>
                        </>
                      )}
                      
                      {connection.type === 'database' && (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Database Type:</span>
                            <span>{connection.dbType}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Host:</span>
                            <span>{connection.host}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Database:</span>
                            <span>{connection.database}</span>
                          </div>
                        </>
                      )}
                      
                      {connection.type === 'file' && (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">File Type:</span>
                            <span>{connection.fileType.toUpperCase()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Path:</span>
                            <span>{connection.filePath}</span>
                          </div>
                        </>
                      )}
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Created:</span>
                        <span>{new Date(connection.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => handleTestConnection(connection.id)}>
                      Test
                    </Button>
                    <Button variant="destructive" onClick={() => handleDeleteConnection(connection.id)}>
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Data Connection</CardTitle>
              <CardDescription>
                Connect to various data sources for your reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form id="create-connection-form" onSubmit={handleCreateConnection} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="connection-name">Connection Name</Label>
                  <Input id="connection-name" name="connection-name" placeholder="Enter a name for this connection" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="connection-type">Connection Type</Label>
                  <Select defaultValue="bigquery" name="connection-type" onValueChange={(value) => {
                    // Reset form fields when connection type changes
                    const form = document.getElementById('create-connection-form');
                    if (form) {
                      form.reset();
                      const typeSelect = form.querySelector('[name="connection-type"]');
                      if (typeSelect) {
                        typeSelect.value = value;
                      }
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select connection type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bigquery">Google BigQuery</SelectItem>
                      <SelectItem value="spreadsheet">Google Spreadsheet</SelectItem>
                      <SelectItem value="database">Database</SelectItem>
                      <SelectItem value="file">CSV/Excel File</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* BigQuery Fields */}
                <div className="space-y-4 bigquery-fields">
                  <div className="space-y-2">
                    <Label htmlFor="bigquery-project-id">Project ID</Label>
                    <Input id="bigquery-project-id" name="bigquery-project-id" placeholder="Enter your Google Cloud project ID" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bigquery-dataset-id">Dataset ID</Label>
                    <Input id="bigquery-dataset-id" name="bigquery-dataset-id" placeholder="Enter your BigQuery dataset ID" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bigquery-key-file">Service Account Key File</Label>
                    <Input id="bigquery-key-file" name="bigquery-key-file" placeholder="Path to your service account key file" />
                  </div>
                </div>
                
                {/* Google Spreadsheet Fields */}
                <div className="space-y-4 spreadsheet-fields hidden">
                  <div className="space-y-2">
                    <Label htmlFor="spreadsheet-id">Spreadsheet ID</Label>
                    <Input id="spreadsheet-id" name="spreadsheet-id" placeholder="Enter your Google Spreadsheet ID" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sheet-name">Sheet Name</Label>
                    <Input id="sheet-name" name="sheet-name" placeholder="Enter the sheet name" />
                  </div>
                </div>
                
                {/* Database Fields */}
                <div className="space-y-4 database-fields hidden">
                  <div className="space-y-2">
                    <Label htmlFor="db-type">Database Type</Label>
                    <Select defaultValue="mysql" name="db-type">
                      <SelectTrigger>
                        <SelectValue placeholder="Select database type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mysql">MySQL</SelectItem>
                        <SelectItem value="postgresql">PostgreSQL</SelectItem>
                        <SelectItem value="sqlserver">SQL Server</SelectItem>
                        <SelectItem value="sqlite">SQLite</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="db-host">Host</Label>
                    <Input id="db-host" name="db-host" placeholder="Enter database host" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="db-port">Port</Label>
                    <Input id="db-port" name="db-port" placeholder="Enter database port" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="db-name">Database Name</Label>
                    <Input id="db-name" name="db-name" placeholder="Enter database name" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="db-username">Username</Label>
                    <Input id="db-username" name="db-username" placeholder="Enter database username" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="db-password">Password</Label>
                    <Input id="db-password" name="db-password" type="password" placeholder="Enter database password" />
                  </div>
                </div>
                
                {/* File Fields */}
                <div className="space-y-4 file-fields hidden">
                  <div className="space-y-2">
                    <Label htmlFor="file-path">File Path</Label>
                    <Input id="file-path" name="file-path" placeholder="Enter path to your file" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="file-type">File Type</Label>
                    <Select defaultValue="csv" name="file-type">
                      <SelectTrigger>
                        <SelectValue placeholder="Select file type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button type="submit" form="create-connection-form" className="w-full" disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Connection'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
