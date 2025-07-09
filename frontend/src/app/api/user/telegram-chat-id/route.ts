import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json();
  // Forward the request to the backend
  const response = await fetch(`${apiUrl}/user/telegram-chat-id`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authHeader,
    },
    body: JSON.stringify({ telegramChatId: body.telegramChatId }),
  });
  const data = await response.json();
  if (!response.ok) {
    return NextResponse.json(data, { status: response.status });
  }
  return NextResponse.json(data);
}
