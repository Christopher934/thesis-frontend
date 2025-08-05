import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shiftId = searchParams.get('shiftId');
    const targetDate = searchParams.get('targetDate');
    
    if (!shiftId) {
      return NextResponse.json(
        { error: 'shiftId parameter is required' },
        { status: 400 }
      );
    }

    // Get authorization header
    const authorization = request.headers.get('authorization');
    if (!authorization) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    // Build backend URL
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    let url = `${backendUrl}/smart-swap/available-partners?shiftId=${shiftId}`;
    if (targetDate) {
      url += `&targetDate=${targetDate}`;
    }

    console.log('Smart Swap API - Calling backend:', url);

    // Forward request to backend
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json',
      },
    });

    console.log('Smart Swap API - Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Smart Swap API - Backend error:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch available partners' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Smart Swap API - Returning data for', data.length, 'partners');
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Smart Swap API - Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
