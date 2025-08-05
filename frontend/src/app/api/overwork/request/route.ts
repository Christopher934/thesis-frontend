import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Call backend API to create overwork request
    const response = await fetch(`${BACKEND_URL}/overwork/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('authorization') || '',
      },
      body: JSON.stringify({
        userId: body.userId,
        additionalHours: body.requestedAdditionalShifts * 8, // Convert shifts to hours
        duration: body.requestType.toLowerCase(), // 'temporary' or 'permanent'
        reason: body.reason,
        urgency: body.urgency,
        validUntil: body.requestType === 'TEMPORARY' ? 
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : // 30 days from now
          null
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({
        success: false,
        message: errorData.message || 'Failed to submit overwork request'
      }, { status: response.status });
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data: data,
      message: 'Overwork request submitted successfully'
    });

  } catch (error) {
    console.error('Error creating overwork request:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
