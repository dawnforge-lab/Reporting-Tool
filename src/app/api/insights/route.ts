import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// Type definitions for insights
export interface Insight {
  id: string;
  title: string;
  explanation: string;
  recommendation: string;
  reportId?: string;
  userId: string;
  createdAt: string;
}

// GET handler to retrieve all insights
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const insights = await db.prepare(
      "SELECT * FROM insights ORDER BY created_at DESC"
    ).all();
    
    return NextResponse.json({ data: insights.results }, { status: 200 });
  } catch (error) {
    console.error('Error fetching insights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch insights' },
      { status: 500 }
    );
  }
}

// POST handler to create a new insight
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, explanation, recommendation, reportId } = body;
    
    // Validate required fields
    if (!title || !explanation || !recommendation) {
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
      `INSERT INTO insights (id, title, explanation, recommendation, report_id, user_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
    ).bind(
      id,
      title,
      explanation,
      recommendation,
      reportId || null,
      userId
    ).run();
    
    return NextResponse.json(
      { 
        message: 'Insight created successfully',
        data: { id, title }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating insight:', error);
    return NextResponse.json(
      { error: 'Failed to create insight' },
      { status: 500 }
    );
  }
}
