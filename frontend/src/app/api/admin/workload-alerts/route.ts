// API route for workload alerts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'No authentication token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const severity = searchParams.get('severity');

    let url = `${backendUrl}/admin/shift-optimization/workload-alerts`;
    if (severity) {
      url += `?severity=${severity}`;
    }

    console.log('Workload Alerts API - Calling backend:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Workload Alerts API - Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Workload Alerts API - Backend error:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch workload alerts' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Workload Alerts API - Data received for', data.alerts?.length || 0, 'alerts');

    return NextResponse.json(data);
  } catch (error) {
    console.error('Workload Alerts API - Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
