// API route for admin dashboard
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'No authentication token' }, { status: 401 });
    }

    console.log('Admin Dashboard API - Calling backend...');

    const response = await fetch(`${backendUrl}/admin/shift-optimization/dashboard`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Admin Dashboard API - Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Admin Dashboard API - Backend error:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch admin dashboard data' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Admin Dashboard API - Data received:', data);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Admin Dashboard API - Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
