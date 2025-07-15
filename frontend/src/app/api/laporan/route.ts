import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    console.log('API Route - Token received:', token ? 'Present' : 'Missing');
    
    if (!token) {
      return NextResponse.json({ error: 'Token tidak ditemukan' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'absensi';
    console.log('API Route - Type:', type);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const lokasiShift = searchParams.get('lokasiShift');
    const tipeShift = searchParams.get('tipeShift');

    let endpoint = `${BASE_URL}/laporan/${type}`;
    const params = new URLSearchParams();
    
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (userId) params.append('userId', userId);
    if (status) params.append('status', status);
    if (lokasiShift) params.append('lokasiShift', lokasiShift);
    if (tipeShift) params.append('tipeShift', tipeShift);

    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    console.log('API Route - Calling backend:', endpoint);
    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('API Route - Backend response status:', response.status);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API Route - Backend response data:', Array.isArray(data) ? `Array with ${data.length} items` : typeof data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching laporan:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil laporan' },
      { status: 500 }
    );
  }
}
