
import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  try {
    // Pastikan backend NestJS berjalan di port 3001
    const response = await axios.get('http://localhost:3004/users/count-by-gender');
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error proxy /users/count-by-gender:', error);
    return NextResponse.json({ message: 'Error proxy count-by-gender' }, { status: 500 });
  }
}