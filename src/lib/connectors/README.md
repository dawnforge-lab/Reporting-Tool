# Data Connectors

This directory contains connectors for various data sources used in the reporting workflow.

## Available Connectors

| Connector | Description | File |
|-----------|-------------|------|
| Google Ads | Connects to Google Ads API | `google-ads-connector.ts` |
| Meta (Facebook/Instagram) | Connects to Meta Marketing API | `meta-connector.ts` |
| Google Analytics | Connects to GA4 Data API | `google-analytics-connector.ts` |
| BigQuery | Connects to Google BigQuery | `bigquery-connector.ts` |
| Google Sheets | Retrieves data from Google Sheets | `google-sheets-connector.ts` |
| Local Database | Connects to local SQLite database | `local-db-connector.ts` |
| JSON | Parses JSON files or strings | `json-connector.ts` |
| Cloudflare D1 | Connects to Cloudflare D1 database | `d1-connector.ts` |

## Connector Interface

All connectors implement the `ConnectorInterface` defined in `src/lib/types.ts`:

```typescript
interface ConnectorInterface {
  name: string;
  type: string;
  icon: string;
  connect(config: any): Promise<boolean>;
  fetchData(query: any, dateRange?: DateRange): Promise<DataResult>;
  disconnect(): Promise<boolean>;
}
```

## Implementation Examples

### Basic Connection Template

```typescript
class MyConnector implements ConnectorInterface {
  name = "My Connector";
  type = "my-connector";
  icon = "database";
  isConnected = false;
  private client: any = null;

  async connect(config: any): Promise<boolean> {
    try {
      // Initialize connection
      this.client = await this.createClient(config);
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error("Connection error:", error);
      this.isConnected = false;
      throw error;
    }
  }

  async fetchData(query: any, dateRange?: DateRange): Promise<DataResult> {
    if (!this.isConnected) {
      throw new Error("Not connected to data source");
    }
    
    try {
      // Fetch data logic
      const result = await this.client.query(query);
      
      // Transform response
      return this.transformResponse(result, query);
    } catch (error) {
      console.error("Data fetch error:", error);
      throw error;
    }
  }

  async disconnect(): Promise<boolean> {
    try {
      // Cleanup logic
      this.client = null;
      this.isConnected = false;
      return true;
    } catch (error) {
      console.error("Disconnect error:", error);
      throw error;
    }
  }

  private transformResponse(response: any, query: any): DataResult {
    // Transform response to DataResult format
    return {
      data: response,
      columns: [], // Extracted columns
      rows: [],    // Transformed rows
      query: query,
      metadata: {
        source: this.name,
        timestamp: new Date().toISOString()
      }
    };
  }

  private async createClient(config: any): Promise<any> {
    // Implementation-specific client creation
  }
}
```

## Environment Compatibility

Each connector is designed to work in specific environments:

| Connector | Browser | Node.js | Cloudflare Workers |
|-----------|---------|---------|-------------------|
| Google Ads | ✅ | ✅ | ❌ |
| Meta | ✅ | ✅ | ✅ |
| Google Analytics | ✅ | ✅ | ✅ |
| BigQuery | ❌ | ✅ | ❌ |
| Google Sheets | ✅ | ✅ | ✅ |
| Local Database | ❌ | ✅ | ❌ |
| JSON | ✅ | ✅ | ✅ |
| Cloudflare D1 | ❌ | ❌ | ✅ |

## Debugging Connectors

For debugging connector issues, each connector implements helpful error messages and logging:

```typescript
try {
  // Connector operation
} catch (error) {
  console.error(`[MyConnector] Operation failed: ${error.message}`, error);
  throw new Error(`MyConnector error: ${error.message}`);
}
```

### Environment Detection

Some connectors need to behave differently based on the environment:

```typescript
const isNode = typeof window === 'undefined';
const isCloudflareWorker = typeof globalThis.caches !== 'undefined';
```

## Adding a New Connector

To add a new connector:

1. Create a new file `your-connector.ts` using the template above
2. Implement the `ConnectorInterface` methods
3. Add your connector to `index.ts` for export
4. Update the `ConnectionForm` component to support your connector
5. Update this README with your connector details

## Testing Connectors

For testing connectors, you can create test scripts in the `tests` directory:

```typescript
// tests/test-connector.ts
import { YourConnector } from '../src/lib/connectors/your-connector';

async function testConnector() {
  const connector = new YourConnector();
  
  try {
    await connector.connect({
      // test configuration
    });
    
    const result = await connector.fetchData({
      // test query
    });
    
    console.log("Test result:", result);
    
    await connector.disconnect();
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testConnector();
```

## TypeScript Issues

For common TypeScript errors and solutions, refer to the [TYPESCRIPT.md](./TYPESCRIPT.md) guide. 