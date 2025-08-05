'use client';

import { useState } from 'react';

export default function TestButtons() {
    const [clickCount, setClickCount] = useState(0);
    const [message, setMessage] = useState('Belum ada klik');

    return (
        <div className="p-8 bg-white min-h-screen">
            <h1 className="text-3xl font-bold mb-8 text-center text-blue-600">
                🧪 TEST TOMBOL REACT 🧪
            </h1>
            
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Counter Display */}
                <div className="p-6 bg-gray-100 rounded-lg text-center">
                    <h2 className="text-xl font-semibold mb-2">Status:</h2>
                    <p className="text-lg">Klik Count: <span className="font-bold text-green-600">{clickCount}</span></p>
                    <p className="text-lg">Message: <span className="font-bold text-purple-600">{message}</span></p>
                </div>

                {/* Test Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        className="px-6 py-4 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold text-lg"
                        onClick={() => {
                            console.log('Tombol Merah diklik!');
                            setClickCount(prev => prev + 1);
                            setMessage('Tombol Merah diklik!');
                            alert('Tombol Merah berhasil diklik!');
                        }}
                    >
                        🔴 TOMBOL MERAH
                    </button>

                    <button
                        className="px-6 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold text-lg"
                        onClick={() => {
                            console.log('Tombol Biru diklik!');
                            setClickCount(prev => prev + 1);
                            setMessage('Tombol Biru diklik!');
                            alert('Tombol Biru berhasil diklik!');
                        }}
                    >
                        🔵 TOMBOL BIRU
                    </button>

                    <button
                        className="px-6 py-4 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold text-lg"
                        onClick={() => {
                            console.log('Tombol Hijau diklik!');
                            setClickCount(prev => prev + 1);
                            setMessage('Tombol Hijau diklik!');
                            alert('Tombol Hijau berhasil diklik!');
                        }}
                    >
                        🟢 TOMBOL HIJAU
                    </button>

                    <button
                        className="px-6 py-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-semibold text-lg"
                        onClick={() => {
                            console.log('Tombol Kuning diklik!');
                            setClickCount(prev => prev + 1);
                            setMessage('Tombol Kuning diklik!');
                            alert('Tombol Kuning berhasil diklik!');
                        }}
                    >
                        🟡 TOMBOL KUNING
                    </button>
                </div>

                {/* Reset Button */}
                <div className="text-center">
                    <button
                        className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"
                        onClick={() => {
                            setClickCount(0);
                            setMessage('Reset berhasil');
                            console.log('Reset clicked');
                        }}
                    >
                        🔄 RESET
                    </button>
                </div>

                {/* Instructions */}
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="font-semibold text-yellow-800 mb-2">Instruksi Test:</h3>
                    <ol className="list-decimal list-inside text-yellow-700 space-y-1">
                        <li>Klik salah satu tombol warna</li>
                        <li>Harus muncul alert popup</li>
                        <li>Counter harus bertambah</li>
                        <li>Message harus berubah</li>
                        <li>Console.log harus muncul di browser console</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
