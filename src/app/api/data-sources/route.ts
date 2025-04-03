import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// Type definitions for data sources
export type DataSourceType = 'bigquery' | 'spreadsheet' | 'database' | 'csv';

export interface DataSource {
  id: string;
  name: string;
  type: DataSourceType;
  config: Record<string, any>;
  userId: string;
  status: 'active' | 'inactive' | 'error';
  lastConnected?: string;
  createdAt: string;
  updatedAt: string;
}

// GET handler to retrieve all data sources
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const dataSources = await db.prepare(
      "SELECT * FROM data_sources ORDER BY created_at DESC"
    ).all();
    
    return NextResponse.json({ data: dataSources.results }, { status: 200 });
  } catch (error) {
    console.error('Error fetching data sources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data sources' },
      { status: 500 }
    );
  }
}

// POST handler to create a new data source
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, config } = body;
    
    // Validate required fields
    if (!name || !type || !config) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // In a real app, we would get the user ID from the session
    const userId = 'demo-user-id';
    
    const db = await getDb();
    const id = uuidv4();
    
    await db.prepare(
      `INSERT INTO data_sources (id, name, type, config, user_id, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
    ).bind(
      id,
      name,
      type,
      JSON.stringify(config),
      userId,
      'inactive'
    ).run();
    
    return NextResponse.json(
      { 
        message: 'Data source created successfully',
        data: { id, name, type }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating data source:', error);
    return NextResponse.json(
      { error: 'Failed to create data source' },
      { status: 500 }
    );
  }
}
