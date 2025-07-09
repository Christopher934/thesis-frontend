
import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'; // Updated to correct backend port
    
    // Pastikan backend NestJS berjalan di port yang benar
    const response = await axios.get(`${apiUrl}/users/count-by-gender`, {
      headers: { Authorization: authHeader },
    });
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error proxy /users/count-by-gender:', error);
    return NextResponse.json({ message: 'Error proxy count-by-gender' }, { status: 500 });
  }
}