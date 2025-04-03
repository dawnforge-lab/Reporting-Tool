# Debugging and Development Guide for Digital Marketing Reporting Tool

This document provides detailed information about debugging, troubleshooting, and continuing development of the Digital Marketing Reporting Tool.

## Table of Contents

- [Development Environment Setup](#development-environment-setup)
- [Code Structure and Architecture](#code-structure-and-architecture)
- [Debugging Techniques](#debugging-techniques)
- [Common Issues and Solutions](#common-issues-and-solutions)
- [Testing](#testing)
- [Adding New Features](#adding-new-features)
- [Performance Optimization](#performance-optimization)
- [Best Practices](#best-practices)

## Development Environment Setup

### Prerequisites

- Node.js 18.x or later
- npm 9.x or later (or pnpm/yarn)
- Git
- Visual Studio Code (recommended) or another code editor

### Setup Steps

1. **Clone the repository**

```bash
git clone https://github.com/dawnforge-lab/Reporting-Tool.git
cd Reporting-Tool
```

2. **Install dependencies**

```bash
npm install
# or
pnpm install
# or
yarn install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory with the required variables:

```
# API Keys
OPENAI_API_KEY=your_openai_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key

# Database Configuration
DATABASE_URL=your_database_connection_string

# Authentication (if implemented)
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

4. **Initialize the database**

```bash
# Install Wrangler CLI globally
npm install -g wrangler

# Initialize the database
wrangler d1 execute DB --local --file=migrations/0001_initial.sql
```

5. **Start the development server**

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Recommended VS Code Extensions

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Hero
- Next.js snippets

## Code Structure and Architecture

### Project Structure

```
reporting-tool-nextjs/
├── migrations/            # Database migration files
├── public/                # Static assets
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── api/           # API routes
│   │   ├── data-sources/  # Data sources page
│   │   ├── insights/      # Insights page
│   │   ├── meridian/      # Meridian modeling page
│   │   ├── reports/       # Reports pages
│   │   ├── layout.tsx     # Root layout
│   │   └── page.tsx       # Home page
│   ├── components/        # Reusable UI components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions
│   │   ├── connectors/    # Data source connectors
│   │   ├── deepseek.ts    # DeepSeek V3 integration
│   │   ├── meridian.ts    # Meridian integration
│   │   ├── db.ts          # Database utilities
│   │   └── python-utils.ts # Python integration utilities
│   └── types/             # TypeScript type definitions
├── .env.example           # Example environment variables
├── .gitignore             # Git ignore file
├── next.config.js         # Next.js configuration
├── package.json           # Project dependencies
├── README.md              # Project documentation
├── tailwind.config.js     # Tailwind CSS configuration
└── tsconfig.json          # TypeScript configuration
```

### Architecture Overview

The application follows a modern Next.js architecture with the App Router:

1. **Frontend**:
   - React components in the `src/app` directory
   - Tailwind CSS for styling
   - Client components (with "use client" directive) for interactive UI
   - Server components for data fetching and rendering

2. **Backend**:
   - Next.js API routes in the `src/app/api` directory
   - Cloudflare D1 database (or alternative)
   - External API integrations (DeepSeek, Meridian)

3. **Data Flow**:
   - User interacts with UI components
   - Client components make API requests to Next.js API routes
   - API routes interact with the database and external APIs
   - Results are returned to the client for rendering

## Debugging Techniques

### Server-Side Debugging

1. **Console Logging**

```typescript
// Add console.log statements to debug server-side code
export async function GET(request: NextRequest) {
  console.log('Request received:', request.url);
  
  try {
    const data = await fetchData();
    console.log('Data fetched:', data);
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error occurred:', error);
    return NextResponse.json({ success: false, error: 'An error occurred' }, { status: 500 });
  }
}
```

2. **Environment Variable Debugging**

```typescript
// Check environment variables
console.log('Environment variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('OPENAI_API_KEY set:', !!process.env.OPENAI_API_KEY);
```

3. **Request and Response Inspection**

```typescript
// Create a middleware to log all API requests and responses
export function middleware(request: NextRequest) {
  console.log('API Request:', request.method, request.url);
  
  const response = NextResponse.next();
  
  response.headers.append('X-Debug-Info', 'Debugging enabled');
  
  return response;
}

export const config = {
  matcher: '/api/:path*',
};
```

### Client-Side Debugging

1. **React DevTools**

Install the [React DevTools browser extension](https://react.dev/learn/react-developer-tools) to inspect component props, state, and the component tree.

2. **Console Logging in Components**

```typescript
"use client";

import { useEffect, useState } from 'react';

export default function DebugComponent() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    console.log('Component mounted');
    
    async function fetchData() {
      try {
        const response = await fetch('/api/data');
        const result = await response.json();
        console.log('Data fetched:', result);
        setData(result);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    
    fetchData();
    
    return () => {
      console.log('Component unmounted');
    };
  }, []);
  
  console.log('Rendering with data:', data);
  
  return <div>{/* Component JSX */}</div>;
}
```

3. **Network Tab in DevTools**

Use the Network tab in browser DevTools to inspect API requests, responses, and timing.

### Database Debugging

1. **Inspecting Database State**

```bash
# List all tables
wrangler d1 execute DB --local --command="SELECT name FROM sqlite_master WHERE type='table';"

# Query a specific table
wrangler d1 execute DB --local --command="SELECT * FROM data_connections LIMIT 10;"
```

2. **Resetting the Database**

```bash
# Remove the local database state
rm -rf .wrangler/state/v3

# Reinitialize the database
wrangler d1 execute DB --local --file=migrations/0001_initial.sql
```

### External API Debugging

1. **Logging API Requests and Responses**

```typescript
// src/lib/deepseek.ts

async function callDeepSeekAPI(prompt: string) {
  console.log('Calling DeepSeek API with prompt:', prompt);
  
  try {
    const response = await openai.chat.completions.create({
      model: "deepseek-v3-chat",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });
    
    console.log('DeepSeek API response:', response);
    
    return response;
  } catch (error) {
    console.error('DeepSeek API error:', error);
    throw error;
  }
}
```

2. **Mock API Responses for Testing**

```typescript
// src/lib/__mocks__/deepseek.ts

export const generateReportWithDeepSeek = jest.fn().mockResolvedValue({
  htmlContent: "<h1>Mock Report</h1>",
  reasoning: "Mock reasoning process",
  insights: [{ title: "Mock Insight", explanation: "Mock explanation", recommendation: "Mock recommendation" }]
});

export const generateInsightsWithDeepSeek = jest.fn().mockResolvedValue([
  { title: "Mock Insight", explanation: "Mock explanation", recommendation: "Mock recommendation" }
]);
```

## Common Issues and Solutions

### Next.js Build Errors

#### Issue: "You're importing a component that needs useState/useEffect"

**Solution**: Add the "use client" directive at the top of the file.

```typescript
"use client";

import { useState, useEffect } from 'react';
// Rest of the component
```

#### Issue: "Module not found"

**Solution**: Check import paths and make sure the module exists.

```typescript
// Incorrect
import { Button } from '@/components/Button';

// Correct
import { Button } from '@/components/ui/button';
```

### API Connection Issues

#### Issue: "Failed to fetch" errors in the browser

**Solution**: Check CORS configuration and network connectivity.

```typescript
// src/app/api/[...]/route.ts

export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
```

#### Issue: External API authentication failures

**Solution**: Verify API keys and credentials.

```typescript
// Check if API keys are set
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables');
}
```

### Database Issues

#### Issue: "Database not found" or connection errors

**Solution**: Check database configuration and connection string.

```typescript
// src/lib/db.ts

// Add error handling and logging
try {
  // Database connection code
} catch (error) {
  console.error('Database connection error:', error);
  console.log('Database URL:', process.env.DATABASE_URL);
  throw error;
}
```

#### Issue: Migration errors

**Solution**: Reset the database and reapply migrations.

```bash
rm -rf .wrangler/state/v3
wrangler d1 execute DB --local --file=migrations/0001_initial.sql
```

### UI and Rendering Issues

#### Issue: Hydration errors

**Solution**: Ensure server and client rendering match.

```typescript
"use client";

import { useState, useEffect } from 'react';

export default function Component() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Only render the component on the client
  if (!mounted) {
    return null;
  }
  
  return <div>{/* Component JSX */}</div>;
}
```

#### Issue: Tailwind CSS styles not applying

**Solution**: Check class names and Tailwind configuration.

```typescript
// Make sure tailwind.config.js includes all content files
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  // Rest of the config
};
```

## Testing

### Unit Testing

1. **Setting up Jest**

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

Configure Jest in `jest.config.js`:

```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
};

module.exports = createJestConfig(customJestConfig);
```

Create `jest.setup.js`:

```javascript
import '@testing-library/jest-dom';
```

2. **Testing React Components**

```typescript
// src/components/__tests__/Button.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../ui/button';

describe('Button component', () => {
  it('renders correctly', () => {
    render(<Button>Test Button</Button>);
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });
  
  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

3. **Testing Utility Functions**

```typescript
// src/lib/__tests__/deepseek.test.ts

import { generateMockReportHtml, formatMetricValue } from '../deepseek';

describe('DeepSeek utility functions', () => {
  describe('formatMetricValue', () => {
    it('formats cost values correctly', () => {
      expect(formatMetricValue('cost', 1000)).toBe('$1.0K');
      expect(formatMetricValue('cost', 1500000)).toBe('$1.5M');
    });
    
    it('formats percentage values correctly', () => {
      expect(formatMetricValue('ctr', 5.25)).toBe('5.25%');
      expect(formatMetricValue('conversion rate', 2.5)).toBe('2.50%');
    });
  });
  
  describe('generateMockReportHtml', () => {
    it('includes the report title in the HTML', () => {
      const html = generateMockReportHtml(
        'Test Report',
        'Test Description',
        'performance',
        ['Paid Search'],
        ['Impressions', 'Clicks'],
        {}
      );
      
      expect(html).toContain('<h1>Test Report</h1>');
      expect(html).toContain('Test Description');
    });
  });
});
```

### Integration Testing

1. **Testing API Routes**

```typescript
// src/app/api/__tests__/data-connections.test.ts

import { createMocks } from 'node-mocks-http';
import { GET, POST } from '../data-connections/route';

jest.mock('../../lib/db', () => ({
  query: jest.fn().mockResolvedValue({ rows: [] }),
}));

describe('Data Connections API', () => {
  it('GET returns a list of connections', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });
    
    await GET(req);
    
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      connections: [],
    });
  });
  
  it('POST creates a new connection', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        name: 'Test Connection',
        type: 'bigquery',
        projectId: 'test-project',
        datasetId: 'test-dataset',
      },
    });
    
    await POST(req);
    
    expect(res._getStatusCode()).toBe(201);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      connection: expect.objectContaining({
        name: 'Test Connection',
        type: 'bigquery',
      }),
    });
  });
});
```

2. **Testing Data Flow**

```typescript
// src/app/__tests__/data-sources-page.test.tsx

import { render, screen, waitFor } from '@testing-library/react';
import DataSourcesPage from '../data-sources/page';

// Mock fetch
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: jest.fn().mockResolvedValue({
    success: true,
    connections: [
      {
        id: 'conn_123',
        name: 'Test Connection',
        type: 'bigquery',
        projectId: 'test-project',
        datasetId: 'test-dataset',
        createdAt: '2025-04-01T12:00:00Z',
      },
    ],
  }),
});

describe('DataSourcesPage', () => {
  it('fetches and displays connections', async () => {
    render(<DataSourcesPage />);
    
    // Check loading state
    expect(screen.getByText('Loading connections...')).toBeInTheDocument();
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Test Connection')).toBeInTheDocument();
    });
    
    // Check connection details
    expect(screen.getByText('BigQuery Connection')).toBeInTheDocument();
    expect(screen.getByText('test-project')).toBeInTheDocument();
  });
});
```

### End-to-End Testing

1. **Setting up Cypress**

```bash
npm install --save-dev cypress
```

Configure Cypress in `cypress.config.js`:

```javascript
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
```

2. **Writing E2E Tests**

```javascript
// cypress/e2e/data-sources.cy.js

describe('Data Sources Page', () => {
  beforeEach(() => {
    // Mock API responses
    cy.intercept('GET', '/api/data-connections', {
      statusCode: 200,
      body: {
        success: true,
        connections: [
          {
            id: 'conn_123',
            name: 'Test Connection',
            type: 'bigquery',
            projectId: 'test-project',
            datasetId: 'test-dataset',
            createdAt: '2025-04-01T12:00:00Z',
          },
        ],
      },
    }).as('getConnections');
    
    // Visit the page
    cy.visit('/data-sources');
  });
  
  it('displays the data sources page', () => {
    cy.contains('h1', 'Data Sources').should('be.visible');
  });
  
  it('displays connections after loading', () => {
    cy.wait('@getConnections');
    cy.contains('Test Connection').should('be.visible');
    cy.contains('BigQuery Connection').should('be.visible');
  });
  
  it('navigates to create connection tab', () => {
    cy.contains('Create Connection').click();
    cy.contains('Create New Data Connection').should('be.visible');
    cy.get('#connection-name').should('be.visible');
  });
});
```

## Adding New Features

### Adding a New Data Source Connector

1. **Create a new connector file**

```typescript
// src/lib/connectors/new-source-connector.ts

import { DataSourceConnector } from '../types';

export class NewSourceConnector implements DataSourceConnector {
  constructor(private config: any) {}
  
  async connect() {
    // Connection logic
    return { success: true };
  }
  
  async fetchData(query: string) {
    // Data fetching logic
    return { data: [] };
  }
  
  async disconnect() {
    // Disconnection logic
    return { success: true };
  }
}
```

2. **Register the connector in the factory**

```typescript
// src/lib/connectors/index.ts

import { BigQueryConnector } from './bigquery-connector';
import { SpreadsheetConnector } from './spreadsheet-connector';
import { DatabaseConnector } from './database-connector';
import { FileConnector } from './file-connector';
import { NewSourceConnector } from './new-source-connector';

export function createConnector(type: string, config: any) {
  switch (type) {
    case 'bigquery':
      return new BigQueryConnector(config);
    case 'spreadsheet':
      return new SpreadsheetConnector(config);
    case 'database':
      return new DatabaseConnector(config);
    case 'file':
      return new FileConnector(config);
    case 'new-source':
      return new NewSourceConnector(config);
    default:
      throw new Error(`Unsupported connector type: ${type}`);
  }
}
```

3. **Update the UI to include the new connector**

```typescript
// src/app/data-sources/page.tsx

// Add the new connector type to the select options
<SelectContent>
  <SelectItem value="bigquery">Google BigQuery</SelectItem>
  <SelectItem value="spreadsheet">Google Spreadsheet</SelectItem>
  <SelectItem value="database">Database</SelectItem>
  <SelectItem value="file">CSV/Excel File</SelectItem>
  <SelectItem value="new-source">New Source</SelectItem>
</SelectContent>

// Add form fields for the new connector
{connectionType === 'new-source' && (
  <div className="space-y-4 new-source-fields">
    <div className="space-y-2">
      <Label htmlFor="new-source-param1">Parameter 1</Label>
      <Input id="new-source-param1" name="new-source-param1" placeholder="Enter parameter 1" />
    </div>
    <div className="space-y-2">
      <Label htmlFor="new-source-param2">Parameter 2</Label>
      <Input id="new-source-param2" name="new-source-param2" placeholder="Enter parameter 2" />
    </div>
  </div>
)}
```

### Adding a New Report Template

1. **Create a new template definition**

```typescript
// src/lib/report-templates.ts

export const reportTemplates = {
  // Existing templates
  performance: {
    title: "Performance Report",
    description: "Analyze marketing performance across channels",
    metrics: ["Impressions", "Clicks", "Conversions", "Cost", "Revenue", "ROAS"],
  },
  
  // New template
  competitive: {
    title: "Competitive Analysis",
    description: "Compare your performance against competitors",
    metrics: ["Market Share", "Share of Voice", "Relative CTR", "Relative CPA", "Growth Rate"],
  },
};
```

2. **Update the report generation logic**

```typescript
// src/app/api/reports/templates/route.ts

// Add handling for the new template type
if (type === 'competitive') {
  // Competitive analysis specific logic
  const competitorData = await fetchCompetitorData(channels);
  
  // Generate competitive report
  const report = await generateCompetitiveReport(title, description, data, competitorData);
  
  return NextResponse.json({
    success: true,
    report,
  });
}
```

3. **Add the template to the UI**

```typescript
// src/app/reports/templates/page.tsx

<TabsList className="grid grid-cols-5 mb-8">
  <TabsTrigger value="performance">Performance</TabsTrigger>
  <TabsTrigger value="attribution">Attribution</TabsTrigger>
  <TabsTrigger value="forecast">Forecasting</TabsTrigger>
  <TabsTrigger value="competitive">Competitive</TabsTrigger>
  <TabsTrigger value="custom">Custom</TabsTrigger>
</TabsList>

<TabsContent value="competitive" className="space-y-6">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <TemplateCard 
      title="Competitor Benchmarking"
      description="Compare your performance against key competitors"
      type="competitive"
      metrics={["Market Share", "Share of Voice", "Relative CTR", "Relative CPA"]}
      onGenerate={handleGenerateReport}
      isGenerating={isGenerating && selectedTemplate?.title === "Competitor Benchmarking"}
    />
    
    <TemplateCard 
      title="Market Position Analysis"
      description="Analyze your position in the market landscape"
      type="competitive"
      metrics={["Market Share", "Growth Rate", "Competitive Index"]}
      onGenerate={handleGenerateReport}
      isGenerating={isGenerating && selectedTemplate?.title === "Market Position Analysis"}
    />
  </div>
</TabsContent>
```

### Adding a New Page

1. **Create a new page file**

```typescript
// src/app/new-feature/page.tsx

"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';

export default function NewFeaturePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch initial data
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/new-feature');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const result = await response.json();
      setData(result.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    try {
      const formData = new FormData(event.target);
      const payload = {
        name: formData.get('name'),
        value: formData.get('value'),
      };
      
      const response = await fetch('/api/new-feature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit data');
      }
      
      toast.success('Data submitted successfully');
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error submitting data:', error);
      toast.error('Failed to submit data');
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">New Feature</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Create New Item</CardTitle>
          <CardDescription>
            Add a new item to the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="new-feature-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="Enter name" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="value">Value</Label>
              <Input id="value" name="value" placeholder="Enter value" required />
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button type="submit" form="new-feature-form">
            Submit
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Existing Items</CardTitle>
          <CardDescription>
            View all existing items
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">
              <p>Loading...</p>
            </div>
          ) : data && data.length > 0 ? (
            <div className="space-y-4">
              {data.map((item) => (
                <div key={item.id} className="border p-4 rounded-md">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-muted-foreground">{item.value}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p>No items found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

2. **Create a corresponding API route**

```typescript
// src/app/api/new-feature/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Fetch data from database
    const items = await db.query('SELECT * FROM new_feature_items ORDER BY created_at DESC');
    
    return NextResponse.json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.value) {
      return NextResponse.json(
        { success: false, error: 'Name and value are required' },
        { status: 400 }
      );
    }
    
    // Insert into database
    const result = await db.query(
      'INSERT INTO new_feature_items (name, value) VALUES ($1, $2) RETURNING *',
      [body.name, body.value]
    );
    
    return NextResponse.json({
      success: true,
      item: result.rows[0],
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create item' },
      { status: 500 }
    );
  }
}
```

3. **Add the page to the navigation**

```typescript
// src/components/Navbar.tsx

<nav className="flex space-x-4">
  <Link href="/" className={pathname === '/' ? 'text-primary' : 'text-muted-foreground'}>
    Dashboard
  </Link>
  <Link href="/data-sources" className={pathname === '/data-sources' ? 'text-primary' : 'text-muted-foreground'}>
    Data Sources
  </Link>
  <Link href="/reports" className={pathname.startsWith('/reports') ? 'text-primary' : 'text-muted-foreground'}>
    Reports
  </Link>
  <Link href="/insights" className={pathname === '/insights' ? 'text-primary' : 'text-muted-foreground'}>
    Insights
  </Link>
  <Link href="/meridian" className={pathname === '/meridian' ? 'text-primary' : 'text-muted-foreground'}>
    Meridian
  </Link>
  <Link href="/new-feature" className={pathname === '/new-feature' ? 'text-primary' : 'text-muted-foreground'}>
    New Feature
  </Link>
</nav>
```

## Performance Optimization

### Frontend Optimization

1. **Code Splitting**

Next.js automatically performs code splitting, but you can optimize it further:

```typescript
// Use dynamic imports for large components
import dynamic from 'next/dynamic';

const LargeComponent = dynamic(() => import('@/components/LargeComponent'), {
  loading: () => <p>Loading...</p>,
});
```

2. **Image Optimization**

Use Next.js Image component for optimized images:

```typescript
import Image from 'next/image';

<Image
  src="/path/to/image.jpg"
  alt="Description"
  width={500}
  height={300}
  priority={true} // For important above-the-fold images
/>
```

3. **Memoization**

Use React's memoization features to prevent unnecessary re-renders:

```typescript
import { useMemo, useCallback } from 'react';

// Memoize expensive calculations
const expensiveResult = useMemo(() => {
  return performExpensiveCalculation(a, b);
}, [a, b]);

// Memoize callback functions
const handleClick = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

### Backend Optimization

1. **API Response Caching**

```typescript
// src/app/api/cached-data/route.ts

import { NextRequest, NextResponse } from 'next/server';

// Cache responses for 5 minutes
export const revalidate = 300;

export async function GET(request: NextRequest) {
  // Fetch data
  const data = await fetchData();
  
  return NextResponse.json({ data });
}
```

2. **Database Query Optimization**

```typescript
// Use indexes for frequently queried fields
await db.query('CREATE INDEX IF NOT EXISTS idx_connections_user_id ON data_connections(user_id)');

// Use specific column selection instead of SELECT *
const result = await db.query('SELECT id, name, type FROM data_connections WHERE user_id = $1', [userId]);

// Use pagination for large result sets
const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
const limit = 10;
const offset = (page - 1) * limit;

const result = await db.query(
  'SELECT * FROM data_connections LIMIT $1 OFFSET $2',
  [limit, offset]
);
```

3. **Batch Processing**

```typescript
// Process items in batches
async function processBatch(items, batchSize = 100) {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await Promise.all(batch.map(processItem));
  }
}
```

## Best Practices

### Code Organization

1. **Component Structure**

```
src/components/
├── ui/                 # Basic UI components
│   ├── button.tsx
│   ├── card.tsx
│   └── input.tsx
├── layout/             # Layout components
│   ├── Navbar.tsx
│   └── Footer.tsx
├── data-display/       # Data visualization components
│   ├── DataTable.tsx
│   └── Chart.tsx
└── forms/              # Form components
    ├── ConnectionForm.tsx
    └── ReportForm.tsx
```

2. **API Structure**

```
src/app/api/
├── data-connections/   # Data connection endpoints
│   └── route.ts
├── reports/            # Report endpoints
│   ├── route.ts
│   └── templates/
│       └── route.ts
└── insights/           # Insight endpoints
    └── route.ts
```

### Coding Standards

1. **TypeScript Types**

Define clear interfaces and types:

```typescript
// src/types/index.ts

export interface DataConnection {
  id: string;
  name: string;
  type: 'bigquery' | 'spreadsheet' | 'database' | 'file';
  createdAt: string;
  userId?: string;
  [key: string]: any; // Additional type-specific properties
}

export interface Report {
  id: string;
  title: string;
  description?: string;
  type: 'performance' | 'attribution' | 'forecast' | 'custom';
  htmlContent: string;
  insights?: Insight[];
  reasoning?: string;
  createdAt: string;
  userId?: string;
}

export interface Insight {
  title: string;
  explanation: string;
  recommendation: string;
}

export interface DataSourceConnector {
  connect(): Promise<{ success: boolean; message?: string }>;
  fetchData(query: string): Promise<{ data: any[]; message?: string }>;
  disconnect(): Promise<{ success: boolean; message?: string }>;
}
```

2. **Error Handling**

Use consistent error handling patterns:

```typescript
// src/lib/error-utils.ts

export class AppError extends Error {
  constructor(
    public message: string,
    public code: string,
    public status: number = 400
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      { success: false, error: error.message, code: error.code },
      { status: error.status }
    );
  }
  
  console.error('Unhandled error:', error);
  
  return NextResponse.json(
    { success: false, error: 'An unexpected error occurred', code: 'INTERNAL_ERROR' },
    { status: 500 }
  );
}
```

3. **Async/Await Pattern**

Use consistent async/await patterns:

```typescript
// Good practice
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

// Avoid mixing async/await with .then()
// Bad practice
async function fetchData() {
  return fetch('/api/data')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      return response.json();
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      throw error;
    });
}
```

### Security Best Practices

1. **Input Validation**

```typescript
// src/lib/validation.ts

import { z } from 'zod';

export const ConnectionSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['bigquery', 'spreadsheet', 'database', 'file']),
  // Type-specific fields
  projectId: z.string().optional(),
  datasetId: z.string().optional(),
  spreadsheetId: z.string().optional(),
  sheetName: z.string().optional(),
  host: z.string().optional(),
  port: z.string().optional(),
  database: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  filePath: z.string().optional(),
  fileType: z.string().optional(),
});

// Usage in API route
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = ConnectionSchema.parse(body);
    
    // Process validated data
    // ...
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    // Handle other errors
    // ...
  }
}
```

2. **API Rate Limiting**

```typescript
// src/middleware.ts

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Create a new ratelimiter
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
});

export async function middleware(request: NextRequest) {
  // Only rate limit API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.ip ?? '127.0.0.1';
    const { success } = await ratelimit.limit(ip);
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Too many requests', code: 'RATE_LIMIT_EXCEEDED' },
        { status: 429 }
      );
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

3. **Secure Environment Variables**

```typescript
// .env.local
OPENAI_API_KEY=your_api_key
DATABASE_URL=your_database_url

// Accessing environment variables
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables');
}

// Never expose sensitive environment variables to the client
// next.config.js
module.exports = {
  env: {
    // Public variables only
    APP_VERSION: '1.0.0',
  },
};
```

### Documentation

1. **Code Comments**

```typescript
/**
 * Generates a report using DeepSeek V3 models
 * 
 * @param title - Report title
 * @param description - Report description
 * @param data - Report data
 * @param type - Report type (performance, attribution, forecast)
 * @param channels - Marketing channels to include
 * @param metrics - Performance metrics to analyze
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
  // Implementation
}
```

2. **README and Documentation Files**

Maintain comprehensive documentation:
- README.md: Overview, installation, usage
- DEPLOYMENT.md: Deployment instructions
- API_CONFIGURATION.md: API documentation
- DEBUGGING.md: Debugging and development guide

3. **JSDoc for API Documentation**

```typescript
/**
 * @api {get} /api/data-connections Get all data connections
 * @apiName GetDataConnections
 * @apiGroup DataConnections
 * @apiVersion 1.0.0
 * 
 * @apiSuccess {Boolean} success Indicates if the request was successful
 * @apiSuccess {Object[]} connections List of data connections
 * @apiSuccess {String} connections.id Connection ID
 * @apiSuccess {String} connections.name Connection name
 * @apiSuccess {String} connections.type Connection type
 * @apiSuccess {String} connections.createdAt Creation timestamp
 * 
 * @apiError {Boolean} success false
 * @apiError {String} error Error message
 */
export async function GET(request: NextRequest) {
  // Implementation
}
```
