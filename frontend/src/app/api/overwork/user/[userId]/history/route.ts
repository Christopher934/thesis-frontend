import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const resolvedParams = await params;
    const userId = resolvedParams.userId;
    
    // Call backend API to get user's overwork request history
    const response = await fetch(`${BACKEND_URL}/overwork/user/${userId}/history`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('authorization') || '',
      },
    });

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        message: 'Failed to fetch overwork request history'
      }, { status: response.status });
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data: data.data || data,
      message: 'Overwork request history retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching overwork request history:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
