'use client'; // ✅ Ini penting untuk pakai useState dan useRouter

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
            const res = await axios.post<{ token: string }>('http://localhost:3001/auth/login', {
                email,
                password,
            });
            localStorage.setItem('token', res.data.token);
            setError('');
            router.push('/dashboard');
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
