'use client';

import { useState, useEffect } from 'react';

export default function AuthDebugPage() {
  const [authStatus, setAuthStatus] = useState<any>({});

  useEffect(() => {
    // Check localStorage for auth data
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');
    const idpegawai = localStorage.getItem('idpegawai');
    const nameDepan = localStorage.getItem('nameDepan');

    setAuthStatus({
      hasToken: !!token,
      tokenLength: token?.length || 0,
      role,
      userId,
      idpegawai,
      nameDepan,
      rawToken: token?.substring(0, 20) + '...' // Show first 20 chars only
    });
  }, []);

  const testAPICall = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('No token found. Please login first.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/shifts', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        alert(`API Success! Found ${data.length} shifts.`);
        console.log('Shifts data:', data);
      } else {
        const errorText = await response.text();
        alert(`API Error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      alert(`Network Error: ${error}`);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🔍 Authentication Debug</h1>
      
      <div className="space-y-6">
        {/* Auth Status */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Has Token:</strong> {authStatus.hasToken ? '✅ Yes' : '❌ No'}
            </div>
            <div>
              <strong>Token Length:</strong> {authStatus.tokenLength} characters
            </div>
            <div>
              <strong>Role:</strong> {authStatus.role || 'Not set'}
            </div>
            <div>
              <strong>User ID:</strong> {authStatus.userId || 'Not set'}
            </div>
            <div>
              <strong>ID Pegawai:</strong> {authStatus.idpegawai || 'Not set'}
            </div>
            <div>
              <strong>Name:</strong> {authStatus.nameDepan || 'Not set'}
            </div>
          </div>
          {authStatus.hasToken && (
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <strong>Token Preview:</strong> {authStatus.rawToken}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-y-3">
            <button
              onClick={testAPICall}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Test API Call to /shifts
            </button>
            <a
              href="/sign-in"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 inline-block"
            >
              Go to Login Page
            </a>
            <a
              href="/dashboard/list/jadwalsaya"
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 inline-block"
            >
              Go to Jadwal Saya
            </a>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-yellow-800">📋 Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-yellow-700">
            <li>Login dengan email dan password yang valid (minimal 6 karakter)</li>
            <li>Setelah login, token akan tersimpan di localStorage</li>
            <li>Klik "Test API Call" untuk mengecek apakah API mengembalikan data</li>
            <li>Jika API berhasil, buka halaman "Jadwal Saya" dan cek calendar</li>
            <li>Jika masih tidak ada jadwal, cek console browser untuk log debug</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
