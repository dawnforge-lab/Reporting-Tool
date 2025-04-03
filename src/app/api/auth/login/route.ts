import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// Simple authentication for demo purposes
// In a production app, use a proper authentication system with secure password hashing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;
    
    // Validate required fields
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }
    
    const db = await getDb();
    const user = await db.prepare(
      "SELECT id, username FROM users WHERE username = ? AND password_hash = ?"
    ).bind(username, password).first();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }
    
    // In a real app, we would generate a JWT token here
    // For demo purposes, we'll just return the user ID
    
    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
