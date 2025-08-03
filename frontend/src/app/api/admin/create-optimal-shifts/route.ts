// API route for creating optimal shifts using hybrid algorithm
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'No authentication token' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Optimal Shifts API - Request body:', body);

    const response = await fetch(`${backendUrl}/admin/shift-optimization/create-optimal-shifts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('Optimal Shifts API - Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Optimal Shifts API - Backend error:', errorText);
      return NextResponse.json(
        { error: 'Failed to create optimal shifts' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Optimal Shifts API - Algorithm result:', {
      assignments: data.assignments?.length || 0,
      conflicts: data.conflicts?.length || 0,
      fulfillmentRate: data.fulfillmentRate
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Optimal Shifts API - Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
