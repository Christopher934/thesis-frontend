import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header from the request
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No valid authorization header' }, { status: 401 });
    }

    // Extract token from Bearer header
    const token = authHeader.substring(7);
    
    let decoded: any;
    try {
      // Decode JWT token (in production, you should verify with secret)
      decoded = jwt.decode(token) as any;
      if (!decoded || !decoded.sub) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
    } catch (jwtError) {
      return NextResponse.json({ error: 'Invalid token format' }, { status: 401 });
    }
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const userId = decoded.sub; // Get user ID from JWT token

    try {
      // Fetch user data from backend
      const response = await fetch(`${apiUrl}/users/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        return NextResponse.json({ error: 'Failed to fetch user data' }, { status: response.status });
      }

      const userData = await response.json();
      
      // Transform backend user data to profile format
      const profileData = {
        name: `${userData.namaDepan || ''} ${userData.namaBelakang || ''}`.trim(),
        email: userData.email || '',
        phone: userData.noHp || '',
        birthDate: userData.tanggalLahir ? new Date(userData.tanggalLahir).toISOString().split('T')[0] : '',
        address: userData.alamat || '',
        occupation: userData.role || '',
        bio: `${userData.role} di RSUD Anugerah`,
        avatar: null, // TODO: Add avatar support if needed
        telegramChatId: userData.telegramChatId || ''
      };

      return NextResponse.json(profileData, { status: 200 });
    } catch (fetchError) {
      console.error('Error fetching user data:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in profile API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get the authorization header from the request
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No valid authorization header' }, { status: 401 });
    }

    // Extract token from Bearer header
    const token = authHeader.substring(7);
    
    let decoded: any;
    try {
      // Decode JWT token (in production, you should verify with secret)
      decoded = jwt.decode(token) as any;
      if (!decoded || !decoded.sub) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
    } catch (jwtError) {
      return NextResponse.json({ error: 'Invalid token format' }, { status: 401 });
    }

    // Get the profile data from request body
    const profileData = await request.json();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const userId = decoded.sub; // Get user ID from JWT token

    try {
      // Transform profile data to backend user format
      const [namaDepan, ...namaRest] = (profileData.name || '').split(' ');
      const namaBelakang = namaRest.join(' ');
      
      const updateData = {
        namaDepan: namaDepan || '',
        namaBelakang: namaBelakang || '',
        email: profileData.email || '',
        noHp: profileData.phone || '',
        alamat: profileData.address || '',
        tanggalLahir: profileData.birthDate ? new Date(profileData.birthDate).toISOString() : null,
        telegramChatId: profileData.telegramChatId || null
      };

      // Update user data in backend
      const response = await fetch(`${apiUrl}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        return NextResponse.json({ error: 'Failed to update user data' }, { status: response.status });
      }

      const updatedUser = await response.json();

      // Transform back to profile format
      const updatedProfile = {
        name: `${updatedUser.namaDepan || ''} ${updatedUser.namaBelakang || ''}`.trim(),
        email: updatedUser.email || '',
        phone: updatedUser.noHp || '',
        birthDate: updatedUser.tanggalLahir ? new Date(updatedUser.tanggalLahir).toISOString().split('T')[0] : '',
        address: updatedUser.alamat || '',
        occupation: updatedUser.role || '',
        bio: `${updatedUser.role} di RSUD Anugerah`,
        avatar: profileData.avatar || null,
        telegramChatId: updatedUser.telegramChatId || ''
      };

      return NextResponse.json(updatedProfile, { status: 200 });
    } catch (fetchError) {
      console.error('Error updating user data:', fetchError);
      return NextResponse.json({ error: 'Failed to update user data' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in profile API PUT:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}