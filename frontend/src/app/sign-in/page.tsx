'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Image from 'next/image';
import dynamic from 'next/dynamic';

// Lazy load heavy components for performance
const RedirectIfLoggedIn = dynamic(() => import('@/components/auth/RedirectIfLoggedIn'), {
  ssr: false
});

const AuthDebug = dynamic(() => import('@/components/auth/AuthDebug'), {
  ssr: false,
  loading: () => null
});

const LoginFooter = dynamic(() => import('@/components/common/LoginFooter'), {
  loading: () => <div className="w-full h-16 bg-gray-100"></div>
});

const SystemNotifications = dynamic(() => import('@/components/common/SystemNotifications'), {
  loading: () => null
});

import { useAuthErrors } from '@/lib/useAuthErrors';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { error, setError, clearError, getErrorDetails } = useAuthErrors();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setIsLoading(true);

    try {
      // Pastikan bahwa apiUrl diproses dengan benar dan tidak undefined
      let apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) apiUrl = 'http://localhost:3001'; // Updated to correct backend port
      
      const res = await fetch(apiUrl + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        setError(getErrorDetails(res.status));
        setIsLoading(false);
        return;
      }

      const data = await res.json();
      
      // Set cookie expiration based on remember me
      const expiryDays = rememberMe ? 7 : 1;
      
      // Store in cookies with proper configuration for middleware
      Cookies.set('token', data.access_token, { 
        expires: expiryDays,
        path: '/',
        sameSite: 'strict'
      });
      Cookies.set('role', data.user.role, {
        expires: expiryDays,
        path: '/',
        sameSite: 'strict'
      });

      // Also store in localStorage for client-side checks
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('role', data.user.role);
      localStorage.setItem('nameDepan', data.user.namaDepan || '');
      localStorage.setItem('nameBelakang', data.user.namaBelakang || '');
      localStorage.setItem('idpegawai', data.user.username || ''); // Store username as idpegawai
      localStorage.setItem('user', JSON.stringify(data.user)); // <-- Tambahkan baris ini
      localStorage.setItem('userId', data.user.id ? data.user.id.toString() : '');

      // Normalize role to lowercase for consistent comparison
      const role = data.user.role.toLowerCase();
      
      if (role === 'perawat' || role === 'dokter' || role === 'staf') {
        router.push('/dashboard/pegawai');
      } else {
        router.push('/dashboard/admin');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Terjadi Kesalahan Saat Masuk. Silakan Coba Lagi.');
      setIsLoading(false);
    }
  };

  return (
    <RedirectIfLoggedIn>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 px-4 sm:px-6 lg:px-8">
        <div 
          className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden"
        >
          {/* Hospital Logo and Header */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-8 text-center">
            <div 
              className="flex justify-center"
            >
              <Image 
                src="/logo.png" 
                alt="RSUD Anugerah Logo" 
                width={64}
                height={64}
                className="h-16 w-auto mb-4 drop-shadow-lg"
                priority
              />
            </div>
            <h2 className="text-2xl font-bold text-white">RSUD ANUGERAH</h2>
            <p className="mt-1 text-blue-100">Sistem Informasi Manajemen</p>
          </div>
          
          {/* Login Form */}
          <div className="px-8 py-6">
            <h3 className="text-center text-lg font-medium text-gray-700 mb-6">
              Masuk ke akun Anda
            </h3>
            
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="nama@rsud.com"
                    className="pl-10 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50 py-2.5 px-3 transition-all duration-200"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`pl-10 pr-10 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50 py-2.5 px-3 transition-all duration-200 ${showPassword ? 'bg-blue-50' : ''}`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-blue-600 focus:outline-none transition-colors duration-200"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />

                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Ingat saya
                  </label>
                </div>

                {/* <div className="text-sm">
                  <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                    Lupa password?
                  </a>
                </div> */}
              </div>

              {error && (
                <div 
                  className="bg-red-50 border-l-4 border-red-500 p-3 rounded shadow-sm"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-600">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 relative"
                >
                  {isLoading ? (
                    <>
                      <span className="opacity-0">Masuk</span>
                      <span className="absolute inset-0 flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </span>
                    </>
                  ) : (
                    "Masuk"
                  )}
                </button>
              </div>
            </form>
            {/* <LoginFooter /> */}
          </div>
        </div>
        
        {/* System Notifications */}
        {/* <SystemNotifications /> */}
        
        {/* Hidden AuthDebug for development */}
        <div className="mt-4 opacity-50 hover:opacity-100 transition-opacity">
          <AuthDebug />
        </div>
      </div>
    </RedirectIfLoggedIn>
  );
}
