'use client';

import React from 'react';
import { motion } from 'framer-motion';

const HospitalInfo: React.FC = () => {
  const infoItems = [
    {
      title: 'Sistem Terintegrasi',
      description: 'Manajemen rumah sakit yang terintegrasi untuk semua petugas',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      title: 'Akses Kapanpun',
      description: 'Akses informasi pasien dan jadwal dari mana saja',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      title: 'Keamanan Terjamin',
      description: 'Data dilindungi dengan sistem keamanan terbaik',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
    },
  ];

  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <h4 className="text-center text-sm font-medium text-gray-600 mb-4">
        RSUD Anugerah - Melayani dengan Sepenuh Hati
      </h4>
      
      <div className="grid grid-cols-1 gap-4">
        {infoItems.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + (index * 0.1), duration: 0.4 }}
            className="flex items-start space-x-3"
          >
            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              {item.icon}
            </div>
            <div>
              <h5 className="text-sm font-medium text-gray-800">{item.title}</h5>
              <p className="text-xs text-gray-500">{item.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default HospitalInfo;
