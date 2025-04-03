import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// Simple registration for demo purposes
// In a production app, use a proper authentication system with secure password hashing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, email } = body;
    
    // Validate required fields
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }
    
    const db = await getDb();
    
    // Check if username already exists
    const existingUser = await db.prepare(
      "SELECT id FROM users WHERE username = ?"
    ).bind(username).first();
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      );
    }
    
    const id = uuidv4();
    
    await db.prepare(
      `INSERT INTO users (id, username, password_hash, email, created_at, updated_at)
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
    ).bind(
      id,
      username,
      password, // In production, hash this password
      email || null
    ).run();
    
    return NextResponse.json({
      message: 'Registration successful',
      user: {
        id,
        username
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error during registration:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
