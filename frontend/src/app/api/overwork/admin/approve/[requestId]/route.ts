import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function PUT(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    const requestId = params.requestId;
    const body = await request.json();
    
    // Call backend API to approve overwork request
    const response = await fetch(`${BACKEND_URL}/overwork/requests/${requestId}/approve`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('authorization') || '',
      },
      body: JSON.stringify({
        adminId: body.adminId || 1,
        adminNotes: body.adminNotes
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({
        success: false,
        message: errorData.message || 'Failed to approve request'
      }, { status: response.status });
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data: data,
      message: 'Request approved successfully'
    });

  } catch (error) {
    console.error('Error approving request:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    const requestId = params.requestId;
    const body = await request.json();
    
    // Call backend API to reject overwork request
    const response = await fetch(`${BACKEND_URL}/overwork/requests/${requestId}/reject`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('authorization') || '',
      },
      body: JSON.stringify({
        adminId: body.adminId || 1,
        adminNotes: body.adminNotes
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({
        success: false,
        message: errorData.message || 'Failed to reject request'
      }, { status: response.status });
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data: data,
      message: 'Request rejected successfully'
    });

  } catch (error) {
    console.error('Error rejecting request:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
