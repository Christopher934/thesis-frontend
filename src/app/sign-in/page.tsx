'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const SignInPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async () => {
        try {
            const res = await axios.post<{
                token: string;
                user: {
                    id: number;
                    email: string;
                    role: 'ADMIN' | 'DOKTER' | 'PERAWAT' | 'STAF';
                };
            }>('http://localhost:3004/auth/login', { email, password });

            const { token, user } = res.data;
            localStorage.setItem('token', token);
            localStorage.setItem('role', user.role);

            // arahkan ke dashboard berdasarkan role
            if (user.role === 'ADMIN') {
                router.push('/dashboard/admin');
            } else {
                router.push('/dashboard/pegawai');
            }

        } catch (err: any) {
            setError(err.response?.data?.message || 'Login gagal');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Sign In</h2>
                <input
                    className="w-full mb-4 p-2 border rounded"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                <input
                    className="w-full mb-4 p-2 border rounded"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                {error && <p className="text-red-500 mb-2">{error}</p>}
                <button
                    onClick={handleLogin}
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                >
                    Login
                </button>
            </div>
        </div>
    );
};

export default SignInPage;
