// frontend/src/app/api/users/count-by-role/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
  try {
    // Anda bisa mengabaikan header Authorization jika endpoint NestJS tidak memerlukan token
    const authHeader = request.headers.get('authorization') || '';

    // Proxy permintaan ke backend NestJS
    const response = await axios.get('http://localhost:3004/users/count-by-role', {
      headers: { Authorization: authHeader },
    });

    return NextResponse.json(response.data, { status: 200 });
  } catch (err: any) {
    console.error('[Proxy GET /users/count-by-role] Error dari NestJS:', err.response?.data || err.message);
    return NextResponse.json(
      { message: err.response?.data?.message || 'Internal server error' },
      { status: err.response?.status || 500 }
    );
  }
}
