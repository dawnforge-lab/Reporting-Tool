# Deployment Guide for Digital Marketing Reporting Tool

This document provides detailed instructions for deploying the Digital Marketing Reporting Tool in various environments.

## Table of Contents

- [Local Development Environment](#local-development-environment)
- [Production Deployment](#production-deployment)
  - [Cloudflare Pages](#cloudflare-pages)
  - [Vercel](#vercel)
  - [Self-hosted](#self-hosted)
- [Database Setup](#database-setup)
- [Environment Variables](#environment-variables)
- [Post-Deployment Verification](#post-deployment-verification)
- [Troubleshooting](#troubleshooting)

## Local Development Environment

### Prerequisites

- Node.js 18.x or later
- npm 9.x or later (or pnpm/yarn)
- Git

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

Create a `.env.local` file in the root directory with the required variables (see [Environment Variables](#environment-variables) section).

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

## Production Deployment

### Cloudflare Pages

Cloudflare Pages is the recommended deployment platform as it provides integrated support for Cloudflare Workers and D1 database.

#### Prerequisites

- Cloudflare account
- Wrangler CLI installed globally

#### Deployment Steps

1. **Build the application**

```bash
npm run build
# or
pnpm build
# or
yarn build
```

2. **Deploy to Cloudflare Pages**

```bash
# Login to Cloudflare (if not already logged in)
wrangler login

# Deploy the application
wrangler pages deploy .next
```

3. **Configure environment variables**

After deployment, go to the Cloudflare Dashboard:
- Navigate to Pages > Your Project > Settings > Environment variables
- Add all required environment variables (see [Environment Variables](#environment-variables) section)

4. **Set up the database**

```bash
# Create a D1 database (if not already created)
wrangler d1 create reporting-tool-db

# Apply migrations
wrangler d1 migrations apply reporting-tool-db
```

5. **Bind the database to your application**

Edit your `wrangler.toml` file:

```toml
[[d1_databases]]
binding = "DB"
database_name = "reporting-tool-db"
database_id = "your-database-id"
```

Then redeploy your application:

```bash
wrangler pages deploy .next
```

### Vercel

#### Prerequisites

- Vercel account
- Vercel CLI (optional)

#### Deployment Steps

1. **Connect your GitHub repository to Vercel**

- Go to [Vercel](https://vercel.com) and sign in
- Click "New Project"
- Import your GitHub repository
- Configure the project settings (build command, output directory, etc.)
- Add environment variables
- Click "Deploy"

2. **Alternative: Deploy using Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy the application
vercel
```

3. **Database setup for Vercel**

Since Vercel doesn't support Cloudflare D1 directly, you'll need to use an alternative database:

- **Option 1**: Use a PostgreSQL database from a provider like Supabase or Neon
- **Option 2**: Use PlanetScale for MySQL
- **Option 3**: Use Vercel Postgres

Update the database connection in your code accordingly.

### Self-hosted

#### Prerequisites

- A server with Node.js 18.x or later installed
- Nginx or another web server (optional, for reverse proxy)
- PM2 or another process manager (recommended)

#### Deployment Steps

1. **Build the application locally**

```bash
npm run build
# or
pnpm build
# or
yarn build
```

2. **Transfer files to your server**

```bash
# Example using rsync
rsync -avz --exclude 'node_modules' --exclude '.git' ./ user@your-server:/path/to/app/
```

3. **Install dependencies on the server**

```bash
cd /path/to/app
npm install --production
```

4. **Set up environment variables**

Create a `.env.production` file with all required variables.

5. **Start the application using PM2**

```bash
# Install PM2 if not already installed
npm install -g pm2

# Start the application
pm2 start npm --name "reporting-tool" -- start

# Save the PM2 configuration
pm2 save

# Set up PM2 to start on server boot
pm2 startup
```

6. **Set up Nginx as a reverse proxy (optional but recommended)**

Create a new Nginx configuration file:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the configuration and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/your-config /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

7. **Set up SSL with Let's Encrypt (recommended)**

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Database Setup

### Cloudflare D1 (Default)

The application uses Cloudflare D1 by default, which is a SQLite-compatible database that works with Cloudflare Workers.

#### Local Development

```bash
# Initialize the database
wrangler d1 execute DB --local --file=migrations/0001_initial.sql

# Reset the database if needed
rm -rf .wrangler/state/v3
wrangler d1 execute DB --local --file=migrations/0001_initial.sql
```

#### Production

```bash
# Create a D1 database
wrangler d1 create reporting-tool-db

# Apply migrations
wrangler d1 migrations apply reporting-tool-db --file=migrations/0001_initial.sql
```

### Alternative Databases

If you're not using Cloudflare, you'll need to modify the database connection code in `src/lib/db.ts` to support your chosen database:

#### PostgreSQL Example

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('executed query', { text, duration, rows: res.rowCount });
  return res;
}
```

## Environment Variables

Create a `.env.local` file for local development or set these variables in your deployment platform.

### Required Variables

```
# API Keys
OPENAI_API_KEY=your_openai_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key

# Database Configuration (if not using Cloudflare D1)
DATABASE_URL=your_database_connection_string

# Authentication (if implemented)
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### Optional Variables

```
# Google Cloud credentials for BigQuery
GOOGLE_APPLICATION_CREDENTIALS=path_to_credentials_file

# Feature flags
ENABLE_AI_FEATURES=true
ENABLE_MERIDIAN=true

# Logging
LOG_LEVEL=info
```

## Post-Deployment Verification

After deploying, verify that all components are working correctly:

1. **Check the frontend**
   - Navigate to your deployed URL
   - Verify that all pages load correctly
   - Check that styles and assets are loading

2. **Test API endpoints**
   - Create a data connection
   - Generate a report
   - Test AI insights generation

3. **Verify database connectivity**
   - Create a test record
   - Retrieve the test record
   - Delete the test record

4. **Check external API integrations**
   - Test DeepSeek API connection
   - Test BigQuery connection (if configured)

## Troubleshooting

### Common Deployment Issues

#### Build Failures

- **Issue**: Next.js build fails with errors
- **Solution**: Check for TypeScript errors, missing dependencies, or environment variables

```bash
# Clear Next.js cache
rm -rf .next

# Update dependencies
npm update

# Check for TypeScript errors
npm run type-check
```

#### Database Connection Issues

- **Issue**: Application cannot connect to the database
- **Solution**: Verify database credentials and network connectivity

```bash
# For Cloudflare D1, check binding
wrangler d1 list

# For other databases, check connection string
echo $DATABASE_URL
```

#### API Key Issues

- **Issue**: External API calls fail
- **Solution**: Verify API keys are correctly set in environment variables

```bash
# Check if environment variables are set
echo $OPENAI_API_KEY
echo $DEEPSEEK_API_KEY
```

#### CORS Issues

- **Issue**: API requests fail due to CORS errors
- **Solution**: Configure CORS headers in API routes

Add the following to your API route handlers:

```typescript
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

#### Memory Issues

- **Issue**: Application crashes with memory errors
- **Solution**: Increase memory allocation or optimize code

For Cloudflare Workers, update your `wrangler.toml`:

```toml
[build.upload]
format = "service-worker"

[build]
command = "npm run build"
[build.upload.main]
format = "modules"
binding_format = "esm"
```
