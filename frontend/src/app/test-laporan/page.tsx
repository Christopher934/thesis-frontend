'use client';

import { useState, useEffect } from 'react';

export default function TestLaporanPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('No token found');
          return;
        }

        const response = await fetch('/api/laporan?type=absensi', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Test page - received data:', result);
        setData(result);
      } catch (err) {
        console.error('Test page - error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Laporan Page</h1>
      
      <div className="mb-4">
        <div>Loading: {loading ? 'true' : 'false'}</div>
        <div>Error: {error || 'none'}</div>
        <div>Data Length: {data?.length || 0}</div>
      </div>

      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-bold mb-2">Raw Data:</h2>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>

      <div className="mt-4">
        <h2 className="font-bold mb-2">Table:</h2>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">Nama</th>
              <th className="border border-gray-300 p-2">Employee ID</th>
              <th className="border border-gray-300 p-2">Tanggal</th>
              <th className="border border-gray-300 p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td className="border border-gray-300 p-2">{item.nama}</td>
                <td className="border border-gray-300 p-2">{item.employeeId}</td>
                <td className="border border-gray-300 p-2">{item.tanggal}</td>
                <td className="border border-gray-300 p-2">{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
