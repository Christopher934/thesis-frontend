'use client';

import { useEffect, useState } from 'react';

export default function LocalStorageDebugPage() {
  const [storageData, setStorageData] = useState<any>({});

  useEffect(() => {
    // Get all relevant data from localStorage
    const data = {
      token: localStorage.getItem('token'),
      role: localStorage.getItem('role'),
      idpegawai: localStorage.getItem('idpegawai'),
      userId: localStorage.getItem('userId'),
      nameDepan: localStorage.getItem('nameDepan'),
      namaBelakang: localStorage.getItem('namaBelakang'),
    };
    
    console.log('LocalStorage Debug:', data);
    setStorageData(data);
  }, []);

  const testAPICall = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('No token found in localStorage. Please login first.');
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
        const shifts = await response.json();
        console.log('API Response - Shifts:', shifts);
        alert(`Success! Found ${shifts.length} shifts. Check console for details.`);
      } else {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        alert(`API Error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Request failed:', error);
      alert(`Request failed: ${error}`);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">🔍 LocalStorage & API Debug</h1>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <h2 className="font-bold mb-2">LocalStorage Data:</h2>
        <pre className="text-xs overflow-auto bg-white p-2 rounded border">
          {JSON.stringify(storageData, null, 2)}
        </pre>
      </div>

      <div className="space-y-4">
        <button 
          onClick={testAPICall}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test API Call to /shifts
        </button>
        
        <div className="text-sm text-gray-600">
          <p>• If token exists, this will test the shifts API endpoint</p>
          <p>• If no token, you need to login first</p>
          <p>• Check browser console for detailed response</p>
        </div>
      </div>
    </div>
  );
}
