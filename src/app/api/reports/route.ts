import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// Type definitions for reports
export interface Report {
  id: string;
  title: string;
  description?: string;
  type: string;
  config: Record<string, any>;
  userId: string;
  htmlContent?: string;
  createdAt: string;
  updatedAt: string;
}

// GET handler to retrieve all reports
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const reports = await db.prepare(
      "SELECT * FROM reports ORDER BY created_at DESC"
    ).all();
    
    return NextResponse.json({ data: reports.results }, { status: 200 });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

// POST handler to create a new report
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, type, config } = body;
    
    // Validate required fields
    if (!title || !type || !config) {
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
      `INSERT INTO reports (id, title, description, type, config, user_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
    ).bind(
      id,
      title,
      description || '',
      type,
      JSON.stringify(config),
      userId
    ).run();
    
    // In a real implementation, we would generate the report content here
    // For now, we'll just return the report ID
    
    return NextResponse.json(
      { 
        message: 'Report created successfully',
        data: { id, title, type }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json(
      { error: 'Failed to create report' },
      { status: 500 }
    );
  }
}
