import { NextResponse } from 'next/server';
import axios from 'axios';

type CountByRoleResponse = {
  counts?: {
    [role: string]: number;
  };
  [key: string]: any;
};

export async function GET(request: Request) {
  try {
    // Get authorization header if available
    const authHeader = request.headers.get('authorization') || '';
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    // Proxy request to NestJS backend
    const response = await axios.get<CountByRoleResponse>(`${apiUrl}/users/count-by-role`, {
      headers: { Authorization: authHeader },
    });

    // Directly return backend result, do NOT inject or default SUPERVISOR count
    return NextResponse.json(response.data, { status: 200 });
  } catch (err: any) {
    console.error('[API Proxy] Error fetching user role counts:', err.response?.data || err.message);
    return NextResponse.json(
      { message: err.response?.data?.message || 'Internal server error' },
      { status: err.response?.status || 500 }
    );
  }
}
