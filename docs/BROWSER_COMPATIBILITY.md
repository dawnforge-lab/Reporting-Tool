# Browser Compatibility Guide

This guide explains how the connectors behave in different environments (browser, Node.js, Cloudflare Workers) and provides strategies for ensuring compatibility.

## Environment Detection

The connectors use environment detection to adjust their behavior:

```typescript
// Common environment detection code used in connectors
const isNode = typeof window === 'undefined';
const isCloudflareWorker = typeof globalThis.caches !== 'undefined';
```

## Connector Compatibility Matrix

| Connector | Browser | Node.js | Cloudflare Workers | Notes |
|-----------|---------|---------|-------------------|-------|
| Google Ads | ✅ | ✅ | ❌ | Uses OAuth in browser, service account in Node.js |
| Meta | ✅ | ✅ | ✅ | Works in all environments with appropriate auth |
| Google Analytics | ✅ | ✅ | ✅ | Uses different auth methods per environment |
| BigQuery | ❌ | ✅ | ❌ | Node.js only, requires file system access |
| Google Sheets | ✅ | ✅ | ✅ | Uses OAuth in browser |
| Local Database (SQLite) | ❌ | ✅ | ❌ | Requires file system access |
| JSON | ✅ | ✅ | ✅ | Uses fetch() in browser, fs in Node.js |
| Cloudflare D1 | ❌ | ❌ | ✅ | Workers-only database |

## Browser-Specific Implementations

When running in the browser environment, connectors must adapt to several constraints:

1. **No access to the file system** - connectors use alternatives:
   - HTTP requests instead of direct file reads
   - IndexedDB for local storage instead of SQLite
   - Browser storage APIs (localStorage, sessionStorage)

2. **Authentication differences**:
   - OAuth flows in the browser vs service accounts in Node.js
   - Token storage requires consideration of security

3. **CORS considerations**:
   - API requests from browsers must comply with CORS
   - May require server-side proxy endpoints

## Implementing Browser Compatibility

### Dynamic Imports with Environment Checking

```typescript
class MyConnector implements ConnectorInterface {
  // ...
  
  async connect(config: any): Promise<boolean> {
    try {
      if (typeof window === 'undefined') {
        // Node.js environment - use Node.js specific modules
        const { SomeNodeModule } = await import('some-node-module');
        this.client = new SomeNodeModule(config);
      } else {
        // Browser environment - use browser-compatible approach
        this.client = await this.createBrowserClient(config);
      }
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error("Connection error:", error);
      this.isConnected = false;
      throw error;
    }
  }
  
  private async createBrowserClient(config: any): Promise<any> {
    // Browser-specific implementation
  }
}
```

### File Access Strategies

```typescript
async readFile(path: string): Promise<string> {
  if (typeof window === 'undefined') {
    // Node.js environment
    const fs = await import('fs/promises');
    return fs.readFile(path, 'utf-8');
  } else {
    // Browser environment
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }
    return response.text();
  }
}
```

### Authentication Handling

```typescript
async authenticate(config: any): Promise<any> {
  if (typeof window === 'undefined') {
    // Node.js - Service account auth
    const { GoogleAuth } = await import('google-auth-library');
    const auth = new GoogleAuth({
      keyFile: config.keyFilePath,
      scopes: config.scopes
    });
    return auth.getClient();
  } else {
    // Browser - OAuth flow
    // Use libraries like @react-oauth/google or implement your own OAuth flow
    // Store tokens securely in browser
    return this.setupBrowserAuth(config);
  }
}
```

## Cloudflare Workers Considerations

Cloudflare Workers have additional constraints:

1. **No file system access** - similar to browsers
2. **Limited runtime and memory** - keep operations efficient
3. **Access to Cloudflare-specific features** - D1, KV, Durable Objects

```typescript
async connectToDatabase(config: any): Promise<any> {
  if (typeof globalThis.caches !== 'undefined') {
    // Cloudflare Workers environment
    return env.DB; // D1 database binding
  } else if (typeof window === 'undefined') {
    // Node.js environment
    const sqlite = await import('better-sqlite3');
    return sqlite(config.dbPath);
  } else {
    // Browser environment
    const SQL = await import('sql.js');
    const sqlJs = await SQL.default();
    // Load database from arraybuffer or create new
    return new sqlJs.Database();
  }
}
```

## Best Practices for Cross-Environment Development

1. **Test in all target environments** during development
2. **Use feature detection** rather than user-agent sniffing
3. **Handle errors gracefully** with appropriate fallbacks
4. **Document environment requirements** for each connector
5. **Use conditional imports** to avoid bundling Node.js modules in the browser
6. **Consider creating separate builds** for different environments
7. **Use isomorphic libraries** when possible (libraries that work in multiple environments)

## Common Pitfalls

1. **Assuming Node.js APIs in the browser** - like `fs`, `path`, `crypto`
2. **Forgetting CORS in browser environments** - API calls may fail
3. **Not handling authentication differences** - OAuth vs service accounts
4. **Using incompatible dependencies** - some npm packages don't work in all environments
5. **Not accounting for API limitations** - quotas, rate limits vary by environment

## Testing Cross-Environment Code

For thorough testing across environments:

```typescript
// test-environments.ts
import { YourConnector } from '../src/lib/connectors/your-connector';

async function testConnector(environment: 'node' | 'browser' | 'worker') {
  console.log(`Testing in ${environment} environment`);
  
  const connector = new YourConnector();
  const config = getConfigForEnvironment(environment);
  
  try {
    await connector.connect(config);
    const result = await connector.fetchData({/* test query */});
    console.log("Test result:", result);
    await connector.disconnect();
  } catch (error) {
    console.error(`Test failed in ${environment}:`, error);
  }
}

// Run tests in Node.js directly
testConnector('node');

// For browser testing, you can use Puppeteer or run in an actual browser
// For Workers testing, use wrangler or miniflare
``` 