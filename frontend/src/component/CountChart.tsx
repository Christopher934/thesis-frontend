'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Image from "next/image";
import {
    RadialBarChart,
    RadialBar,
    Legend,
    ResponsiveContainer,
    Cell,
} from "recharts";

interface GenderCounts {
  L: number;
  P: number;
}

const CountChart = () => {
    const [genderCounts, setGenderCounts] = useState<GenderCounts>({ L: 0, P: 0 });
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

     useEffect(() => {
    async function fetchCounts() {
      try {
        setLoading(true);
        const res = await axios.get<{ counts: GenderCounts }>('/api/users/count-by-gender');
        setGenderCounts(res.data.counts);
      } catch (err) {
        console.error('Error fetching count-by-gender:', err);
        setError('Gagal ambil data gender');
      } finally {
        setLoading(false);
      }
    }
    fetchCounts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-gray-400">Memuat...</span>
      </div>
    );
  }
  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  const data = [
    { name: 'Laki-laki', count: genderCounts.L, fill: '#C3EBFA' }, // bg-lamaSky
    { name: 'Perempuan', count: genderCounts.P, fill: '#FAE27C' }, // bg-lamaYellow
  ];
  const total = genderCounts.L + genderCounts.P;

    return (
        <div className="bg-white rounded-xl w-full h-full p-4">
            {/* TITLE */}
            <div className="flex justify-between items-center">
                <h1 className="text-lg font-semibold"></h1>
                <Image src="/moreDark.png" alt="" width={20} height={20} />
            </div>
            {/* CHART */}
            <div className="relative w-full h-[75%]">
                <ResponsiveContainer>
                    <RadialBarChart
                        cx="50%"
                        cy="50%"
                        innerRadius="40%"
                        outerRadius="100%"
                        barSize={32}
                        data={data}
                    >
                        <RadialBar background dataKey="count">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </RadialBar>
                    </RadialBarChart>
                </ResponsiveContainer>
                <Image
                    src="/maleFemale.png"
                    alt=""
                    width={50}
                    height={50}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                />
            </div>
            {/* BOTTOM */}
            <div className="flex justify-center gap-16">
                {/* Laki-laki */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-5 h-5 bg-lamaSky rounded-full" />
          <h1 className="font-bold">{genderCounts.L.toLocaleString()}</h1>
          <h2 className="text-xs text-gray-400">
            Laki-laki {total > 0 ? `(${((genderCounts.L / total) * 100).toFixed(0)}%)` : '(0%)'}
          </h2>
        </div>
                 {/* Perempuan */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-5 h-5 bg-lamaYellow rounded-full" />
          <h1 className="font-bold">{genderCounts.P.toLocaleString()}</h1>
          <h2 className="text-xs text-gray-400">
            Perempuan {total > 0 ? `(${((genderCounts.P / total) * 100).toFixed(0)}%)` : '(0%)'}
          </h2>
        </div>
            </div>
        </div>
    );
};

export default CountChart;