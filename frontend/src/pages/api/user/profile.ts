// Next.js API route to proxy user data from backend
import type { NextApiRequest, NextApiResponse } from 'next';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001'; // changed to 3001 for backend

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // TODO: Replace this with real user ID from session/auth
  const userId = 1;
  if (req.method === 'GET') {
    // Fetch user from backend
    const backendRes = await fetch(`${BACKEND_URL}/users/${userId}`);
    if (!backendRes.ok) {
      return res.status(backendRes.status).json({ message: 'Failed to fetch user' });
    }
    const user = await backendRes.json();
    // Map backend fields to frontend fields
    const profile = {
      name: `${user.namaDepan} ${user.namaBelakang}`,
      email: user.email,
      phone: user.noHp,
      birthDate: user.tanggalLahir?.slice(0, 10) || '',
      address: user.alamat || '',
      occupation: user.role || '',
      bio: '', // No bio in backend
      avatar: null // No avatar in backend
    };
    return res.status(200).json(profile);
  } else if (req.method === 'PUT') {
    // Update user in backend
    const body = req.body;
    // Split name into namaDepan and namaBelakang
    const [namaDepan, ...rest] = body.name.split(' ');
    const namaBelakang = rest.join(' ');
    const updatePayload = {
      email: body.email,
      noHp: body.phone,
      alamat: body.address,
      tanggalLahir: body.birthDate,
      role: body.occupation,
      namaDepan,
      namaBelakang
      // bio and avatar are not supported in backend
    };
    const backendRes = await fetch(`${BACKEND_URL}/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatePayload)
    });
    if (!backendRes.ok) {
      return res.status(backendRes.status).json({ message: 'Failed to update user' });
    }
    const user = await backendRes.json();
    const profile = {
      name: `${user.namaDepan} ${user.namaBelakang}`,
      email: user.email,
      phone: user.noHp,
      birthDate: user.tanggalLahir?.slice(0, 10) || '',
      address: user.alamat || '',
      occupation: user.role || '',
      bio: '',
      avatar: null
    };
    return res.status(200).json(profile);
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
