# API Configuration Guide for Digital Marketing Reporting Tool

This document provides detailed information about the API endpoints, configuration options, and integration points for the Digital Marketing Reporting Tool.

## Table of Contents

- [API Overview](#api-overview)
- [API Endpoints](#api-endpoints)
- [External API Integrations](#external-api-integrations)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [API Testing](#api-testing)
- [Custom API Extensions](#custom-api-extensions)

## API Overview

The Digital Marketing Reporting Tool provides a set of RESTful API endpoints for interacting with the application programmatically. These endpoints are built using Next.js API routes and follow standard REST conventions.

### Base URL

- Local development: `http://localhost:3000/api`
- Production: `https://your-domain.com/api`

### Response Format

All API responses follow a standard format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

Or in case of an error:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## API Endpoints

### Data Connections

#### List Data Connections

```
GET /api/data-connections
```

Returns a list of all data connections.

**Response:**

```json
{
  "success": true,
  "connections": [
    {
      "id": "conn_123",
      "name": "My BigQuery Connection",
      "type": "bigquery",
      "projectId": "my-project",
      "datasetId": "my-dataset",
      "createdAt": "2025-04-01T12:00:00Z"
    },
    {
      "id": "conn_456",
      "name": "Marketing Spreadsheet",
      "type": "spreadsheet",
      "spreadsheetId": "1abc123def456",
      "sheetName": "Data",
      "createdAt": "2025-04-02T10:30:00Z"
    }
  ]
}
```

#### Create Data Connection

```
POST /api/data-connections
```

Creates a new data connection.

**Request Body:**

```json
{
  "name": "New Connection",
  "type": "bigquery",
  "projectId": "my-project",
  "datasetId": "my-dataset",
  "keyFile": "/path/to/key.json"
}
```

**Response:**

```json
{
  "success": true,
  "connection": {
    "id": "conn_789",
    "name": "New Connection",
    "type": "bigquery",
    "projectId": "my-project",
    "datasetId": "my-dataset",
    "createdAt": "2025-04-03T09:45:00Z"
  }
}
```

#### Test Data Connection

```
POST /api/data-connections/test
```

Tests a data connection.

**Request Body:**

```json
{
  "connectionId": "conn_123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Connection test successful"
}
```

#### Delete Data Connection

```
DELETE /api/data-connections/:id
```

Deletes a data connection.

**Response:**

```json
{
  "success": true,
  "message": "Connection deleted successfully"
}
```

### Reports

#### List Reports

```
GET /api/reports
```

Returns a list of all reports.

**Response:**

```json
{
  "success": true,
  "reports": [
    {
      "id": "rep_123",
      "title": "Q1 Performance Report",
      "type": "performance",
      "createdAt": "2025-04-01T14:30:00Z"
    },
    {
      "id": "rep_456",
      "title": "Campaign Attribution Analysis",
      "type": "attribution",
      "createdAt": "2025-04-02T11:15:00Z"
    }
  ]
}
```

#### Generate Report

```
POST /api/reports/templates
```

Generates a new report from a template.

**Request Body:**

```json
{
  "title": "Monthly Performance Report",
  "description": "Analysis of marketing performance for April 2025",
  "type": "performance",
  "channels": ["Paid Search", "Social Media", "Email", "Display"],
  "metrics": ["Impressions", "Clicks", "Conversions", "Cost", "Revenue", "ROAS"],
  "period": "last_30_days"
}
```

**Response:**

```json
{
  "success": true,
  "report": {
    "id": "rep_789",
    "title": "Monthly Performance Report",
    "type": "performance",
    "htmlContent": "<!DOCTYPE html>...",
    "insights": [...],
    "reasoning": "...",
    "createdAt": "2025-04-03T10:00:00Z"
  }
}
```

### AI Insights

#### Generate Insights

```
POST /api/ai/generate-insights
```

Generates AI-powered insights from marketing data.

**Request Body:**

```json
{
  "data": {
    "channels": {
      "Paid Search": {
        "Impressions": 1000000,
        "Clicks": 50000,
        "Conversions": 2500,
        "Cost": 25000,
        "Revenue": 75000
      },
      "Social Media": {
        "Impressions": 2000000,
        "Clicks": 40000,
        "Conversions": 1200,
        "Cost": 15000,
        "Revenue": 36000
      }
    },
    "period": "last_30_days"
  },
  "context": {
    "channels": ["Paid Search", "Social Media"],
    "additionalInstructions": "Focus on conversion rate optimization"
  }
}
```

**Response:**

```json
{
  "success": true,
  "insights": [
    {
      "title": "Conversion Rate Optimization Opportunity",
      "explanation": "Analysis shows that Paid Search has a significantly higher conversion rate (5%) compared to Social Media (3%).",
      "recommendation": "Allocate more budget to Paid Search campaigns and optimize Social Media landing pages to improve conversion rates."
    },
    {
      "title": "ROAS Comparison",
      "explanation": "Paid Search shows a ROAS of 3.0x while Social Media shows a ROAS of 2.4x.",
      "recommendation": "Consider reallocating 20% of Social Media budget to high-performing Paid Search campaigns."
    }
  ]
}
```

### Marketing Mix Modeling

#### Create Model

```
POST /api/meridian/model
```

Creates a marketing mix model using Meridian.

**Request Body:**

```json
{
  "dataSourceId": "conn_123",
  "dataConfig": {
    "type": "bigquery"
  },
  "modelConfig": {
    "dateColumn": "date",
    "targetColumn": "revenue",
    "channelColumns": [
      "Paid Search_spend",
      "Social Media_spend",
      "Email_spend",
      "Display_spend"
    ],
    "adstockMaxLag": 4,
    "hillExponentBound": 3.0,
    "optimizeBudget": true,
    "totalBudget": 100000
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Marketing mix model created successfully",
  "model": {
    "results": {...},
    "reportData": {...},
    "budgetAllocation": {
      "Paid Search_spend": 45000,
      "Social Media_spend": 25000,
      "Email_spend": 15000,
      "Display_spend": 15000
    }
  }
}
```

## External API Integrations

### DeepSeek V3 Integration

The application integrates with DeepSeek V3 for AI-powered analysis and insights. This integration is configured in `src/lib/deepseek.ts`.

#### Configuration Options

```typescript
// src/lib/deepseek.ts

// Initialize the OpenAI client with API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-api-key-here',
});

// Configuration options
const config = {
  models: {
    chat: "deepseek-v3-chat",
    reasoner: "deepseek-v3-reasoner"
  },
  parameters: {
    temperature: 0.7,
    max_tokens: 4000,
  },
  prompts: {
    reportGeneration: `You are an expert marketing analyst...`,
    insightGeneration: `You are an expert marketing analyst...`
  }
};
```

#### Customizing Prompts

To customize the prompts used for AI analysis:

1. Edit the prompt templates in `src/lib/deepseek.ts`
2. Adjust the system and user prompts to focus on specific aspects of marketing analysis
3. Update the response parsing logic if needed

### Meridian Integration

The application integrates with Google's Meridian for marketing mix modeling. This integration is configured in `src/lib/meridian.ts`.

#### Configuration Options

```typescript
// src/lib/meridian.ts

// MeridianWrapper class for marketing mix modeling
export class MeridianWrapper {
  // Configuration options
  private config = {
    adstockMaxLag: 4,
    hillExponentBound: 3.0,
    iterations: 1000,
    chains: 4
  };

  // Methods for model building and optimization
  // ...
}
```

#### Customizing Model Parameters

To customize the Meridian model parameters:

1. Edit the configuration options in `src/lib/meridian.ts`
2. Adjust the adstock and saturation parameters
3. Modify the optimization constraints

## Authentication

The API endpoints can be protected using authentication middleware. By default, the application uses a simple API key authentication mechanism.

### API Key Authentication

To enable API key authentication:

1. Generate a secure API key
2. Add the API key to your environment variables:

```
API_KEY=your-secure-api-key
```

3. Create an authentication middleware in `src/middleware.ts`:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check for API key in headers
  const apiKey = request.headers.get('x-api-key');
  
  // If the request is to an API route and the API key is invalid
  if (
    request.nextUrl.pathname.startsWith('/api/') &&
    apiKey !== process.env.API_KEY
  ) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

### JWT Authentication

For more advanced authentication, you can implement JWT authentication:

1. Install the required packages:

```bash
npm install jsonwebtoken
```

2. Create a JWT authentication middleware:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(request: NextRequest) {
  // Check for JWT token in headers
  const authHeader = request.headers.get('authorization');
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    return NextResponse.next();
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid token' },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: '/api/:path*',
};
```

## Error Handling

The API implements standardized error handling to provide consistent error responses.

### Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

- `INVALID_REQUEST`: The request is malformed or missing required fields
- `UNAUTHORIZED`: Authentication failed
- `FORBIDDEN`: The authenticated user doesn't have permission
- `NOT_FOUND`: The requested resource doesn't exist
- `INTERNAL_ERROR`: An unexpected error occurred on the server
- `EXTERNAL_API_ERROR`: An error occurred with an external API

### Implementing Error Handling

```typescript
// src/lib/api-utils.ts

export class ApiError extends Error {
  constructor(
    public message: string,
    public code: string,
    public status: number = 400
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return Response.json(
      { success: false, error: error.message, code: error.code },
      { status: error.status }
    );
  }
  
  console.error('Unhandled API error:', error);
  
  return Response.json(
    { success: false, error: 'An unexpected error occurred', code: 'INTERNAL_ERROR' },
    { status: 500 }
  );
}
```

## Rate Limiting

To protect your API from abuse, you can implement rate limiting:

1. Install the required packages:

```bash
npm install @upstash/ratelimit @upstash/redis
```

2. Create a rate limiting middleware:

```typescript
// src/middleware.ts

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Create a new ratelimiter that allows 10 requests per 10 seconds
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
});

export async function middleware(request: NextRequest) {
  // Get the IP address from the request
  const ip = request.ip ?? '127.0.0.1';
  
  // Only rate limit API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
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

## API Testing

### Using Postman

1. Download and install [Postman](https://www.postman.com/downloads/)
2. Create a new collection for the Digital Marketing Reporting Tool
3. Set up environment variables for your API URL and authentication
4. Create requests for each API endpoint
5. Save and organize your requests for future use

### Using cURL

Test API endpoints using cURL commands:

```bash
# List data connections
curl -X GET http://localhost:3000/api/data-connections

# Create a data connection
curl -X POST http://localhost:3000/api/data-connections \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Connection","type":"bigquery","projectId":"my-project","datasetId":"my-dataset"}'

# Generate a report
curl -X POST http://localhost:3000/api/reports/templates \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Report","type":"performance","channels":["Paid Search"],"metrics":["Impressions","Clicks"],"period":"last_30_days"}'
```

### Automated Testing

Create automated tests using Jest and Supertest:

1. Install the required packages:

```bash
npm install --save-dev jest supertest
```

2. Create test files in the `__tests__` directory:

```typescript
// __tests__/api/data-connections.test.ts

import { createServer } from 'http';
import { apiResolver } from 'next/dist/server/api-utils/node';
import { NextApiRequest, NextApiResponse } from 'next';
import handler from '../../src/app/api/data-connections/route';
import supertest from 'supertest';

describe('Data Connections API', () => {
  let server;
  let request;

  beforeAll(() => {
    server = createServer((req, res) => {
      return apiResolver(
        req,
        res,
        undefined,
        handler,
        {},
        false
      );
    });
    request = supertest(server);
  });

  afterAll((done) => {
    server.close(done);
  });

  it('should list data connections', async () => {
    const response = await request.get('/');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.connections)).toBe(true);
  });
});
```

## Custom API Extensions

### Adding New API Endpoints

To add a new API endpoint:

1. Create a new file in the `src/app/api` directory:

```typescript
// src/app/api/custom-endpoint/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Your custom logic here
    const data = { message: 'Custom endpoint working!' };
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error in custom endpoint:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Your custom logic here
    const result = { received: body };
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error in custom endpoint:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred' },
      { status: 500 }
    );
  }
}
```

2. Test your new endpoint:

```bash
curl -X GET http://localhost:3000/api/custom-endpoint
curl -X POST http://localhost:3000/api/custom-endpoint -H "Content-Type: application/json" -d '{"test":"data"}'
```

### Integrating Additional External APIs

To integrate a new external API:

1. Install any required client libraries:

```bash
npm install new-api-client
```

2. Create a new file in the `src/lib` directory:

```typescript
// src/lib/new-api.ts

import { NewApiClient } from 'new-api-client';

export class NewApiWrapper {
  private client: NewApiClient;
  
  constructor() {
    this.client = new NewApiClient({
      apiKey: process.env.NEW_API_KEY
    });
  }
  
  async fetchData(params) {
    try {
      const response = await this.client.getData(params);
      return response;
    } catch (error) {
      console.error('Error fetching data from new API:', error);
      throw error;
    }
  }
  
  // Add more methods as needed
}
```

3. Create an API endpoint to expose the new functionality:

```typescript
// src/app/api/new-feature/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { NewApiWrapper } from '@/lib/new-api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newApi = new NewApiWrapper();
    const result = await newApi.fetchData(body.params);
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error in new feature endpoint:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred' },
      { status: 500 }
    );
  }
}
```
