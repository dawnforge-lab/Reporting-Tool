# Digital Marketing Reporting Tool

A comprehensive web application for digital marketing analytics, reporting, and budget optimization with AI-powered insights.

## Features

- **Multiple Data Source Connections**: Connect to BigQuery, Google Spreadsheets, databases, and CSV/Excel files
- **Interactive Report Templates**: Pre-built and custom report templates for marketing performance analysis
- **AI-Powered Insights**: Leverage DeepSeek V3 models for intelligent data analysis and recommendations
- **Marketing Mix Modeling**: Optimize budget allocation using Google's Meridian framework
- **Modern UI**: Responsive interface built with Next.js and Tailwind CSS

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [API Configuration](#api-configuration)
- [Development Guide](#development-guide)
- [Debugging](#debugging)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Prerequisites

- Node.js 18.x or later
- npm 9.x or later (or pnpm/yarn)
- Git
- A Cloudflare account (for production deployment)

## Installation

### Clone the Repository

```bash
git clone https://github.com/dawnforge-lab/Reporting-Tool.git
cd Reporting-Tool
```

### Install Dependencies

```bash
npm install
# or
pnpm install
# or
yarn install
```

### Set Up Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
# API Keys
OPENAI_API_KEY=your_openai_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key

# Database Configuration
DATABASE_URL=your_database_connection_string

# Authentication (if implemented)
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Optional: Google Cloud credentials for BigQuery
GOOGLE_APPLICATION_CREDENTIALS=path_to_credentials_file
```

## Configuration

### Database Setup

The application uses Cloudflare D1 (SQLite-compatible) for data storage. To initialize the database:

1. Install Wrangler CLI:
   ```bash
   npm install -g wrangler
   ```

2. Initialize the database:
   ```bash
   wrangler d1 execute DB --local --file=migrations/0001_initial.sql
   ```

### API Keys

To use the AI features, you'll need to obtain API keys:

1. **DeepSeek API**: Sign up at [DeepSeek's website](https://deepseek.ai) and generate an API key
2. **OpenAI API**: Sign up at [OpenAI's website](https://openai.com) and generate an API key

Add these keys to your `.env.local` file.

## Deployment

### Local Development

To run the application locally:

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Production Deployment

#### Cloudflare Pages (Recommended)

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy using Wrangler:
   ```bash
   wrangler pages deploy .next
   ```

3. Configure environment variables in the Cloudflare dashboard.

#### Alternative Deployment Options

The application can also be deployed to:

- **Vercel**: Connect your GitHub repository to Vercel for automatic deployments
- **Netlify**: Use the Netlify CLI or connect your GitHub repository
- **Self-hosted**: Deploy the built application to any Node.js server

## API Configuration

### Available API Endpoints

The application provides the following API endpoints:

- `/api/data-connections`: Manage data source connections
- `/api/reports`: Create and retrieve reports
- `/api/reports/templates`: Generate report templates
- `/api/insights`: Generate AI-powered insights
- `/api/ai/generate-insights`: Direct access to DeepSeek V3 for insights
- `/api/meridian/model`: Build and access marketing mix models

### Configuring External APIs

#### DeepSeek V3 Integration

The DeepSeek V3 integration is configured in `src/lib/deepseek.ts`. You can modify:

- Model parameters (temperature, max tokens)
- Prompt templates
- Response parsing logic

#### Meridian Integration

The Meridian integration is configured in `src/lib/meridian.ts`. You can modify:

- Model parameters (adstock, saturation)
- Optimization constraints
- Data preprocessing logic

## Development Guide

### Adding New Features

#### New Data Source Connectors

1. Create a new connector file in `src/lib/connectors/`
2. Implement the connector interface
3. Register the connector in `src/lib/data-sources.ts`
4. Add UI components in `src/app/data-sources/page.tsx`

#### New Report Templates

1. Add template definition in `src/app/api/reports/templates/route.ts`
2. Create UI components in `src/app/reports/templates/page.tsx`
3. Implement template generation logic

#### New AI Features

1. Define new prompts in `src/lib/deepseek.ts`
2. Create API endpoints in `src/app/api/`
3. Implement UI components to use the new features

### Code Style and Conventions

- Use TypeScript for type safety
- Follow the Next.js App Router conventions
- Use React Server Components where possible
- Use client components (`"use client"`) for interactive UI elements

## Debugging

### Common Issues and Solutions

#### API Connection Issues

- Check API keys in `.env.local`
- Verify network connectivity
- Check API rate limits

#### Database Issues

- Reset local database: `rm -rf .wrangler/state/v3`
- Re-execute SQL file: `wrangler d1 execute DB --local --file=migrations/0001_initial.sql`

#### Build Errors

- Clear Next.js cache: `rm -rf .next`
- Update dependencies: `npm update`
- Check for TypeScript errors: `npm run type-check`

### Logging

- Server-side logs are available in the terminal
- Client-side logs are available in the browser console
- API request logs can be viewed in the Network tab of browser DevTools

### Debugging Tools

- Use the React DevTools extension for component debugging
- Use the Network tab in browser DevTools for API requests
- Use `console.log` statements for quick debugging (remove before production)

## Project Structure

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

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
