'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import RedirectIfLoggedIn from '@/component/RedirectIfLoggedIn';
import SignInRedirectIfLoggedIn from './SignInRedirectIfLoggedIn';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = await fetch('http://localhost:3004/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      setError('Email atau password salah');
      return;
    }

    const data = await res.json();

    localStorage.setItem('token', data.access_token);
    localStorage.setItem('role', data.user.role);

    if (data.user.role === 'perawat' || data.user.role === 'dokter' || data.user.role === 'staf') {
      router.push('/pegawai');
    } else {
      router.push('/admin');
    }
  };

  return (
    <RedirectIfLoggedIn>
       <SignInRedirectIfLoggedIn />
      <div className="p-10 max-w-md mx-auto">
        <h1 className="text-xl font-bold mb-4">Login RSUD</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="border p-2 w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="border p-2 w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded">
            Login
          </button>
        </form>
      </div>
    </RedirectIfLoggedIn>
  );
}
